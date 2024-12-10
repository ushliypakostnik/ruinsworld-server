// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { IThing } from '../../../models/api';
import type { Things as ThingsEnum } from '../../../models/gameplay';

@Injectable()
export default class Things implements IThing {
  public type: ThingsEnum;
  public x: number;
  public z: number;
  public y: number;
  public rotateY: number;
  public rotateX: number;

  constructor(
    readonly id: string
  ) {
    this.id = id;
  }
}