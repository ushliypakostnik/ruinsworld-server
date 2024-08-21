// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { IShot } from '../../../models/api';

@Injectable()
export default class Shots {
  public list: IShot[];
  public counter = 0;

  private _item!: IShot;

  constructor() {
    this.list = [];
  }

  public onShot(message: IShot): IShot {
    ++this.counter;
    this._item = {
      ...message,
      id: this.counter,
    };
    this.list.push(this._item);
    // console.log('Shots onShot()!', message);
    return this._item;
  }

  public onUnshot(message: number): string {
    this._item = this.list.find((shot) => shot.id === message);
    // console.log('Shots onUnshot()!', message, this._item, this.list.length);
    if (this._item) {
      this.list = this.list.filter((shot) => shot.id !== message);
      return this._item.location;
    }
    return '';
  }

  public onUnshotExplosion(message: number): void {
    this.list = this.list.filter((shot) => shot.id !== message);
    // console.log('Shots onUnshotExplosion()!', message, this.list.length);
  }
}
