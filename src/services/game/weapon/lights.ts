// Nest
import { Injectable } from '@nestjs/common';
import * as THREE from 'three';

// Types
import type { ILight, IUnit } from '../../../models/api';
import type { ISelf } from '../../../models/modules';

// Constants
import { EmitterEvents } from '../../../models/modules';

// Utils
import Helper from '../../utils/helper';
import { RacesConfig } from 'src/models/gameplay';

@Injectable()
export default class Lights {
  public list: ILight[];
  public counter = 0;

  private _direction: THREE.Vector3;
  private _velocity!: THREE.Vector3;
  private _position!: THREE.Vector3;
  // private _item!: IShot;

  constructor() {
    this.list = [];
    this._direction = new THREE.Vector3();
  }

  public onNPCShot(
    self: ISelf,
    message: { unit: IUnit; target: string },
  ): void {
    ++this.counter;
    // console.log('Lights onNPCShot()!', message.unit.race, this.counter);

    // self.scene[message.unit.id].getWorldDirection(this._direction).normalize();
    // this._direction.y = 0;
    this._direction = self.scene[message.target].position
      .sub(
        new THREE.Vector3(
          message.unit.positionX,
          message.unit.positionY,
          message.unit.positionZ,
        ),
      )
      .normalize();
    this._direction.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      0.1 *
        Helper.randomInteger(-1, 1) *
        (Math.random() + 0.5) *
        (1 / RacesConfig[message.unit.race].intelligence),
    );

    this.list.push({
      id: this.counter,
      race: message.unit.race,
      target: message.target,
      location: self.units[message.unit.id],
      positionX: message.unit.positionX,
      positionY:
        message.unit.positionY + RacesConfig[message.unit.race].box.y / 4,
      positionZ: message.unit.positionZ,
      directionX: this._direction.x,
      directionY: this._direction.y,
      directionZ: this._direction.z,
      startX: self.scene[message.target].position.x,
      startY: self.scene[message.target].position.y,
      startZ: self.scene[message.target].position.z,
      directionW: 0,
      rotationY: 0,
      is: false,
    } as ILight);

    // return this._item;
  }

  private _lightOff(id: number) {
    this.list = this.list.filter((item) => item.id !== id);
  }

  public animate(self: ISelf) {
    this.list.forEach((light) => {
      this._velocity = new THREE.Vector3(
        light.directionX,
        light.directionY,
        light.directionZ,
      );

      this._velocity.addScaledVector(
        this._velocity,
        Helper.damping(self.events.delta),
      );

      this._position = new THREE.Vector3(
        light.positionX,
        light.positionY,
        light.positionZ,
      );
      this._position.add(
        this._velocity.clone().multiplyScalar(self.events.delta * 100),
      );
      light.positionX = this._position.x;
      light.positionY = this._position.y;
      light.positionZ = this._position.z;

      if (
        this._position.distanceTo(
          new THREE.Vector3(light.startX, light.startY, light.startZ),
        ) > 300
      ) {
        this._lightOff(light.id);
      } else {
        if (!light.is) {
          if (self.scene[light.target])
            light.is =
              this._position.distanceTo(
                new THREE.Vector3(
                  self.scene[light.target].position.x,
                  self.scene[light.target].position.y,
                  self.scene[light.target].position.z,
                ),
              ) <
              Number(process.env.LIGHT_DAMAGE_DISTANCE) +
                RacesConfig[light.race].box.y / 5;
          else light.is = false;
          if (light.is) {
            self.emiiter.emit(EmitterEvents.npcShotHit, {
              id: light.target,
              race: light.race,
              value: this._position.distanceTo(
                new THREE.Vector3(
                  self.scene[light.target].position.x,
                  self.scene[light.target].position.y,
                  self.scene[light.target].position.z,
                ),
              ),
            });
          }
        }
      }
    });
  }
}
