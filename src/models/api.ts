import type { Lifecycle, Races, Pick } from './gameplay';

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
  point = 'point', // Смена флага на контрольной точке
  pick = 'pick', // Пользователь подобрал что-то
  onPick = 'onPick', // На подбирание что-то
  userDead = 'userDead', // Игрок умер
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
  exp: number,
}

// Для бека

export interface IUnitBack {
  id: string;
  start: number | null;
}

// Провел в игре: time - unix) / 60
export interface IUserBack extends IUnitBack {
  time: number | null;
}

// Обновления игрока
export interface IUpdateMessage {
  [key: string]: number | string | boolean | null;
}

// Обновления игры

export interface IMessage {
  id: string;
  location: string;
}

export interface IPickMessage extends IMessage {
  type: Pick;
  uuid: string;
  text: string;
  user: string;
}

export interface IWeaponModule {
  [key: string]: IShot[] | ILight[];
}

export interface IGameUpdates {
  point: IPoint;
  users: IUnit[];
  npc: IUnit[],
  weapon: IWeaponModule;
}

// Мир
export interface IPoint {
  status: Races.human | Races.reptiloid | null;
}

export interface IPosition {
  x: number;
  z: number;
}

export interface ITree extends IPosition {
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
}

export interface IStone extends IPosition {
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  rotateY: number;
}

export interface IStone2 extends IStone {
  model: number;
}

export interface IBuild extends IPosition {
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
  // stones2: IStone[];
  builds: IBuild[];
}

export interface ILocations {
  [key: string]: ILocationUnits;
}

export interface ILocationsWorld {
  [key: string]: ILocationWorld;
}

export interface IPoints {
  [key: string]: IPoint;
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

export interface IPointMessage {
  id: string;
  race: Races.human | Races.reptiloid;
}
