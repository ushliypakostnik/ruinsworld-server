import * as THREE from 'three';

// Nest
import { Injectable } from '@nestjs/common';

// Types
import type {
  ILocations,
  ILocationsWorld,
  ILocationUnits,
  IPosition,
  ITree,
  IGrass,
  IStone,
  IStone2,
  IBuild,
  IUpdateMessage,
} from '../../../models/api';
import type { ISelf } from '../../../models/modules';

// Constants
import {
  defaultLocation,
  MAP,
  BUILDS_GENERATION,
  STONES_GENERATION,
  GREEN_GENERATION,
} from './config';
import { EmitterEvents } from '../../../models/modules';

// Utils
import Octree from '../../math/octree';
import Helper from '../../utils/helper';

@Injectable()
export default class World {
  public locations: ILocations;
  public design: ILocationsWorld;
  public array: ILocationUnits[];

  private _ids: string[];
  private _item: ILocationUnits;
  private _array: ILocationUnits[];
  private _x: number;
  private _y: number;
  private _number: number;
  private _number2: number;
  private _number3: number;
  private _positions: IPosition[];
  private _position: IPosition;
  private _trees: ITree[];
  private _stones: IStone[];
  private _stones2: IStone2[];
  private _builds: IBuild[];
  private _grasses: IGrass[];
  private _SIZE = Number(process.env.WORLD); // количество "слоев" вокруг центральной локации
  private _helper: Helper;
  private _group: THREE.Group;
  private _mesh: THREE.Mesh;
  private _pseudo: THREE.Mesh;

  private _id: string;
  private _num1: number;
  private _num2: number;

  constructor() {
    this._ids = [];
    this._helper = new Helper();
    this.locations = {};
    this.design = {};
    this.array = [];

    for (let x = 0; x < this._SIZE * 2 + 1; ++x) {
      for (let y = 0; y < this._SIZE * 2 + 1; ++y) {
        const id = Helper.generateUniqueId(2, this._ids);
        this._ids.push(id);

        let config;
        const index = `${(y - this._SIZE).toString()}/${(
          x - this._SIZE
        ).toString()}`;
        if (Helper.isHasProperty(MAP, index)) config = MAP[index];
        else config = defaultLocation(x - this._SIZE, y - this._SIZE);

        this._builds = [];
        if ((x >= this._SIZE - 2 && x <= this._SIZE + 2 && y >= this._SIZE - 2 && y <= this._SIZE + 2)) {
          this._positions = [];
          this._number2 = BUILDS_GENERATION[y][x];
          this._number = Helper.randomInteger(this._number2, Math.round(1.5 * this._number2));
          if (x - this._SIZE === 0 && y - this._SIZE === 0) {
            this._number3 = 2.5;
          } else if (Math.abs(x - this._SIZE) < 2 && Math.abs(y - this._SIZE) < 2) {
            this._number3 = 1.75;
          } else {
            this._number3 = 1.25;
          }
          for (let n = 0; n < this._number; ++n) {
            this._position = this._helper.getUniqueRandomPosition(
              this._positions,
              0,
              0,
              40,
              (process.env.SIZE as unknown as number) * 0.4,
              true,
            );
            this._positions.push(this._position);
            this._builds.push({
              ...this._position,
              scale: Helper.randomInteger(12, Math.round(12 * this._number3)),
              scaleY: Helper.randomInteger(Math.round(15 * this._number3), Math.round(35 * this._number3)),
              rotateX: Helper.randomInteger(-15, 15),
              rotateY: Helper.randomInteger(0, 360),
              rotateZ: Helper.randomInteger(-15, 15),
            });
          }
        }

        this._stones = [];
        this._number2 = STONES_GENERATION[y][x];
        this._number = Helper.randomInteger(Math.round(this._number2 * 1.5), Math.round(2.5 * this._number2));
        this._positions = [];
        for (let n = 0; n < this._number; ++n) {
          // Если есть строения - добавляем камни к ним
          if (this._builds.length > n) {
            this._position.x = this._builds[n].x + Helper.randomInteger(-3, 3) + this._builds[n].scale * Helper.staticPlusOrMinus() / 2;
            this._position.z = this._builds[n].z + Helper.randomInteger(-3, 3) + this._builds[n].scale * Helper.staticPlusOrMinus() / 2;

            this._positions.push(this._position);
            this._num1 = Math.random() * this._number2 + 1;
            this._stones.push({
              ...this._position,
              scaleX: this._num1,
              scaleY: this._num1 * (Math.random() + 1.5),
              scaleZ: this._num1,
              rotateY: Helper.randomInteger(0, 360),
            });
          } else {
            this._position = this._helper.getUniqueRandomPosition(
              this._positions,
              0,
              0,
              0,
              (process.env.SIZE as unknown as number) * 0.4,
              ((x === 0 && y === 0) ||
                (x - this._SIZE === Number(process.env.START_X_HUMANS) && y - this._SIZE === Number(process.env.START_Y_HUMANS)) ||
                (x - this._SIZE === Number(process.env.START_X_REPTILOIDS) && y - this._SIZE === Number(process.env.START_Y_REPTILOIDS))),
            );

            this._positions.push(this._position);
            this._num1 = Math.random() * this._number2 + 0.1;
            this._stones.push({
              ...this._position,
              scaleX: this._num1,
              scaleY: this._num1 * (Math.random() + 1.5),
              scaleZ: this._num1,
              rotateY: Helper.randomInteger(0, 360),
            });
          }
        }

        /*
        this._stones2 = [];
        this._number2 = STONES_GENERATION[y][x];
        this._number = Helper.randomInteger(Math.round(this._number2 * 1.5), Math.round(2.5 * this._number2));
        this._positions = [];
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            0,
            (process.env.SIZE as unknown as number) * 0.4,
            ((x === 0 && y === 0) ||
              (x - this._SIZE === Number(process.env.START_X_HUMANS) && y - this._SIZE === Number(process.env.START_Y_HUMANS)) ||
              (x - this._SIZE === Number(process.env.START_X_REPTILOIDS) && y - this._SIZE === Number(process.env.START_Y_REPTILOIDS))),
          );

          this._positions.push(this._position);
          this._num1 = Math.random() * this._number2 + 0.1;
          this._stones2.push({
            ...this._position,
            scaleX: this._num1,
            scaleY: this._num1 * (Math.random() + 1.5),
            scaleZ: this._num1,
            rotateY: Helper.randomInteger(0, 360),
            model: Helper.randomInteger(1, 6),
          });
        } */

        this._trees = [];
        this._positions = [];
        this._number2 = GREEN_GENERATION[y][x];
        this._number = Helper.randomInteger(this._number2, Math.round(1.5 * this._number2));
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            20,
            (process.env.SIZE as unknown as number) * 0.525,
            true,
          );
          this._positions.push(this._position);
          this._trees.push({
            ...this._position,
            scale: Helper.randomInteger(this._number2, Math.round(3 * this._number2)),
            rotateX: Helper.randomInteger(-1, 15),
            rotateY: Helper.randomInteger(0, 360),
            rotateZ: Helper.randomInteger(-1, 15),
          });
        }

        this._grasses = [];
        this._positions = [];
        this._number2 = GREEN_GENERATION[y][x] / 2;
        this._number = Helper.randomInteger(Math.round(0.5 * this._number2), Math.round(3 * this._number2));
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            20,
            (process.env.SIZE as unknown as number) * 0.45,
            true,
          );
          this._positions.push(this._position);
          this._grasses.push({
            ...this._position,
            scale: Helper.randomInteger(1, 1.5 * this._number2),
          });
        }

        const location = {
          id,
          x: x - this._SIZE,
          y: y - this._SIZE,
        };
        this.locations[id] = {
          ...location,
          users: [],
          npc: [],
        };
        this.design[id] = {
          ...location,
          ...config,
          trees: this._trees,
          stones: this._stones,
          stones2: this._stones2,
          grasses: this._grasses,
          builds: this._builds,
        };
        this.array.push({ ...location, users: [], npc: [] });
      }
    }
  }

  public init(self: ISelf) {
    // Создаем основу для всех локаций - основное "октодерево" каждой локации
    this.array.forEach((location: ILocationUnits) => {
      this._mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          (Number(process.env.SIZE)) * 1.6,
          1,
          (Number(process.env.SIZE)) * 1.6,
        ),
        new THREE.MeshBasicMaterial(),
      );
      this._mesh.position.y = -2.5;
      this._group = new THREE.Group();
      this._group.add(this._mesh);

      // Respauns
      if ((location.x === -3 && location.y === -3) || (location.x === 3 && location.y === 3)) {
          this._mesh = new THREE.Mesh(
            new THREE.BoxBufferGeometry(
              20.5 * 1.25,
              20.5 * 1.25,
              20.5 * 1.25,
            ),
          );
          this._mesh.position.set(0, -2, 0);
          this._group.add(this._mesh);
      }

      // Добавляем камни
      this._pseudo = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 3.25, 6),
        new THREE.MeshBasicMaterial(),
      );
      this.design[location.id].stones.forEach((stone) => {
        this._mesh = this._pseudo.clone();
        this._number = stone.scaleY < 4 ? 1.3 : stone.scaleY > 6 ? 1.2 : 1.1;
        this._number2 = stone.scaleY > 10 ? 0.65 : stone.scaleY > 7 ? 0.75 : 0.85;
        this._mesh.position.set(stone.x, -1 * (3 / stone.scaleY) * stone.scaleY - 3, stone.z);
        this._mesh.scale.set(stone.scaleX * this._number * 1.25, stone.scaleY * this._number2, stone.scaleZ * this._number * 1.25);
        this._mesh.rotateY(Helper.degreesToRadians(stone.rotateY));
        this._group.add(this._mesh);
      });

      // Добавляем строения
      this.design[location.id].builds.forEach((build) => {
        this._mesh = new THREE.Mesh(
          new THREE.BoxGeometry(build.scale * 1.25, build.scaleY, build.scale * 1.25),
          new THREE.MeshBasicMaterial(),
        );
        this._mesh.position.set(build.x, build.scaleY * 0.25, build.z);
        this._mesh.rotateZ(Helper.degreesToRadians(build.rotateZ));
        this._mesh.rotateX(Helper.degreesToRadians(build.rotateX));
        this._mesh.rotateY(Helper.degreesToRadians(build.rotateY));
        this._group.add(this._mesh);
      });

      self.octrees[location.id] = new Octree();
      self.octrees[location.id].fromGraphNode(this._group);
    });

    // addNPC event subscribe
    self.emiiter.on(EmitterEvents.addNPC, (npc) => {
       this._array = this.array.filter(
        (location: ILocationUnits) => !location.users.length,
      );
      // Если тестирование - добовляем либо в центр, либо на любую локацию, в реальной ситуации - если нет локаций без игроков
      if (Number(process.env.IS_TEST) === 1 || !this._array.length) {
        if (Number(process.env.WORLD) === 0) {
          this._num1 = 0;
          this._num2 = 0;
        } else {
          this._num1 = Helper.randomInteger(0, Number(process.env.WORLD)) * Helper.staticPlusOrMinus();
          this._num2 = Helper.randomInteger(0, Number(process.env.WORLD)) * Helper.staticPlusOrMinus();
        }
        this._id = this.getLocationIdByCoords(this._num1, this._num2);
      } else {
        // В реальной ситуации, если есть локации без игроков - на любую такую локацию
        this._num1 = Helper.randomInteger(0, this._array.length - 1);
        this._id = this._array[this._num1].id;
      }
      // console.log('World addNPC', Number(process.env.IS_TEST) === 1, this._num1, this._num2, this._id);
      this._addNPCOnLocation(self, npc.id, this._id);
    });
  }

  public setNewPlayer(self: ISelf, id: string, location: string): void {
    console.log('World setNewPlayer', id);
    this._addPlayerOnLocation(self, id, location);
  }

  public onReenter(message: IUpdateMessage): void {
    this._id = this._getLocationIdByUserId(message.id as string);
    this._removePlayerFromLocation(message.id as string, this._id);
  }

  public getLocationIdByCoords(x: number, y: number): string {
    return this.array.find(
      (location: ILocationUnits) => location.x === x && location.y === y,
    ).id;
  }

  private _getCoordsIdByLocationId(id: string): { x: number; y: number } {
    this._item = this.array.find(
      (location: ILocationUnits) => location.id === id,
    );
    return {
      x: this._item.x,
      y: this._item.y,
    };
  }

  private _getLocationIdByUserId(id: string): string {
    return (
      this.array.find((location: ILocationUnits) => location.users.includes(id))
        .id || ''
    );
  }

  public getLocationIdByNPCId(id: string): string {
    return (
      this.array.find((location: ILocationUnits) => location.npc.includes(id))
        .id || ''
    );
  }

  private _addPlayerOnLocation(self: ISelf, userId: string, locationId: string): void {
    this.locations[locationId].users.push(userId);
    this.array
      .find((location: ILocationUnits) => location.id === locationId)
      .users.push(userId);
    self.units[userId] = locationId;
  }

  private _addNPCOnLocation(self: ISelf, NPCId: string, locationId: string): void {
    this.locations[locationId].npc.push(NPCId);
    this.array
      .find((location: ILocationUnits) => location.id === locationId)
      .npc.push(NPCId);
    self.units[NPCId] = locationId;
  }

  private _removePlayerFromLocation(userId: string, locationId: string): void {
    this.locations[locationId].users = this.locations[locationId].users.filter(
      (user) => user !== userId,
    );
    this._item = this.array.find((location) => location.id === locationId);
    this._item.users = this._item.users.filter((user: string) => user !== userId);
  }

  public removeNPCFromLocation(NPCId: string, locationId: string): void {
    this.locations[locationId].npc = this.locations[locationId].npc.filter(
      (npc) => npc !== NPCId,
    );
    this._item = this.array.find((location) => location.id === locationId);
    this._item.npc = this._item.npc.filter((npc: string) => npc !== NPCId);
  }

  public updatePlayer(id: string): string {
    this._id = this._getLocationIdByUserId(id);
    // console.log('World updatePlayer', id, this._id);
    return this._id;
  }

  public onRelocation(self: ISelf, message: IUpdateMessage): void {
    this._removePlayerFromLocation(
      message.id as string,
      message.location as string,
    );
    const coords: { x: number; y: number } = this._getCoordsIdByLocationId(
      message.location as string,
    );
    this._x = coords.x;
    this._y = coords.y;
    if (message.direction === 'right') this._x += 1;
    else if (message.direction === 'left') this._x -= 1;
    else if (message.direction === 'bottom') this._y += 1;
    else if (message.direction === 'top') this._y -= 1;

    if (Math.abs(this._x) > this._SIZE) {
      if (this._x > 0) this._x -= 1;
      else this._x += 1;
      this._x *= -1;
    }

    if (Math.abs(this._y) > this._SIZE) {
      if (this._y > 0) this._y -= 1;
      else this._y += 1;
      this._y *= -1;
    }
    this._addPlayerOnLocation(
      self,
      message.id as string,
      this.getLocationIdByCoords(this._x, this._y),
    );
    // console.log('World onRelocation', this.locations, this.array);
  }

  public onNPCRelocation(self: ISelf, message: IUpdateMessage): void {
    // console.log('World onNPCRelocation: ', message, this.locations[`${message.location}`]);
    this.removeNPCFromLocation(
      message.id as string,
      message.location as string,
    );
    const coords: { x: number; y: number } = this._getCoordsIdByLocationId(
      message.location as string,
    );
    this._x = coords.x;
    this._y = coords.y;
    if (message.direction === 'right') this._x += 1;
    else if (message.direction === 'left') this._x -= 1;
    else if (message.direction === 'bottom') this._y += 1;
    else if (message.direction === 'top') this._y -= 1;

    if (Math.abs(this._x) > this._SIZE) {
      if (this._x > 0) this._x -= 1;
      else this._x += 1;
      this._x *= -1;
    }

    if (Math.abs(this._y) > this._SIZE) {
      if (this._y > 0) this._y -= 1;
      else this._y += 1;
      this._y *= -1;
    }
    this._addNPCOnLocation(
      self,
      message.id as string,
      this.getLocationIdByCoords(this._x, this._y),
    );
    // console.log('World onNPCRelocation', message, this._x, this._y);
  }
}
