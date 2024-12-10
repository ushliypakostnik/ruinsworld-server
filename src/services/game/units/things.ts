// Nest
import { Injectable } from '@nestjs/common';

// Constants
import { EmitterEvents } from '../../../models/modules';

// Types
import type { ISelf } from '../../../models/modules';
import type { IThing, IUnitBack } from '../../../models/api';
import { Things as ThingsEnum, ThingsSimple, ThingsRare } from '../../../models/gameplay';

// Modules
import Thing from './thing';

// Utils
import Helper from '../../utils/helper';

@Injectable()
export default class Things {
  public list: IThing[];
  public listBack: IUnitBack[];

  public counter = 0;
  public counters = {};
  private _THINGS = [];
  private _THINGS_SIMPLE = [];
  private _THINGS_RARE = [];
  private _array = [];

  private _item!: IThing;
  private _itemBack!: IUnitBack;
  private _number!: number;
  private _id!: string;
  private _string!: string;
  private _timerStartCreate = 0;

  private _START = {
    x: 0,
    z: 0,
  };

  constructor() {
    this.list = [];
    this.listBack = [];

    // Инициализируем счетчики
    Object.keys(ThingsEnum).forEach((thing) => {
      this._THINGS.push(thing as ThingsEnum);
    });
    Object.keys(ThingsSimple).forEach((thing) => {
      this._THINGS_SIMPLE.push(thing as ThingsSimple);
    });
    Object.keys(ThingsRare).forEach((thing) => {
      this._THINGS_RARE.push(thing as ThingsRare);
    });
    this._THINGS.forEach((race) => {
      this.counters[race] = 0;
    });
  }

  // Utils

  public getList(): IThing[] {
    return this.list;
  }

  private _getUnitById(id: string): IThing {
    return this.list.find((unit) => unit.id === id);
  }

  private _getUnitBackById(id: string): IUnitBack {
    return this.listBack.find((unit) => unit.id === id);
  }

  // Добавить юнит
  private _addThing(self: ISelf, id?: string) {
    // console.log('Things _addThing!!!', this.counter, id);
    ++this.counter;
    if (id) this._id = id;
    else this._id = `TNG/${this.counter}`;
    this._item = new Thing(this._id);

    // Решаем какой предмет добавить - редкий или обычный
    this._number = Helper.randomInteger(1, 12);
    if (this._number === 1) this._array = this._THINGS_RARE; 
    else this._array = this._THINGS_SIMPLE;
    // Добавляем предмет которых меньше всего
    this._number = 0;
    this._string =
      this._array[Helper.randomInteger(0, this._array.length - 1)];
    this._array.forEach(
      (type) =>
        (this.counters[type] = this.list.filter(
          (unit) => unit.type === type,
        ).length),
    );
    this._array.forEach((type) => {
      if (this.counters[type] < this._number) {
        this._string = type;
        this._number = this.counters[type];
      }
    });
    this.counters[this._string] += 1;

    this._item = {
      ...this._item,
      ...this._START,
      type: this._string as ThingsEnum,
      y: (Math.random() + 0.1) / 2,
      rotateY: Helper.randomInteger(0, 360),
      rotateX: Helper.randomInteger(-45, 45),
    };
    this._item.x += Helper.randomInteger(-125, 125);
    if (this._item.x > 0) this._item.x += 25;
    else this._item.x -= 25;
    this._item.z += Helper.randomInteger(-125, 125);
    if (this._item.z > 0) this._item.z += 25;
    else this._item.z -= 25;

    this.list.push(this._item);
    this._number = Helper.getUnixtime();
    this.listBack.push({
      id: this._item.id,
      start: this._number,
      time: Helper.randomInteger(0, Number(process.env.THING_LIVE_TIME) * 2),
    });

    // console.log('Things _addThing!!!', this._item);
    self.emiiter.emit(EmitterEvents.addThing, this._item);
  }

  public animate(self: ISelf): void {
    // Решение на создание всех предметов после создания мира
    this._timerStartCreate += self.events.delta;
    if (this._timerStartCreate > 0.2) {
      if (
        this.counter <
        Number(process.env.THINGS_ON_LOCATION) *
          Math.pow(Number(process.env.WORLD) * 2 + 1, 2)
      ) {
        this._addThing(self);
      }
      this._timerStartCreate = 0;
    }
  }

  // Пытаемся удалить вещь
  private _removeThing(self: ISelf, id: string): void {
    this._item = this._getUnitById(id);
    this._itemBack = this._getUnitBackById(id);
    if (this._itemBack) {
      // Удаляем из списков
      this.list = this.list.filter((unit) => unit.id !== id);
      this.listBack = this.listBack.filter((unit) => unit.id !== id);

      // removeThing event emit
      self.emiiter.emit(EmitterEvents.removeThing, id);
      setTimeout(() => {
        // На перерождение
        this._addThing(self, id);
      }, Number(process.env.REINCARNATION_THING_TIME));
    }
  }

  // Gameplay

  // Поиск слишком старых предметов
  public lazyCheck(self: ISelf): void {
    this._number = Helper.getUnixtime();
    this.list.forEach((item) => {
      this._itemBack = this._getUnitBackById(item.id);
      // У всех разное время жизни, предопределенное при рождении
      if (
        this._itemBack &&
        this._number - this._itemBack.start >
          Number(process.env.THING_LIVE_TIME) + this._itemBack.time
      ) {
        this._item = this._getUnitById(item.id);
        if (this._item) {
          // console.log('Things lazyCheck() clean: ', this._number, item, this._itemBack);
          this._removeThing(self, item.id);
        }
      }
    });
  }

  // Игрок что-то подобрал
  public onPickThing(self: ISelf, id: string): void {
    this._removeThing(self, id);
  }
}
