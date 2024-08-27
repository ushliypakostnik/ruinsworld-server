import * as THREE from 'three';

// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { ISelf } from '../../../models/modules';
import {
  IUserBack,
  IUpdateMessage,
  IExplosion,
  IUnitInfo,
  IUnit,
  IPickMessage,
} from '../../../models/api';

// Modules
import Unit from './unit';

// Utils
import Helper from '../../utils/helper';
import { Lifecycle, Races } from 'src/models/gameplay';

@Injectable()
export default class Users {
  public list: Unit[];
  public listBack: IUserBack[];
  public listInfo: IUnitInfo[];
  public counter = 0;

  private _updates!: IUpdateMessage[];
  private _item!: Unit;
  private _itemBack!: IUserBack;
  private _itemInfo!: IUnitInfo;
  private _string!: string;
  private _v1!: THREE.Vector3;
  private _v2!: THREE.Vector3;
  private _mesh!: THREE.Mesh;
  private _number!: number;
  private _helper!: Helper;

  private _START = {
    lifecycle: Lifecycle.born,
    health: 100,
    name: null,
    positionX: 0,
    positionY: 0.1,
    positionZ: 0,
    directionX: -0.7,
    directionY: 0,
    directionZ: 0.7,
    directionW: 0,
    rotationY: 0,
    animation: 'stand',
    isSleep: false,
    isJump: false,
    isOnHit2: false,
    exp: 0,
  };

  constructor() {
    this.list = [];
    this.listBack = [];
    this.listInfo = [];
    this._helper = new Helper();
  }

  // Utils

  public getList(): IUnit[] {
    return this.list;
  }

  private _getUserById(id: string): Unit {
    return this.list.find((player) => player.id === id);
  }

  private _getUserInfoById(id: string): IUnitInfo {
    return this.listInfo.find((player) => player.id === id);
  }

  private _getUserBackById(id: string): IUserBack {
    return this.listBack.find((player) => player.id === id);
  }

  private _getIds() {
    return this.listBack.map((player) => {
      return player.id;
    });
  }

  // Gameplay

  // Проверка айди игрока который стучиться
  public checkPlayerId(id: string): boolean {
    console.log('Users checkPlayerId: ', id, this.list);
    return !!this.list.find((player) => player.id === id);
  }

  // Установка нового игрока
  public setNewPlayer(self: ISelf, message: IUpdateMessage): Unit {
    ++this.counter;
    this._string = Helper.generateUniqueId(4, this._getIds());
    this._item = new Unit(this._string);
    this._item = {
      ...this._item,
      ...this._START,
      positionX: Helper.randomInteger(1, 2) * Helper.staticPlusOrMinus(),
      positionZ: Helper.randomInteger(1, 2) * Helper.staticPlusOrMinus(),
      name: message.name as string,
      race: message.race as Races,
    };
    this.list.push(this._item as Unit);
    this._number = Helper.getUnixtime();
    this.listBack.push({
      id: this._string,
      start: this._number,
      time: this._number,
    });

    // Добавляем коробку
    this._mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 1.8, 0.75),
      new THREE.MeshBasicMaterial(),
    );
    this.listInfo.push({
      id: this._item.id,
      mesh: this._mesh.uuid,
      animation: this._item.animation,
      race: this._item.race as Races,
    });
    self.scene[this._item.id] = this._mesh;

    // console.log('Users setNewPlayer', this._item);
    return this._item;
  }

  // Игрок перезагрузился
  public updatePlayer(id: string): Unit {
    this._item = this._getUserById(id);
    console.log('Users updatePlayer: ', this._item);
    return this._item;
  }

  // Удаление игрока
  private _removePlayer(self: ISelf, id: string): void {
    // console.log('Users _removePlayer!!!', id, self.scene[id]);
    this._item = this._getUserById(id as string);
    if (this._item) {
      if (self.scene[id]) delete self.scene[id];
      this.list = this.list.filter((player) => player.id !== id);
      this.listBack = this.listBack.filter((player) => player.id !== id);
      this.listInfo = this.listInfo.filter((player) => player.id !== id);
    }
  }

  // На играть заново
  public onReenter(self: ISelf, message: IUpdateMessage): void {
    // console.log('Users onReenter: ', message);
    this._removePlayer(self, message.id as string);
  }

  // На пинок по игроку
  public onPlayerKick(message: { id: string; value: number }): void {
    this._item = this._getUserById(message.id as string);
    // console.log('Users onPlayerKick: ', message);
    if (this._item) {
      this._item.isOnHit2 = true;
      this._item.health -=
        message.value / (this._item.animation.includes('hide') ? 2 : 1);
      setTimeout(() => {
        // console.log('Users onPlayerKick: ', message);
        this._item = this._getUserById(message.id as string);
        if (this._item) this._item.isOnHit2 = false;
      }, 125);
    }
  }

  // На попадание дальним по игроку
  public onNPCShotHit(message: {
    id: string;
    race: Races;
    value: number;
  }): void {
    this._item = this._getUserById(message.id as string);
    // console.log('Users onNPCShotHit: ', message);
    if (this._item) {
      this._item.isOnHit2 = true;
      this._item.health -= this._helper.getDamage(
        'light',
        message.race,
        this._item.race,
        message.value,
        false,
        this._item.animation.includes('hide'),
      );
      setTimeout(() => {
        // console.log('Users onNPCShotHit: ', message);
        this._item = this._getUserById(message.id as string);
        if (this._item) this._item.isOnHit2 = false;
      }, 125);
    }
  }

  // На взрыв
  public onExplosion(message: IExplosion): IUpdateMessage[] {
    // console.log('Users onExplosion!!!', message);
    this._updates = [];
    this.list
      .filter(
        (player) =>
          new THREE.Vector3(
            message.positionX,
            message.positionY,
            message.positionZ,
          ).distanceTo(
            new THREE.Vector3(
              player.positionX,
              player.positionY,
              player.positionZ,
            ),
          ) < Number(process.env.EXPLOSION_DISTANCE),
      )
      .forEach((player: Unit) => {
        this._v1 = new THREE.Vector3(
          message.positionX,
          message.positionY,
          message.positionZ,
        );
        this._v2 = new THREE.Vector3(
          player.positionX,
          player.positionY,
          player.positionZ,
        );
        if (
          this._v1.distanceTo(this._v2) < Number(process.env.EXPLOSION_DISTANCE)
        ) {
          this._number = 1;
          if (message.player === player.id)
            this._number = Number(process.env.SELF_DAMAGE);
          // Если это выстрел игрока - ущерб сильнее
          // При попадании по коробке - ущерб сильнее
          // Если режим скрытый - в два раза меньше
          player.health -=
            this._helper.getDamage(
              'shot',
              null,
              player.race,
              this._v1.distanceTo(this._v2),
              player.id === message.enemy,
              player.animation.includes('hide'),
            ) * this._number;
          this._updates.push({
            id: player.id,
            health: player.health,
            is: player.id === message.enemy,
          });
        }
        if (player.health < 0) {
          player.lifecycle = Lifecycle.dead;
          player.animation = 'dead';
        }
      });
    return this._updates;
  }

  // Самоповреждение
  public onSelfharm(message: IUpdateMessage): IUpdateMessage {
    // console.log('Users onSelfharm: ', message);
    this._item = this._getUserById(message.id as string);
    this._item.health -= message.value as number;
    return {
      id: message.id,
      health: this._item.health,
    };
  }

  // Игрок загрузился на локации
  onLocation(id: string): void {
    this._item = this._getUserById(id as string);
    if (this._item) this._item.lifecycle = Lifecycle.idle;
  }

  // На переход на другую локацию
  public onRelocation(self: ISelf, message: IUpdateMessage): void {
    this._item = this._getUserById(message.id as string);
    console.log('Users onRelocation: ', message, this._item, this.list);
    this._item.lifecycle = Lifecycle.born;

    if (message.direction === 'right' || message.direction === 'left')
      this._item.positionX *= -1;
    else if (message.direction === 'top' || message.direction === 'bottom')
      this._item.positionZ *= -1;

    this._v1 = new THREE.Vector3(
      this._item.positionX,
      0,
      this._item.positionZ,
    ).multiplyScalar(0.85);

    this._item.positionX = this._v1.x;
    this._item.positionY = 0;
    this._item.positionZ = this._v1.z;

    this._mesh = self.scene[this._item.id];
    if (this._mesh) {
      if (this._item.animation.includes('hide'))
        this._mesh.position.set(this._v1.x, -0.4, this._v1.z);
      else this._mesh.position.set(this._v1.x, -0.6, this._v1.z);
    }
  }

  // Пришли обновления от клиента
  public onUpdateToServer(self: ISelf, message: IUpdateMessage): void {
    // console.log('Users onUpdateToServer: ', message);
    this._item = this._getUserById(message.id as string);
    if (this._item) {
      for (let property in message) {
        if (property != 'id') {
          if (property === 'time') {
            this._itemBack = this._getUserBackById(message.id as string);
            this._itemBack.time = message[property] as number;
            // console.log('Users onUpdateToServer with time: ', this._itemBack.id, message[property]);
          } else {
            if (
              property === 'animation' &&
              message[property] &&
              this._item.animation !== message[property]
            ) {
              /* console.log(
                'Users onUpdateToServer АНИМАЦИЯ!!!!',
                message[property],
              ); */

              // Если сменился режим скрытности - изменяем размер коробки
              if (
                ((message[property] as string).includes('hide') &&
                  !this._item.animation.includes('hide')) ||
                (!(message[property] as string).includes('hide') &&
                  this._item.animation.includes('hide'))
              ) {
                this._itemInfo = this._getUserInfoById(message.id as string);
                this._mesh = self.scene[this._itemInfo.id];
                if (this._mesh) {
                  if ((message[property] as string).includes('hide'))
                    this._mesh.scale.set(1, 0.6, 1);
                  else this._mesh.scale.set(1, 1, 1);
                }
              }
            }

            this._item[property] = message[property];
          }
        }
      }
    }
  }

  public animate(self: ISelf): void {
    this.list.forEach((user) => {
      this._mesh = self.scene[user.id];
      if (this._mesh) {
        if (user.health > 0) {
          if (user.health < 100)
            user.health += self.events.delta * Number(process.env.REGENERATION);
          if (user.health > 100) user.health = 100;
        }

        if (user.animation.includes('hide'))
          this._mesh.position.set(
            user.positionX,
            user.positionY - 0.4,
            user.positionZ,
          );
        else
          this._mesh.position.set(
            user.positionX,
            user.positionY - 0.6,
            user.positionZ,
          );
      }
    });
  }

  // Очищение проигравших игроков
  public cleanCheck(self: ISelf): void {
    this._number = Helper.getUnixtime();
    this.list
      .filter((player) => player.lifecycle === Lifecycle.dead)
      .forEach((player: IUnit) => {
        console.log('Users cleanCheck!!!', this._number, player);
        this._itemBack = this._getUserBackById(player.id);
        if (
          this._itemBack &&
          this._number - this._itemBack.time > Number(process.env.CLEAN_CHECK_TIME)
        )
          this._removePlayer(self, player.id);
      });
  }

  // Игрок умер
  public onUserDead(id: string): void {
    this._itemInfo = this._getUserInfoById(id as string);
    if (this._itemInfo) this._itemInfo.animation = 'dead';
  }

  // Игрок что-то подобрал
  public onPickDead(message: IPickMessage): number {
    this._item = this._getUserById(message.user as string);
    if (this._item) {
      switch (message.text) {
        case Races.bidens:
          this._item.exp += 450;
          break;
        case Races.mutant:
          this._item.exp += 300;
          break;
        case Races.orc:
          this._item.exp += 200;
          break;
        case Races.soldier:
          this._item.exp += 100;
          break;
        case Races.cyborg:
          this._item.exp += 100;
          break;
        case Races.zombie:
          this._item.exp += 50;
          break;
      }
      return this._item.exp;
    }
    return null;
  }
}
