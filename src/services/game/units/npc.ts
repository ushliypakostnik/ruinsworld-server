import * as THREE from 'three';
import { Injectable } from '@nestjs/common';

// Types
import type {
  ISelf,
  IUnitColliders,
  IUnitCollider,
} from '../../../models/modules';
import type {
  TResult,
  TRayResult,
} from '../../../models/utils';
import type {
  IUnit,
  IUnitInfo,
  IExplosion,
  IUpdateMessage,
} from '../../../models/api';

// Constants
import { EmitterEvents } from '../../../models/modules';
import { Lifecycle, Races, RacesConfig } from '../../../models/gameplay';

// Utils
import Capsule from '../../../services/math/capsule';
import Helper from '../../utils/helper';
import Octree from '../../math/octree';

// Modules
import Unit from './unit';

@Injectable()
export default class NPC {
  public list: IUnit[];
  public listInfo: IUnitInfo[];
  public colliders: IUnitColliders;
  public counter = 0;
  public counters = {
    [Races.bidens]: 0,    
    [Races.mutant]: 0,    
    [Races.orc]: 0,    
    [Races.zombie]: 0,    
    [Races.soldier]: 0,    
    [Races.cyborg]: 0,    
  };

  private _collider: IUnitCollider;
  private _item!: IUnit;
  private _itemInfo!: IUnitInfo;
  private _id: string;
  private _listInfo2!: IUnitInfo[];
  private _listInfo3!: IUnitInfo[];
  private _mesh: THREE.Mesh;
  private _v: THREE.Vector3;
  private _group: THREE.Group | null;
  private _octree: Octree;
  private _isOnFloor = false;
  private _result!: TResult;
  private _result2!: TResult;
  private _result3!: TRayResult;
  private _speed = Number(process.env.NPC_SPEED);
  private _direction: THREE.Vector3;
  private _updates!: IUpdateMessage[];
  private _listAnimate!: IUnit[];
  private _listSleepAnimate!: IUnit[];
  private _listSleepAnimateResult!: IUnit[];
  private _number!: number;
  private _number2!: number;
  private _string!: string;
  private _v1!: THREE.Vector3;
  private _v2!: THREE.Vector3;
  private _timerStartCreate = 0;
  private _timerLazyCheck = 0;
  private _box!: { x: number, y: number, z: number };
  private _angle!: number;
  private _ray!: THREE.Ray;
  private _helper!: Helper;

  private _START = {
    positionX: 0,
    positionY: 50,
    positionZ: 0,
    directionX: 0,
    directionY: 1,
    directionZ: 0,
    directionW: 0,
    rotationY: 0,
    isSleep: false,
    lifecycle: Lifecycle.born,
    name: 'NPC',
    health: 100,
    animation: 'jump',
    isJump: false,
    isFire: false,
    isOnHit: false,
    isOnHit2: false,
  }

  private _RACES = [
    Races.bidens,
    Races.mutant,
    Races.orc,
    Races.zombie,
    Races.soldier,
    Races.cyborg,
  ];

  constructor() {
    this.list = [];
    this.listInfo = [];
    this.colliders = {};
    this._v = new THREE.Vector3();
    this._direction = new THREE.Vector3();
    this._helper = new Helper();
  }

  private _getNPCById(id: string): IUnit {
    return this.list.find((unit) => unit.id === id);
  }

  public getList(): IUnit[] {
    return this.list;
  }

  // Взять неписей на локации
  public getNPCOnLocation(ids: string[]): IUnit[] {
    return this.list.filter((unit) => ids.includes(unit.id));
  }

  // На релокацию неписей
  public onNPCRelocation(self: ISelf, message: IUpdateMessage): void {
    this._item = this._getNPCById(message.id as string);
    // console.log('NPC onNPCRelocation!!!!!!!!!!!!!: ', this._item);
    if (this._item) {
      if (message.direction === 'right' || message.direction === 'left')
        this._item.positionX *= -1;
      else if (message.direction === 'top' || message.direction === 'bottom')
        this._item.positionZ *= -1;

      this._v1 = new THREE.Vector3(
        this._item.positionX,
        0,
        this._item.positionZ,
      ).multiplyScalar(0.85);

      this._box = RacesConfig[this._item.race].box;
      this._item.positionX = this._v1.x;
      this._item.positionY = 0;
      this._item.positionZ = this._v1.z;

      this._collider = this.colliders[this._item.id];
      if (this._collider) {
        this._collider.collider.start.x = this._item.positionX;
        this._collider.collider.start.y = this._box.y;
        this._collider.collider.start.z = this._item.positionZ;
        this._collider.collider.end.x = this._item.positionX;
        this._collider.collider.end.y = this._item.positionY;
        this._collider.collider.end.z = this._item.positionZ;

        if (self.scene[this._item.id]) {
          self.scene[this._item.id].position.set(
            this._item.positionX,
            this._item.positionY + this._box.y / 2,
            this._item.positionZ,
          );
        }
      }
    }
  }

  // Добавить юнит
  public addUnit(self: ISelf, id?: string) {
    // console.log('NPC addUnit!!!', this.counter, id);
    ++this.counter;
    if (id) this._id = id;
    else this._id = `NPC1/${this.counter}`;
    this._item = new Unit(this._id);

    this._string = this._RACES[Helper.randomInteger(0, this._RACES.length - 1)];
    // this._string = 'mutant';
    this._item = {
      ...this._item,
      ...this._START,
      race: this._string as Races,
    };
    this._item.positionX += Helper.randomInteger(-100, 100) + 10;
    this._item.positionZ += Helper.randomInteger(-100, 100) + 10;
    this._item.positionY = 30;

    this.list.push(this._item);

    if (id) {
      self.scene[id].position.set(this._item.positionX, this._item.positionY, this._item.positionZ);
      this.listInfo.push({
        id: this._id,
        mesh: this._mesh.uuid,
        animation: this._item.animation,
        race: this._item.race as Races,
      });
    } else {
      // Добавляем коробку
      this._box = RacesConfig[this._string].box;
      this._mesh = new THREE.Mesh(
        new THREE.BoxGeometry(this._box.x, this._box.y, this._box.z),
        new THREE.MeshBasicMaterial(),
      );
      this._mesh.position.set(this._item.positionX, this._item.positionY, this._item.positionZ);
      this.listInfo.push({
        id: this._id,
        mesh: this._mesh.uuid,
        animation: this._item.animation,
        race: this._item.race as Races,
      });
      self.scene[this._id] = this._mesh;
    }

    // if (id) console.log('NPC addUnit!!!', this._item);

    // Колайдер
    this.colliders[this._id] = {
      collider: new Capsule(
        new THREE.Vector3(
          this._item.positionX,
          this._item.positionY + this._box.y / 2,
          this._item.positionZ,
        ),
        new THREE.Vector3(
          this._item.positionX,
          this._item.positionY - this._box.y / 2,
          this._item.positionZ,
        ),
        1,
      ),
      velocity: new THREE.Vector3(),
      isNotJump: false,
      isForward: false,
      isJump: false,
      isJump2: false,
      isCry: false,
      isAttack: false,
      isAttack2: false,
      isKick: false,
      isKick2: false,
      isBackward: false,
      backwardTimer: 0,
      timer: 0,
      timerNo: 0,
      timerNoLimit: 1,
      isBend: false,
      bend: 0,
      bendTimer: 0,
      bendTimerLimit: 0,
      octree: new Octree(),
      target: '',
      isHit: false,
      nextLifecycle: null,
    };
    
    // addNPC event emit
    self.emiiter.emit(EmitterEvents.addNPC, this._item);
  }

  // Засыпают или просыпаются
  public toggleSleep(ids: string[], is: boolean): void {
    // console.log('NPC sleep!: ', message);
    this.list
      .filter((unit) => unit.lifecycle !== Lifecycle.born)
      .filter((unit) => ids.includes(unit.id)).forEach((unit) => unit.isSleep = is);
  }

  // Столкновения
  private _collitions(
    self: ISelf,
    collider: IUnitCollider,
    locationId: string,
    id: string,
  ): void {
    if (self.octrees[locationId]) {
      this._isOnFloor = false;
      this._result = self.octrees[locationId].capsuleIntersect(
        collider.collider,
      );
      if (this._result) {
        this._isOnFloor = this._result.normal.y > 0;

        if (!this._isOnFloor) {
          collider.velocity.addScaledVector(
            this._result.normal,
            -this._result.normal.dot(collider.velocity),
          );
        }

        collider.collider.translate(
          this._result.normal.multiplyScalar(this._result.depth),
        );
      }
      this.colliders[id].isNotJump = this._isOnFloor;
    }

    if (collider.octree) {
      this._result2 = collider.octree.capsuleIntersect(collider.collider);
      if (this._result2) {
        collider.collider.translate(
          this._result2.normal.multiplyScalar(this._result2.depth),
        );
      }
    }
  }

  // Юниты которым нужно построить октомодель в этом кадре
  private _isNeedOctreeUnit(unit: IUnit) {
    if (unit.animation === 'idle' || unit.lifecycle === Lifecycle.dead) return false;
    return true;
  }

  // Видит ли юнит цель?
  private _isUnitSeeTarget(self: ISelf, unit: IUnit, target: THREE.Vector3, locationId: string, height: number) {
    this._v2 = new THREE.Vector3(
      self.scene[unit.id].position.x,
      self.scene[unit.id].position.y + height / 2,
      self.scene[unit.id].position.z,
    );
    this._v1 = new THREE.Vector3(0, 0, 0).subVectors(target, this._v2).normalize();
    this._v1.y = 0;
    this._ray = new THREE.Ray(this._v2, this._v1);
    this._result3 = self.octrees[locationId].rayIntersect(this._ray);

    self.scene[unit.id].getWorldDirection(this._direction);
    this._direction.y = 0;
    this._angle = this._v1.angleTo(this._direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));

    // console.log('NPC _isUnitSeeTarget', this._v2.distanceTo(target), Helper.radiansToDegrees(this._angle));
    // console.log('NPC _isUnitSeeTarget', unit.id, target, this._result3 && this._result3.distance, this._v2.distanceTo(target));

    // "Спиной" видит во время атаки
    if (unit.lifecycle === Lifecycle.attention || unit.lifecycle === Lifecycle.idle) {
      if ((this._result3 && this._result3.distance < this._v2.distanceTo(target)) ||
        Helper.radiansToDegrees(this._angle) < (90 - (45 * RacesConfig[unit.race].intelligence)) ||
        Helper.radiansToDegrees(this._angle) > (90 + (45 * RacesConfig[unit.race].intelligence))) return false;
      return true;
    }

    if (this._result3 && this._result3.distance < this._v2.distanceTo(target)) return false;
    return true;
  }

  // Проверка отношений
  private _checkUnit(self: ISelf, unit: IUnit, collider: IUnitCollider, height: number) {
    // console.log('NPC _checkUnit: ', unit);

    this._listInfo2 = self.unitsByLocations[self.units[unit.id]]
      .filter(
        (item) =>
          item.animation !== 'dead' &&
          item.id !== unit.id &&
          RacesConfig[unit.race].enemy.includes(item.race) &&
          this._isUnitSeeTarget(self, unit, self.scene[item.id].position, self.units[unit.id], height) &&
          self.scene[item.id].position.distanceTo(self.scene[unit.id].position) < (Number(process.env.ATTENTION_DISTANCE) / (item.animation.includes('hide') ?  2 : 1)),
      );

    if (!this._listInfo2.length) {
      collider.target = '';
      collider.nextLifecycle = Lifecycle.idle;
    } else {
      // Смотрим есть ли атакующие именно этого или враждебные игроки на дистанции атаки
      this._listInfo3 = this._listInfo2.filter((item) => (this.colliders[item.id] && this.colliders[item.id].target === unit.id) ||
        (RacesConfig[unit.race].playerEnemy.includes(item.race) &&
          self.scene[item.id].position.distanceTo(self.scene[unit.id].position) < (Number(process.env.ATTACK_DISTANCE) / (item.animation.includes('hide') ?  2 : 1))));
      if (this._listInfo3.length) {
        this._listInfo3 = this._listInfo3.sort(
          (a, b) =>
            self.scene[a.id].position.distanceTo(self.scene[unit.id].position) -
            self.scene[b.id].position.distanceTo(self.scene[unit.id].position),
        );
        collider.target = this._listInfo3[0].id; // Выбрали цель
        collider.nextLifecycle = Lifecycle.attack;
      } else {
        // Смотрим есть ли особенно враждебные на дистанции атаки
        this._listInfo3 = this._listInfo2
          .filter((item) => RacesConfig[unit.race].important.includes(item.race) &&
            self.scene[item.id].position.distanceTo(self.scene[unit.id].position) < (Number(process.env.ATTACK_DISTANCE) / (item.animation.includes('hide') ?  2 : 1)));
        if (this._listInfo3.length) {
          if (this._listInfo3.length > 1) {
            this._listInfo3 = this._listInfo3.sort(
              (a, b) =>
                self.scene[a.id].position.distanceTo(self.scene[unit.id].position) -
                self.scene[b.id].position.distanceTo(self.scene[unit.id].position),
            );
          }
          collider.target = this._listInfo3[0].id; // Выбрали цель
          collider.nextLifecycle = Lifecycle.attack;
        } else {
          // Смотрим есть ли враждебные на дистанции атаки
          this._listInfo3 = this._listInfo2
            .filter((item) => RacesConfig[unit.race].enemy.includes(item.race) &&
              self.scene[item.id].position.distanceTo(self.scene[unit.id].position) < (Number(process.env.ATTACK_DISTANCE) / (item.animation.includes('hide') ?  2 : 1)));
          if (this._listInfo3.length) {
            if (this._listInfo3.length > 1) {
              this._listInfo3 = this._listInfo3.sort(
                (a, b) =>
                  self.scene[a.id].position.distanceTo(self.scene[unit.id].position) -
                  self.scene[b.id].position.distanceTo(self.scene[unit.id].position),
              );
            }
            collider.target = this._listInfo3[0].id; // Выбрали цель
            collider.nextLifecycle = Lifecycle.attack;
          } else {
            if (this._listInfo2.length > 1) {
              this._listInfo2 = this._listInfo2.sort(
                (a, b) =>
                  self.scene[a.id].position.distanceTo(self.scene[unit.id].position) -
                  self.scene[b.id].position.distanceTo(self.scene[unit.id].position),
              );
            }
            collider.target = this._listInfo2[0].id; // Выбрали цель

            if (self.scene[collider.target].position.distanceTo(self.scene[unit.id].position) < (Number(process.env.ATTACK_DISTANCE) / (this._listInfo2[0].animation.includes('hide') ?  2 : 1))) {
              collider.nextLifecycle = Lifecycle.attack;
            } else {
              collider.nextLifecycle = Lifecycle.attention; 
            }
          }
        }
      }
    }
  }

  // Установить спокойствие
  private _setIdleLifecycle(unit: IUnit) {
    unit.lifecycle = Lifecycle.idle;
  }

  // Установить внимание
  private _setAttentionLifecycle(unit: IUnit, collider: IUnitCollider) {
    unit.lifecycle = Lifecycle.attention;
    if (collider.isBend) collider.isBend = false;
    if (collider.bendTimer) collider.bendTimer = 0;
  }

  // Установить атаку
  private _setAttackLifecycle(unit: IUnit, collider: IUnitCollider) {
    unit.lifecycle = Lifecycle.attack;
    if (collider.isBend) collider.isBend = false;
    if (collider.bendTimer) collider.bendTimer = 0;
    if (!collider.isForward) collider.isForward = true;
  }

  // Установить счетчик "не поворачиваю"
  private _setNoBendTimer(collider: IUnitCollider) {
    collider.bendTimer = 0.00000001;
    collider.bendTimerLimit = Math.random() + 1; 
  }

  // Установить счетчик "отдыха после действия"
  private _setNoActionTimer(collider: IUnitCollider, time: number) {
    collider.timerNo = 0.00000001;
    collider.timerNoLimit = time + Math.random() * 2; 
  }

  // Начало действия
  private _onStartAction(collider: IUnitCollider) {
    collider.timer = 0.00000001;
  }

  // Конец действия
  private _onFinishAction(collider: IUnitCollider) {
    collider.timer = 0;
    this._setNoActionTimer(collider, 1 + Math.random());
  }

  // Попробовать идти вперед
  private _setWalking(self: ISelf, unit: IUnit, collider: IUnitCollider) {
    // Проверяем есть ли препятствие впереди
    self.scene[unit.id].getWorldDirection(this._direction);
    this._direction.normalize();
    this._direction.y = 0;
    this._ray = new THREE.Ray(new THREE.Vector3(
      self.scene[unit.id].position.x,
      self.scene[unit.id].position.y + this._box.y * 8/9,
      self.scene[unit.id].position.z,
    ), this._direction);
    this._result3 = self.octrees[self.units[unit.id]].rayIntersect(this._ray);

    if (!this._result3 || this._result3.distance > 5) {
      // console.log('Хочу идти вперед!!!', this._result3 ? this._result3.distance: false);
      collider.isForward = true;
      this._setNoActionTimer(collider, 1);
    } // else console.log('Препятствие впереди: ', this._result3.distance);
  }

  // Остановиться
  private _setNoWalking(collider: IUnitCollider) {
    // console.log('Хочу остановиться!!!');
    collider.isForward = false;
    collider.velocity.x = 0;
    collider.velocity.z = 0;
    this._setNoActionTimer(collider, 1);
  }

  // Прыгнуть
  private _setJump(collider: IUnitCollider) {
    // console.log('Хочу прыгнуть!!!');
    collider.isJump = true;
    this._onStartAction(collider);
  }

  // Крикнуть
  private _setCry(collider: IUnitCollider) {
    // console.log('Хочу крикнуть!!!', collider.target);
    collider.isCry = true;
    collider.velocity.x = 0;
    collider.velocity.z = 0;
    this._onStartAction(collider);
  }

  // Выстрелить
  private _setShot(collider: IUnitCollider) {
    // console.log('Хочу выстрелить!!!', collider.target);
    collider.isAttack = true;
    collider.velocity.x = 0;
    collider.velocity.z = 0;
    this._onStartAction(collider);
  }

  // Урон
  private _setHit(collider: IUnitCollider) {
    // console.log('Урон!!!');
    collider.isHit = true;
    collider.velocity.x = 0;
    collider.velocity.z = 0;
    if (collider.isKick) collider.isKick = false;
    if (collider.isKick2) collider.isKick = false;
    if (collider.isBackward) collider.isBackward = false;
    if (collider.isForward) collider.isForward = false;
    if (collider.isCry) collider.isCry = false;
    if (collider.isAttack) collider.isAttack = false;
    if (collider.isAttack2) collider.isAttack2 = false;
    if (collider.isJump) collider.isJump = false;
    if (collider.isJump2) collider.isJump2 = false;
    this._onStartAction(collider);
  }

  // Пнуть
  private _setKick(collider: IUnitCollider) {
    // console.log('Хочу пнуть!!!');
    collider.isKick = true;
    collider.velocity.x = 0;
    collider.velocity.z = 0;
    if (collider.isForward) collider.isForward = false;
    if (collider.isBackward) collider.isBackward = false;
    this._onStartAction(collider);
  }

  // Повернуть
  private _setBend(collider: IUnitCollider) {
    // console.log('Хочу повернуть!!!');
    collider.isBend = true;
    collider.bend = Helper.staticPlusOrMinus();
    this._setNoBendTimer(collider);
  }

  // Перестать поворачивать
  private _setNoBend(collider: IUnitCollider) {
    // console.log('Хочу перестать поворачивать!!!');
    collider.isBend = false;
    this._setNoBendTimer(collider);
  }

  // Выбрать новое действие
  private _choizeNewAction(self: ISelf, unit: IUnit, collider: IUnitCollider, choize: number) {
    // console.log('NPC _choizeNewAction!!! ', choize);
    if (unit.lifecycle !== collider.nextLifecycle) {
      unit.lifecycle = collider.nextLifecycle;
      switch (unit.lifecycle) {
        case Lifecycle.attack:
          // console.log('Переключаем на атаку!');
          this._setAttackLifecycle(unit, collider);
          break;
        case Lifecycle.attention:
          // console.log('Переключаем на внимание!');
          this._setAttentionLifecycle(unit, collider);
          break;
        case Lifecycle.idle:
          // console.log('Переключаем на спокойствие!');
          this._setIdleLifecycle(unit);
          break;
      }
    }

    switch (unit.lifecycle) {
      case Lifecycle.attack:
        break;
      case Lifecycle.attention:
      case Lifecycle.idle:
        if (choize === 1 && !collider.isForward) this._setWalking(self, unit, collider);
        else if (choize === 2 && collider.isForward) this._setNoWalking(collider);
        else if (choize === 3 && unit.lifecycle !== Lifecycle.attention && !collider.isJump && collider.isNotJump && collider.isForward) this._setJump(collider);
        break;
    }
  }

  // Получить дистанцию атаки
  private _getAttackDistance(self: ISelf, unitRace: Races, targetId: string) {
    this._itemInfo = self.unitsByLocations[self.units[targetId]].find((item) => item.id === targetId);
    return Math.sqrt(Math.pow(RacesConfig[unitRace].box.x, 2) + Math.pow(RacesConfig[unitRace].box.z, 2)) + Math.sqrt(Math.pow(RacesConfig[this._itemInfo.race].box.x, 2) + Math.pow(RacesConfig[this._itemInfo.race].box.z, 2)) / 1.5;
  }

  // Обработать поворот
  private _updateRotate(self: ISelf, unit: IUnit, collider: IUnitCollider, choize: number) {
    switch (unit.lifecycle) {
      case Lifecycle.attack:
      case Lifecycle.attention:
        // В потревоженном режиме и режиме - поворачиваем на цель если не прыжок
        if (self.scene[collider.target]) {
          self.scene[unit.id].getWorldDirection(this._direction);
          this._direction.y = 0;
          this._v1 = new THREE.Vector3(0, 0, 0).subVectors(self.scene[collider.target].position, self.scene[unit.id].position).normalize();
          this._v1.y = 0;
          this._angle = this._v1.angleTo(this._direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));
          // Поворот на цель
          if (Helper.radiansToDegrees(this._angle) > 91 || Helper.radiansToDegrees(this._angle) < 89) {
            self.scene[unit.id].rotateY((this._angle - Math.PI / 2 <= 0 ? 1 : -1) * self.events.delta * 2);
  
            // Если маленкое растояние для цели - останавливваем
            if (self.scene[collider.target].position.distanceTo(self.scene[unit.id].position) < this._getAttackDistance(self, unit.race, collider.target)) {
              collider.velocity.x = 0;
              collider.velocity.z = 0;
            }
          } else {
            switch (unit.lifecycle) {
              case Lifecycle.attack:
                // Если поворот точный в режиме атаки и дистанция коротка - останавливаемся пинаем
                this._v1 = new THREE.Vector3(
                  self.scene[unit.id].position.x,
                  self.scene[unit.id].position.y,
                  self.scene[unit.id].position.z,
                );
                this._v2 = new THREE.Vector3(
                  self.scene[collider.target].position.x,
                  self.scene[collider.target].position.y,
                  self.scene[collider.target].position.z,
                );
                this._v1.y = 0;
                this._v2.y = 0;
                if (!collider.isKick &&
                    !collider.isBackward &&
                    collider.target.length &&
                    this._v1.distanceTo(this._v2) < this._getAttackDistance(self, unit.race, collider.target) * 1.1) {
                  // console.log('Хочу пнуть!!!', collider.target, self.scene[collider.target].position.distanceTo(self.scene[unit.id].position));
                  this._setKick(collider);
                }
                break;
              case Lifecycle.attention:
                if (!collider.timer && !collider.timerNo) {
                  // Если поворот точный в режиме внимания - можем крикнуть
                  if (choize === 6) this._setCry(collider);
                  else if (choize === 7) this._setShot(collider);
                }
                break;
            }
          }
        }
        break;
      case Lifecycle.idle:
        if (!collider.bendTimer) {
          if (choize === 4 && !collider.isBend) this._setBend(collider);
          else if (choize === 5 && collider.isBend) this._setNoBend(collider);
        } else {
          collider.bendTimer += self.events.delta;
          if (collider.bendTimer > collider.bendTimerLimit) {
            collider.bendTimer = 0;
          }
        }

        // Поворот куда-нибудь
        if (collider.isBend) {
          self.scene[unit.id].rotateY(collider.bend * self.events.delta);
        }
        break;
    }
  }

  // Продвигаем таймеры
  private _updateTimers(self: ISelf, collider: IUnitCollider) {
    if (collider.timer) collider.timer += self.events.delta;
    if (collider.timerNo) {
      collider.timerNo += self.events.delta;
      if (collider.timerNo > collider.timerNoLimit) {
        collider.timerNo = 0;
      }
    }
  }

  // Обновить урон
  private _updateHit(unit: IUnit, collider: IUnitCollider) {
    if (collider.timer > RacesConfig[unit.race].animations.hit) {
      // console.log('Удар прошел!!!');
      collider.isHit = false;
      unit.isOnHit = false;
      if (unit.lifecycle === Lifecycle.attack) collider.isForward = true;
      this._onFinishAction(collider);
    }
  }

  // Обновить крик
  private _updateCry(unit: IUnit, collider: IUnitCollider) {
    if (collider.timer > RacesConfig[unit.race].animations.cry) {
      // console.log('Заканчиваю кричать!!!', unit.id);
      collider.isCry = false;
      this._onFinishAction(collider);
    }
  }

  // Обновить выстрел
  private _updateAttack(self: ISelf, unit: IUnit, collider: IUnitCollider) {
    if (self.scene[collider.target] &&
      collider.timer > RacesConfig[unit.race].attackTime &&
      !collider.isAttack2) {
      this._v1 = new THREE.Vector3(
        self.scene[collider.target].position.x,
        self.scene[collider.target].position.y,
        self.scene[collider.target].position.z,
      );
      if (self.scene[collider.target]) self.emiiter.emit(EmitterEvents.npcShot, { unit, target: collider.target });
      setTimeout(() => {
        if (self.scene[collider.target]) self.emiiter.emit(EmitterEvents.npcShot, { unit, target: collider.target });
        setTimeout(() => {
          if (self.scene[collider.target]) self.emiiter.emit(EmitterEvents.npcShot, { unit, target: collider.target });
        }, 500);
      }, 500);
      collider.isAttack2 = true;
    }
    if (collider.timer > 4) {
      // console.log('Заканчиваю стрелять!!!', unit.id);
      collider.isAttack = false;
      collider.isAttack2 = false;
      this._onFinishAction(collider);
    }
  }

  // Обновить пинок
  private _updateKick(self: ISelf, unit: IUnit, collider: IUnitCollider) {
    // console.log('NPC _updateKick!!!');
    if (collider.timer > RacesConfig[unit.race].animations.kick * RacesConfig[unit.race].kickTime && self.scene[collider.target] && !collider.isKick2) {
      collider.isKick2 = true;
      // Есть урон?
      this._v1 = new THREE.Vector3(
        self.scene[unit.id].position.x,
        self.scene[unit.id].position.y,
        self.scene[unit.id].position.z,
      );
      this._v2 = new THREE.Vector3(
        self.scene[collider.target].position.x,
        self.scene[collider.target].position.y,
        self.scene[collider.target].position.z,
      );
      this._v1.y = 0;
      this._v2.y = 0;
      if (this._v1.distanceTo(this._v2) < this._getAttackDistance(self, unit.race, collider.target) * 1.25) {
        if (collider.target.includes('NPC')) {
          // Урон неписи
          this._item = this._getNPCById(collider.target);
          this._item.isOnHit = true;
          this._itemInfo = this.listInfo.find((npc) => npc.id === collider.target);
          this._item.health -= this._helper.getDamage('kick', unit.race, this._itemInfo.race, null, false, false);
        } else {
          // Урон игроку
          self.emiiter.emit(EmitterEvents.playerKick, {
            id: collider.target,
            value: this._helper.getDamage('kick', unit.race, null, null, false, false),
          });
        }
      }
    }
    if (collider.timer > RacesConfig[unit.race].animations.kick * 0.6 && !collider.isBackward) {
      // console.log('Откатываюсь!!!');
      collider.isBackward = true;
      collider.backwardTimer = (Math.random() + 0.4);
    }
    if ((collider.timer > RacesConfig[unit.race].animations.kick * 0.8 + collider.backwardTimer) && collider.isBackward) {
      // console.log('Перестал!!!');
      collider.isKick = false;
      collider.isKick2 = false;
      collider.isBackward = false;
      collider.isForward = true;
      collider.velocity.x = 0;
      collider.velocity.z = 0;
      this._onFinishAction(collider);
    }
  }

  // Обновить прыжок
  private _updateJump(race: Races, collider: IUnitCollider) {
    // console.log('Прыжок!!!');
    if (collider.timer > 1.8 && !collider.isJump2) {
      // console.log('Прыгаю!!!');
      collider.velocity.x = 0;
      collider.velocity.z = 0;
      collider.velocity.y += RacesConfig[race].jump;

      collider.isJump2 = true;
    }

    if (collider.timer > 3 && collider.isJump) {
      // console.log('Приземлился!!!');
      collider.isJump = false;
    }

    if (collider.timer > 5) {
      collider.isJump2 = false;
      this._onFinishAction(collider);
    }
  }

  // Скорость юнита
  private _getSpeed(
    race: Races,
    isJump: boolean,
    isAttack: boolean,
  ) {
    return (isAttack ? 2 : 1) * (isJump ? 0.8 : 1) * Number(process.env.NPC_SPEED) * RacesConfig[race].speed;
  }

  // Обновить откат
  private _updateBack(self: ISelf, unit: IUnit, collider: IUnitCollider) {
    // console.log('Откатываюсь!!!');
    this._speed = this._getSpeed(unit.race, false, false);
    self.scene[unit.id].getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize().negate().multiplyScalar(this._speed * self.events.delta);
    collider.velocity.add(this._direction);
  }

  // Обновить продвижение вперед
  private _updateForward(self: ISelf, unit: IUnit, collider: IUnitCollider) {
    // console.log('Продвигаюсь!!!');
    this._speed = this._getSpeed(unit.race, unit.isJump, unit.lifecycle === Lifecycle.attack);
    self.scene[unit.id].getWorldDirection(this._direction);
    this._direction.y = 0;
    this._direction.normalize().multiplyScalar(this._speed  * RacesConfig[unit.race].speed * self.events.delta);
    collider.velocity.add(this._direction);
  }

  public animate(self: ISelf): void {
    // console.log('NPC animate!!!', this._time);
    // Решение на создание нового зомби после создания мира
    this._timerStartCreate += self.events.delta;
    if (this._timerStartCreate > 0.2) {
      if (this.counter < Number(process.env.MAX_NPC)) {
        this.addUnit(self);
      }
      this._timerStartCreate = 0;
    }

    // Ленивые проверки 
    this._timerLazyCheck += self.events.delta;
    if (this._timerLazyCheck > 0.2) this._timerLazyCheck = 0;

    // Главная оптимизирующая механика
    this._listAnimate = [...this.list.filter((unit) => !unit.isSleep && unit.lifecycle !== Lifecycle.dead)];
    this._listSleepAnimate = [...this.list.filter((unit) => unit.isSleep && unit.lifecycle !== Lifecycle.dead)];
    
    this._number = Helper.randomInteger(0, this._listSleepAnimate.length - 1);
    this._number2 = this._listAnimate.length < Number(process.env.SLEEP_ANIMATE) ?
      Number(process.env.SLEEP_ANIMATE) - this._listAnimate.length :
      Number(process.env.SLEEP_ANIMATE_MIN);

    if (this._number + this._number2 < this._listSleepAnimate.length) {
      this._listSleepAnimateResult = this._listSleepAnimate
        .slice(this._number, this._number + this._number2);
    } else {
      this._listSleepAnimateResult = this._listSleepAnimate
        .slice(this._number, this._listSleepAnimate.length - 1)
        .concat(this._listSleepAnimate
          .slice(0, this._number + this._number2 - this._listSleepAnimate.length + 1)
        );
    }

    /*
    if (this._listAnimate.length) {
      console.log(
        this._listAnimate.length,
        this._listSleepAnimateResult.length,
        self.unitsByLocations[self.units[this._listAnimate[0].id]].length
      );
    } */

    this._listAnimate.concat(this._listSleepAnimateResult)
      .forEach((unit: IUnit) => {
        this._collider = this.colliders[unit.id];
        if (this._collider) {
          // Строим октодеревья для всех кто не спокоен или мертв
          if (this._isNeedOctreeUnit(unit)) this._setUnitOctree(self, unit.id);
          // Размер коробки
          this._box = RacesConfig[unit.race].box;
          
          // Если сброс таймера - проверяем юнита
          if (!this._timerLazyCheck) this._checkUnit(self, unit, this._collider, this._box.y);

          if (unit.animation !== 'dead' && unit.lifecycle !== Lifecycle.born) {
            // Если юнит под ударом - устанавливаем удар
            if (unit.isOnHit && !this._collider.isHit) this._setHit(this._collider);
            else {
              // "Бросаем кости"
              this._number = Helper.randomInteger(1, Math.round(Number(process.env.MOTIVATION) / RacesConfig[unit.race].intelligence));
            }

            // Решения которые принимаются только когда отработали счетчики
            if (
              !this._collider.timer &&
              !this._collider.timerNo
            ) {
              this._choizeNewAction(self, unit, this._collider, this._number);
            } else this._updateTimers(self, this._collider); // продвигаем счетчики
            
            if (this._collider.isHit) this._updateHit(unit, this._collider); // Урон
            else {
              if (this._collider.isCry) this._updateCry(unit, this._collider); // Крик
              if (this._collider.isAttack) this._updateAttack(self, unit, this._collider); // Выстрел
              if (this._collider.isKick) this._updateKick(self, unit, this._collider); // Пинок
              if (this._collider.isJump || this._collider.isJump2) this._updateJump(unit.race, this._collider); // Прыжок
              if (this._collider.isBackward) this._updateBack(self, unit, this._collider); // Откат
              if (this._collider.isForward && !this._collider.isCry && !this._collider.isAttack && !this._collider.isKick && !this._collider.isBackward) this._updateForward(self, unit, this._collider); // Вперед
            
              // Независимые "постоянные" изменения, если не прыгает - повороты
              if (!this._collider.isJump) this._updateRotate(self, unit, this._collider, this._number);
            }
          }

          // Потеря ускорения если юнит находится на полу
          if (this._collider.isNotJump) {
            // Если родился и достиг пола - переключаем этап жизненного цикла
            if (unit.lifecycle === Lifecycle.born) unit.lifecycle = Lifecycle.idle;

            this._collider.velocity.addScaledVector(this._collider.velocity, Helper.damping(self.events.delta));
          } else {
            // Гравитация
            this._collider.velocity.y -=
              Number(process.env.GRAVITY) * self.events.delta;

            if (unit.animation === 'dead') {                
              // Останавливаем горизонтальное ускорение
              this._collider.velocity.x = 0;
              this._collider.velocity.z = 0;
            }
          }

          this._collider.collider.translate(
            this._collider.velocity.clone().multiplyScalar(self.events.delta),
          );

          this._collitions(self, this._collider, self.units[unit.id], unit.id);

          // Достиг дна
          if (this._collider.collider.end.y < -1) {
            this._collider.collider.end.y = -1;
            this._collider.collider.start.y = this._box.y - 1;
          }

          // Выставляем анимацию
          if (unit.health <= 0) {
            unit.animation = 'dead';

            // Смотрим по легкому списку умер ли
            this._itemInfo = this.listInfo.find((npc) => npc.id === unit.id);
            if (this._itemInfo.animation !== 'dead') {
              this._itemInfo.animation = 'dead';

              // Ищем тех, для кого он был целью
              this.list.filter((npc) => this.colliders[npc.id] && this.colliders[npc.id].target === unit.id).forEach((npc) => {
                this._checkUnit(self, npc, this.colliders[npc.id], this._box.y);
              });

              setTimeout(() => {
                unit.lifecycle = Lifecycle.dead;

                // Считаем
                this.counters = {
                  ...this.counters,
                  [`${unit.race}`]: ++this.counters[`${unit.race}`],
                };

                setTimeout(() => {
                  // Удаляем из списков
                  this.list = this.list.filter((npc) => npc.id !== unit.id);
                  this.listInfo = this.listInfo.filter((npc) => npc.id !== unit.id);

                  // removeNPC event emit
                  self.emiiter.emit(EmitterEvents.removeNPC, unit.id);
                  setTimeout(() => {
                    // На перерождение
                    this.addUnit(self, unit.id);
                  }, Number(process.env.REINCARNATION_NPC_TIME));
                }, Number(process.env.CLEAN_NPC_TIME));
              }, 7500);
            }
          } else {
            // Регенерация
            if (unit.health < 100) unit.health += self.events.delta *
              RacesConfig[unit.race].regeneration *
              Number(process.env.REGENERATION);
            if (unit.health > 100) unit.health = 100;

            if (this._collider.isHit) unit.animation = 'hit';
            else if (this._collider.isCry) unit.animation = 'cry';
            else if (this._collider.isAttack) unit.animation = 'attack';
            else if (this._collider.isJump) unit.animation = 'jump';
            else if (this._collider.isKick && this._collider.isBackward) unit.animation = 'back';
            else if (this._collider.isKick && !this._collider.isBackward) unit.animation = 'kick';
            else if (unit.lifecycle === Lifecycle.attack && this._collider.isForward) unit.animation = 'run';
            else if (this._collider.isForward) unit.animation = 'walking';
            else unit.animation = 'idle';

            // console.log(unit.lifecycle, unit.animation, this._collider.timer);
          }

          // Записываем данные
          this._v = this._collider.collider.end;
          unit.positionX = this._v.x;
          unit.positionY = this._v.y + this._box.y / 2;
          unit.positionZ = this._v.z;

          unit.isJump = this._collider.isJump2;

          if (self.scene[unit.id]) {
            self.scene[unit.id].position.set(
              this._v.x,
              this._v.y + this._box.y / 2,
              this._v.z,
            );
            if (unit.animation !== 'dead') {
              unit.rotationY = self.scene[unit.id].rotation.y;

              unit.directionX = self.scene[unit.id].quaternion.x;
              unit.directionY = self.scene[unit.id].quaternion.y;
              unit.directionZ = self.scene[unit.id].quaternion.z;
              unit.directionW = self.scene[unit.id].quaternion.w;
            }
          }
        }
      });
  }

  // Пересоздаем динамическое октодерево из самых ближних коробок и "без его коробки"
  private async _setUnitOctree(self: ISelf, id: string): Promise<void> {
    this._mesh = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshBasicMaterial(),
    );
    this._mesh.position.set(0, -3, 0);
    this._group = new THREE.Group();
    this._group.add(this._mesh);
    if (self.unitsByLocations[self.units[id]])
      this._listInfo2 = self.unitsByLocations[self.units[id]]
        .filter(
          (item) =>
            item.animation !== 'dead' &&
            item.id !== id &&
            self.scene[item.id].position.distanceTo(self.scene[id].position) <
            3,
        )
        .sort(
          (a, b) =>
            self.scene[a.id].position.distanceTo(self.scene[id].position) -
            self.scene[b.id].position.distanceTo(self.scene[id].position),
        )
        .slice(0, 2);
    if (this._listInfo2.length) {
      this._listInfo2.forEach((item: IUnitInfo) => {
        this._group.add(self.scene[item.id]);
      });
    }
    this._octree = new Octree();
    this._octree.fromGraphNode(this._group);
    this.colliders[id].octree = this._octree;
    this._group.remove();
    this._group = null;
  }

  public onExplosion(message: IExplosion): IUpdateMessage[] {
    // console.log('Zombies onExplosion!!!!!!!!!!!!!: ', message);
    this._updates = [];
    this.list.filter((unit) => new THREE.Vector3(
      message.positionX,
      message.positionY,
      message.positionZ,
    ).distanceTo(new THREE.Vector3(
      unit.positionX,
      unit.positionY,
      unit.positionZ,
    )) < Number(process.env.EXPLOSION_DISTANCE))
      .forEach((unit: IUnit) => {
        this._v1 = new THREE.Vector3(
          message.positionX,
          message.positionY,
          message.positionZ,
        );
        this._v2 = new THREE.Vector3(
          unit.positionX,
          unit.positionY,
          unit.positionZ,
        );
        this._number = this._v1.distanceTo(this._v2);
        // console.log('Zombies onExplosion!!!!!!!!!!!!!: ', unit.id, this._number);
        if (this._number < Number(process.env.EXPLOSION_DISTANCE)) {
          // При попадании по коробке - ущерб сильнее
          // Если режим скрытый - в два раза меньше
          unit.health -= this._helper.getDamage('shot', null, unit.race, this._number, unit.id === message.enemy, false);
          this._updates.push({
            id: unit.id,
            health: unit.health,
            is: unit.id === message.enemy,
          });
          // Если растояние от взрыва меньше того, от которого случается урон - показываем удар на персонаже 
          if (this._number < Number(process.env.EXPLOSION_DISTANCE) / 1.5) unit.isOnHit = true;
        }
      });
    return this._updates;
  }

  // На попадание дальним по неписи
  public onNPCShotHit(message: { id: string, race: Races, value: number }): void {
    // console.log('NPC onNPCShotHit: ', message);
    this._item = this._getNPCById(message.id);
    if (this._item) {
      this._item.isOnHit = true;
      this._item.health -= this._helper.getDamage('light', message.race, this._item.race, message.value, false, false);
    }
  }
}
