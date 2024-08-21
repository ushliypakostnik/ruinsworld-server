import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

// Types
import { IPosition } from '../../models/api';

// Constants
import { Races, RacesConfig } from '../../models/gameplay';

@Injectable()
export default class Helper {
  private _number: number;
  private _number1: number;
  private _number2: number;

  // Math

  static randomInteger(min: number, max: number): number {
    return Math.floor(min + Math.random() * (max + 1 - min));
  }

  static yesOrNo(): boolean {
    return Math.random() >= 0.5;
  }

  static staticPlusOrMinus(): number {
    return Math.random() >= 0.5 ? 1 : -1;
  }

  private _plusOrMinus(): number {
    return Math.random() >= 0.5 ? 1 : -1;
  }

  private _distance2D(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  static degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  static radiansToDegrees = (radians: number) => {
    return radians * (180 / Math.PI);
  }

  static damping(delta: number): number {
    return Math.exp(-3 * delta) - 1;
  }

  public getRandomPosition(
    centerX: number,
    centerZ: number,
    radius: number,
    isSafeCenter: boolean,
  ): IPosition {
    this._number = isSafeCenter ? 30 : 10;
    this._number1 = this._plusOrMinus();
    this._number2 = this._plusOrMinus();
    return {
      x: Math.round(centerX + Math.random() * this._number1 * radius) + this._number * this._number1,
      z: Math.round(centerZ + Math.random() * this._number2 * radius) + this._number * this._number2,
    };
  }

  private _isBadPosition(
    positions: IPosition[],
    position: IPosition,
    distance: number,
  ): boolean {
    return !!positions.find(
      (place: IPosition) =>
        this._distance2D(place.x, place.z, position.x, position.z) < distance,
    );
  }

  public getUniqueRandomPosition(
    positions: IPosition[],
    centerX: number,
    centerZ: number,
    distance: number,
    radius: number,
    isSafeCenter: boolean,
  ): IPosition {
    let position: IPosition = this.getRandomPosition(
      centerX,
      centerZ,
      radius,
      isSafeCenter,
    );
    while (this._isBadPosition(positions, position, distance)) {
      position = this.getRandomPosition(centerX, centerZ, radius, isSafeCenter);
    }
    return position;
  }

  // Utils

  static isEmptyObject(target: object): boolean {
    return Object.keys(target).length === 0 && target.constructor === Object;
  }

  static isHasProperty(target: object, property: string): boolean {
    return Object.prototype.hasOwnProperty.call(target, property);
  }

  static generateUniqueId(length: number, ids: string[]): string {
    let id;
    while (!id || ids.includes(id)) {
      id = randomBytes(length).toString('hex');
    }
    return id;
  }

  static getUnixtime(date?: Date): number {
    if (date) return Math.round(date.getTime() / 1000.0);
    return Math.round(new Date().getTime() / 1000.0);
  }

  // Gameplay

  public getDamage(
    type: 'kick' | 'light' | 'shot',
    from: Races | null,
    to: Races | null,
    distance: number | null,
    isExact: boolean,
    isHide: boolean,
  ): number {
    this._number = Number(process.env.DAMAGE);

    switch (type) {
      case 'kick':
        this._number *= Number(process.env.KICK_DAMAGE_COEF);
        this._number *= RacesConfig[from].kick * Math.random() / 4 + 0.825;
        break;
      case 'light':
        this._number *= Number(process.env.LIGHT_DAMAGE_COEF);
        this._number *= RacesConfig[from].attack;
        this._number *= (1 / distance);
        break;
      case 'shot':
        this._number *= Number(process.env.SHOT_DAMAGE_COEF);
        this._number *= (1 / distance);
        if (isExact) this._number *= Number(process.env.EXACT_DAMAGE_COEF);
        break;
    }

    if (!to || to === Races.human || to === Races.reptiloid) {
      if (isHide) this._number *= 0.5;
      this._number *= Number(process.env.PLAYERS_DAMAGE_COEF);

      switch (type) {
        case 'kick':
          this._number *= Number(process.env.KICK_PLAYERS_DAMAGE_COEF);
          break;
        case 'light':
          this._number *= Number(process.env.LIGHT_PLAYERS_DAMAGE_COEF);
          break;
      }
    }

    if (to) this._number /= RacesConfig[to].armor;
    
    // console.log('Helper getDamage: ', type, from, to, isExact, isHide, this._number);
    
    return this._number;
  }
}