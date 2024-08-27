// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { IPoint } from '../../../models/api';
import { Races } from 'src/models/gameplay';

@Injectable()
export default class Point implements IPoint {
  public id: string;
  public status: Races.human | Races.reptiloid | null;

  constructor() {
    this.status = null;
  }
}
