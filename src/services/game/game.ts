import * as THREE from 'three';

// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { ISelf } from '../../models/modules';
import { Fields } from '../../models/modules';
import type {
  IMessage,
  IUpdateMessage,
  IPickMessage,
  IShot,
  IOnExplosion,
  IExplosion,
  IUnit,
  IGameUpdates,
  ILocationUnits,
  IUnitsByLocations,
  IMapUnit,
  IPointMessage,
  IUseMessage,
  IOnUseMessage,
} from '../../models/api';

// Constants
import { EmitterEvents } from '../../models/modules';
import { Moves, Lifecycle, Picks, Races } from '../../models/gameplay';

// Modules
import Events from '../utils/events';
import World from './world/world';
import Users from './units/users';
import Weapon from './weapon/weapon';
import NPC from './units/npc';
import Points from './units/points';
import Things from './units/things';

@Injectable()
export default class Game {
  public world: World;
  public users: Users;
  public weapon: Weapon;
  public npc: NPC;
  public things: Things;
  public points: Points;

  private _events: Events;
  private _self: ISelf;

  private _user!: IUnit;
  private _units!: IUnitsByLocations;

  private _id!: string;
  private _ids!: string[];
  private _p1!: THREE.Vector3;
  private _p2!: THREE.Vector3;
  private _number!: number;
  private _number2!: number;

  private _timeLazyChecks = 0;
  private _isRight = false;
  private _isBottom = false;
  private _result!: string;

  constructor() {
    const EventEmitter = require('events');
    this._events = new Events();
    this._self = {
      emiiter: new EventEmitter(),
      events: this._events,
      octrees: {},
      scene: {},
      unitsByLocations: {},
      units: {},
    };

    this.world = new World();
    this.users = new Users();
    this.weapon = new Weapon();
    this.npc = new NPC();
    this.things = new Things();
    this.points = new Points();

    this.world.init(this._self);
    this.things.init(this._self);
    this.points.init(
      this.world.array.map((location: ILocationUnits) => {
        return {
          id: location.id,
          x: location.x,
          y: location.y,
          isHuman:
            location.x === Number(process.env.START_X_HUMANS) &&
            location.y === Number(process.env.START_Y_HUMANS),
          isReptiloid:
            location.x === Number(process.env.START_X_REPTILOIDS) &&
            location.y === Number(process.env.START_Y_REPTILOIDS),
        };
      }),
    );

    this._self.unitsByLocations = this._getUnitsByLocations();

    this._self.emiiter.on(EmitterEvents.addNPC, () => {
      // console.log('Game addNPC event!!!');
      this._self.unitsByLocations = this._getUnitsByLocations();
    });

    /*
    this._self.emiiter.on(EmitterEvents.addThing, () => {
      // console.log('Game addThing event!!!');
    });
    */

    this._self.emiiter.on(EmitterEvents.removeNPC, (id) => {
      // console.log('Game removeNPC event!!!');
      this.world.removeUnitFromLocation(
        id,
        this.world.getLocationIdByUnitId(id, Fields.npc),
        Fields.npc,
      );
      this._self.unitsByLocations = this._getUnitsByLocations();
    });

    this._self.emiiter.on(EmitterEvents.removeThing, (id) => {
      // console.log('Game removeThing event!!!');
      this.world.removeUnitFromLocation(
        id,
        this.world.getLocationIdByUnitId(id, Fields.things),
        Fields.things,
      );
    });

    this._self.emiiter.on(EmitterEvents.playerKick, (id) => {
      // console.log('Game playerKick event: ', id);
      this.users.onPlayerKick(id);
    });

    this._self.emiiter.on(EmitterEvents.npcShot, (message) => {
      // console.log('Game npcShot event: ', message);
      this.weapon.onNPCShot(this._self, message);
    });

    this._self.emiiter.on(EmitterEvents.npcShotHit, (message) => {
      // console.log('Game npcShotHit event: ', message)
      if (message.id.includes('NPC')) this.npc.onNPCShotHit(message);
      else this.users.onNPCShotHit(message);
    });

    this._animate();
  }

  // Актуальные обновления игрового мира
  public getGameUpdates(location: string): IGameUpdates {
    // console.log('Game getGameUpdates: ', location);
    return {
      point: this.points.obj[location],
      users: this.users.list.filter((user) =>
        this.world.locations[location].users.includes(user.id),
      ),
      things: this.things.list.filter(
        (thing) =>
          this.world.locations[location].things.includes(thing.id),
      ),
      weapon: {
        shots: this.weapon.shots.list.filter(
          (shot) => shot.location === location,
        ),
        lights: this.weapon.lights.list.filter(
          (lights) => lights.location === location,
        ),
      },
      npc: this.npc.getUnitsOnLocation(this.world.locations[location].npc),
    };
  }

  // Взять игровые объекты по локациям
  private _getUnitsByLocations(): IUnitsByLocations {
    this._units = {};
    this.world.array.forEach((location: ILocationUnits) => {
      this._ids = this.world.locations[location.id].users.concat(
        this.world.locations[location.id].npc,
      );
      this._units[location.id] = this.users.listInfo
        .filter((unit) => this._ids.includes(unit.id))
        .concat(
          this.npc.listInfo.filter((unit) => this._ids.includes(unit.id)),
        );
    });
    // console.log('Game _getUnitsByLocations: ', this._units);
    return this._units;
  }

  // Взять игровые объекты на локации
  public getUnitsByLocationsId(id: string): IMapUnit[] {
    if (this.world.locations[id]) {
      this._ids = this.world.locations[id].users.concat(
        this.world.locations[id].npc,
      );
      // console.log('Game _getUnitsByLocations: ', this._units);
      return this.npc
        .getList()
        .filter(
          (npc) =>
            this._ids.includes(npc.id) && npc.lifecycle !== Lifecycle.born,
        )
        .concat(
          this.users.getList().filter((user) => this._ids.includes(user.id)),
        )
        .map((unit) => {
          return {
            id: unit.id,
            race: unit.race,
            x: unit.positionX / Number(process.env.SIZE),
            y: unit.positionZ / Number(process.env.SIZE),
            isDead: unit.lifecycle === Lifecycle.dead,
          };
        });
    }
  }

  // Знакомый игрок
  public updatePlayer(id: string): IUpdateMessage {
    this._user = this.users.updatePlayer(id);
    // console.log('updatePlayer: ', this._user);

    this._id = this.world.updatePlayer(id);
    return {
      location: this._id,
      ...this._user,
    };
  }

  // Проверка идентификатора игрока
  public checkPlayerId(id: string): boolean {
    return this.users.checkPlayerId(id);
  }

  // Очистка
  private _cleanCheck(self: ISelf): void {
    this.users.cleanCheck(self);
    this._self.unitsByLocations = this._getUnitsByLocations();
  }

  // Взять айди стартовой локации по расе
  private _getStartLocationIdByRace(race: string): string {
    // console.log('Game _getStartLocationIdByRace: ', race);
    if (Number(process.env.WORLD) === 0)
      return this.world.getLocationIdByCoords(0, 0);
    else if (race === Races.reptiloid)
      return this.world.getLocationIdByCoords(
        Number(process.env.START_X_REPTILOIDS),
        Number(process.env.START_Y_REPTILOIDS),
      );
    return this.world.getLocationIdByCoords(
      Number(process.env.START_X_HUMANS),
      Number(process.env.START_Y_HUMANS),
    );
  }

  // Заход игрока
  public onEnter(message: IUpdateMessage): IUpdateMessage {
    // console.log('Game onEnter: ', message);
    // Добавляем игрока
    this._user = this.users.setNewPlayer(this._self, message);

    // Выставляем стартовую локацию:
    // Либо последнюю на которой был клиент, если на ней установлен правильный флаг игровой расы
    // Или - с локаций на которых нельзя сменить флаг
    if (
      message.location &&
      this.points.obj[message.location as string] &&
      this.points.obj[message.location as string].status === message.race
    ) {
      this._id = message.location as string;
    } else this._id = this._getStartLocationIdByRace(message.race as string);

    // И проверяем юниты
    this.world.setNewPlayer(this._self, this._user.id as string, this._id);

    this._afterEnterToggle();
    // console.log('Game onEnter setNewPlayer: ', this._user);

    return {
      location: this._id,
      ...this._user,
    };
  }

  // Перезаход игрока
  public onReenter(message: IUpdateMessage): void {
    // hgconsole.log('Game onReenter: ', message);
    this.users.onReenter(this._self, message);
    this.world.onReenter(message);
    this._afterEnterToggle();
  }

  // После входа или выхода
  private _afterEnterToggle(): void {
    this._self.unitsByLocations = this._getUnitsByLocations();
    this._checkUnits();
  }

  // Релокация игрока
  public onRelocation(message: IUpdateMessage): void {
    this.users.onRelocation(this._self, message);
    this.world.onRelocation(this._self, message);
    this._self.unitsByLocations = this._getUnitsByLocations();
    this._checkUnits();
  }

  // Завершение релокации игрока
  public onLocation(id: string): void {
    this.users.onLocation(id);
  }

  // Релокация неписи
  private _onNPCRelocation(message: IUpdateMessage): void {
    this.npc.onNPCRelocation(this._self, message);
    this.world.onNPCRelocation(this._self, message);
    this._self.unitsByLocations = this._getUnitsByLocations();
  }

  // На обновления от клиентов
  public onUpdateToServer(message: IUpdateMessage): void {
    this.users.onUpdateToServer(this._self, message);
  }

  // На выстрел
  public onShot(message: IShot): IShot {
    return this.weapon.onShot(message);
  }

  // Выстрел умер
  public onUnshot(message: number): string {
    return this.weapon.onUnshot(message);
  }

  // На взрыв от умирания выстрела
  public onUnshotExplosion(message: IExplosion): void {}

  // На взрыв (для отправки на клиенты)
  public onExplosion(message: IExplosion): IOnExplosion {
    this.weapon.onExplosion(message.id);

    return {
      message,
      updates: {
        users: this.users.onExplosion(message),
        npc: this.npc.onExplosion(message),
      },
    };
  }

  // На самоповреждение
  public onSelfharm(message: IUpdateMessage): IUpdateMessage {
    return this.users.onSelfharm(message);
  }

  // На смену флага на локации
  public onPoint(message: IPointMessage): number {
    this.points.onPoint(message);
    return this.users.onPoint(message);
  }

  // Игрок использовал предмет
  public onUse(message: IUseMessage): IOnUseMessage {
    return this.users.onUse(message);
  }

  // Игрок подобрал что-то
  public onPick(message: IPickMessage): number | null {
    switch (message.type) {
      case Picks.dead:
        this._number2 = this.npc.onPickDead(this._self, message.id);
        this._number = this.users.onPickDead(message, this._number2);
        return this._number;
      case Picks.thing:
        this.things.onPickThing(this._self, message.id);
        this._number = this.users.onPickThing(message);
        return this._number;
    }
    return null;
  }

  // Игрок умер
  public onUserDead(message: IMessage): void {
    this.users.onUserDead(message.id);
    this._self.unitsByLocations = this._getUnitsByLocations();
  }

  // Ленивая проверка неписей
  private _lazyChecks(self: ISelf): void {
    // console.log('Game _lazyChecks!!!');
    this.npc.lazyCheck(); // Убиваем слишком старых (для баланса среди неписей)
    this.things.lazyCheck(self); // Перемещаем слишком старые (для баланса)

    this._number = 0;
    this.npc.getList().forEach((npc) => {
      this._id = this.world.getLocationIdByUnitId(npc.id, Fields.npc);
      this._p1 = new THREE.Vector3(npc.positionX, npc.positionY, npc.positionZ);
      this._p2 = new THREE.Vector3(0, 0, 0);

      // console.log(npc.positionX, npc.positionZ, this._p1.distanceTo(this._p2));

      // Выход на другую локацию
      if (this._p1.distanceTo(this._p2) > Number(process.env.SIZE) * 0.7) {
        ++this._number;
        this._isRight = npc.positionX >= 0;
        this._isBottom = npc.positionZ >= 0;
        if (Math.abs(npc.positionX) >= Math.abs(npc.positionZ)) {
          if (this._isRight) this._result = Moves.right;
          else this._result = Moves.left;
        } else {
          if (this._isBottom) this._result = Moves.bottom;
          else this._result = Moves.top;
        }
        this._onNPCRelocation({
          id: npc.id,
          direction: this._result,
          location: this._id,
        });
      }
    });
    if (this._number > 0) this._checkUnits();
  }

  // Главная оптимизирующая механика
  private _checkUnits() {
    ////////////////////////////////////////////////////////////////////////////////////////
    // Тестировние нагрузки!!!
    ////////////////////////////////////////////////////////////////////////////////////////
    if (Number(process.env.FULL_TEST) === 0) {
      this.world.array.forEach((location: ILocationUnits) => {
        this._ids = this.world.locations[location.id].npc;

        if (this.world.locations[location.id].users.length > 0) {
          // console.log('Game _checkUnits: ', location.id, this.world.locations[location.id].users);
          this.npc.toggleSleep(this._ids, false);
        } else this.npc.toggleSleep(this._ids, true);
      });
    }
  }

  private _animate(): void {
    this._events.animate();

    // console.log('Game animate delta: ', this._self.events.delta, this.things.list.length);

    this.npc.animate(this._self);
    this.users.animate(this._self);
    this.weapon.animate(this._self);
    this.things.animate(this._self);

    // Ленивые проверки - которые можно делать редко
    this._timeLazyChecks += this._self.events.delta;
    if (this._timeLazyChecks > Number(process.env.LAZY_CHECKS_SECONDS)) {
      this._lazyChecks(this._self);
      this._cleanCheck(this._self);

      this._timeLazyChecks = 0;
    }

    setTimeout(() => {
      this._animate();
    }, 0);
  }
}
