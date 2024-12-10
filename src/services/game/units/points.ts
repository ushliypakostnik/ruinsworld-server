// Nest
import { Injectable } from '@nestjs/common';

// Types
import type { IPoints, IPointMessage } from '../../../models/api';
import { Races } from 'src/models/gameplay';

@Injectable()
export default class Points {
  public obj: IPoints;

  constructor() {
    this.obj = {};
  }

  // При инициализации учитываем "родные локации игровых рас" на которых нельзя менять флаг
  public init(locations: any) {
    locations.forEach((location) => {
      if (location.isHuman) this.obj[`${location.id}`] = { status: Races.human };
      else if (location.isReptiloid) this.obj[`${location.id}`] = { status: Races.reptiloid };
      else this.obj[`${location.id}`] = { status: null };
    });
  }

  // На смену флага на локации
  public onPoint(message: IPointMessage): void {
    this.obj[`${message.location}`] = { status: message.race };
  }
}
