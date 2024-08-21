import type { Lifecycle, Races } from './gameplay';

// Websockets messages
export enum Messages {
  // Players

  onConnect = 'onConnect', // На присоединение пользователя
  onOnConnect = 'onOnConnect', // Ответ клиента серверу на соединение
  newPlayer = 'newPlayer', // Пришел без айди или с неправильным айди
  onUpdatePlayer = 'onUpdatePlayer', // Подтвердить нового игрока
  enter = 'enter', // Назваться и зайти в игру
  onEnter = 'onEnter', // Отклик сервера о заходе
  reenter = 'reenter', // Начать сначала

  updateToClients = 'updateToClients', // Постоянные обновления клиентам
  updateToServer = 'updateToServer', // Пришло обновление от клиента

  shot = 'shot', // Выстрел
  onShot = 'onShot', // На выстрел
  unshot = 'unshot', // Удаление выстрела
  onUnshot = 'onUnshot', // На удаление выстрела
  explosion = 'explosion', // На взрыв
  onExplosion = 'onExplosion', // На ответ взрыв
  selfharm = 'selfharm', // Самоповреждение
  onSelfharm = 'onSelfharm', // На самоповреждение
  relocation = 'relocation', // Переход на другую локацию
  onRelocation = 'onRelocation', // На переход на другую локацию
  location = 'location', // Игрок загрузился на локации
}

// Движущийся объект
export interface IMoveObject {
  positionX: number;
  positionY: number;
  positionZ: number;
  directionX: number;
  directionY: number;
  directionZ: number;
  directionW: number;
  rotationY: number;
}

// Выстрел
export interface IShot extends IMoveObject {
  id: number | null;
  player: string;
  location: string;
  startX: number;
  startY: number;
  startZ: number;
  time: number;
}

export interface IExplosion extends IShot {
  enemy: string;
}

// Выстрел неписи
export interface ILight extends IMoveObject {
  id: number | null;
  race: Races,
  target: string;
  location: string;
  startX: number;
  startY: number;
  startZ: number;
  is: boolean;
}

export interface IOnExplosion {
  message: IExplosion;
  updates: {
    users: IUpdateMessage[];
    npc: IUpdateMessage[];
  },
}

// Игрок
export interface IUnit extends IMoveObject {
  lifecycle: Lifecycle;
  id: string;
  race: Races;
  name: string;
  health: number;
  animation: string;
  isJump: boolean;
  isFire: boolean;
  isOnHit: boolean;
  isOnHit2: boolean;
  isSleep: boolean;
}

// Для бека
// Провел в игре: time - unix) / 60
export interface IUserBack {
  id: string;
  start: number | null;
  time: number | null;
}

// Обновления игрока
export interface IUpdateMessage {
  [key: string]: number | string | boolean | null;
}

// Обновления игры

export interface IWeaponModule {
  [key: string]: IShot[] | ILight[];
}

export interface IGameUpdates {
  users: IUnit[];
  npc: IUnit[],
  weapon: IWeaponModule;
}

// Мир
export interface IPosition {
  x: number;
  z: number;
}

export interface ITree {
  x: number;
  z: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export interface IStone {
  x: number;
  z: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  rotateY: number;
}

export interface IStone2 extends IStone {
  model: number;
}

export interface IBuild {
  x: number;
  z: number;
  scale: number;
  scaleY: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export interface IGrass {
  x: number;
  z: number;
  scale: number;
}

export interface ILocation {
  id: string;
  x: number;
  y: number;
}

export interface ILocationUnits extends ILocation {
  users: string[];
  npc: string[];
}

export interface ILocationWorld extends ILocation {
  name: string;
  ground: string;
  trees: ITree[];
  stones: IStone[];
  stones2: IStone[];
  builds: IBuild[];
}

export interface ILocations {
  [key: string]: ILocationUnits;
}

export interface ILocationsWorld {
  [key: string]: ILocationWorld;
}

export interface IUserUpdate {
  player: IUpdateMessage;
  npc: IUnit[],
}

export interface IUnitInfo {
  id: string;
  mesh: string;
  animation: string;
  race: Races;
}

export interface IUnitsByLocations {
  [key: string]: IUnitInfo[];
}

export interface IMapUnit {
  id: string;
  race: string;
  x: number;
  y: number;
  isDead: boolean;
}
