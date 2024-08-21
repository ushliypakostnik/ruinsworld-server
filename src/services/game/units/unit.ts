// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { IUnit } from '../../../models/api';
import { Lifecycle, Races } from 'src/models/gameplay';

@Injectable()
export default class User implements IUnit {
  public name!: string;
  public race: Races;
  public health: number;
  public positionX: number;
  public positionY: number;
  public positionZ: number;
  public directionX: number;
  public directionY: number;
  public directionZ: number;
  public directionW: number;
  public rotationY: number;
  public animation: string;
  public lifecycle: Lifecycle;
  public isFire: boolean;
  public isJump: boolean;
  public isOnHit: boolean;
  public isOnHit2: boolean;
  public isSleep: boolean;

  constructor(
    readonly id: string
  ) {
    this.health = 100;
    this.lifecycle = Lifecycle.born;
  }
}
