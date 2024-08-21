import type { Mesh, Vector3 } from 'three';
import type Events from '../services/utils/events';
import type Octree from '../services/math/octree';
import type Capsule from '../services/math/capsule';
import type EventEmitter from 'events';
import { IUnitsByLocations } from './api';
import { Lifecycle } from './gameplay';

// Набор локаций
export interface Octrees {
  [key: string]: Octree;
}

// Main object
export interface ISelf {
  // Utils
  emiiter: EventEmitter, // шина сообщений между модулями
  events: Events; // шина игровых событий

  // Objects
  scene: { [key: string]: Mesh }; // хранилище коробок
  unitsByLocations: IUnitsByLocations; // данные о юнитах по локациям
  units: { [key: string]: string }; // сопоставление - пользователь/локация

  // Math
  octrees: Octrees; // модели локаций
}

// Emitter events
export enum EmitterEvents {
  addNPC = 'addNPC',
  removeNPC = 'removeNPC',
  playerKick = 'playerKick',
  npcShot = 'npcShot',
  npcShotHit = 'npcShotHit',
}

export interface IUnitCollider {
  collider: Capsule;
  velocity: Vector3;
  isNotJump: boolean;
  isForward: boolean;
  isJump: boolean;
  isJump2: boolean;
  isBend: boolean
  isCry: boolean;
  isAttack: boolean;
  isAttack2: boolean;
  isKick: boolean;
  isKick2: boolean;
  isBackward: boolean;
  backwardTimer: number;
  bend: number;
  bendTimer: number;
  bendTimerLimit: number;
  timer: number;
  timerNo: number;
  timerNoLimit: number;
  octree: Octree;
  target: string;
  isHit: boolean;
  nextLifecycle: Lifecycle | null;
}

export interface IUnitColliders {
  [key: string]: IUnitCollider;
}