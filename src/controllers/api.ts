// Nest
import { Controller, Get, Param, HttpCode, Inject } from '@nestjs/common';

// Types
import type { ILocation, IMapUnit, IUserBack } from '../models/api';

// Modules
import Gateway from '../services/gateway';

@Controller()
export default class Api {
  @Inject(Gateway)
  private _gateway: Gateway;

  @Get('/map/:id')
  @HttpCode(200)
  public getMap(@Param() params): { locations: ILocation[], units: IMapUnit[] } {
    return {
      locations: this._gateway.game.world.array.map((location) => {
       return {
          id: location.id,
          x: location.x,
          y: location.y,
          status: this._gateway.game.points.obj[location.id].status,
        };
      }),
      units: this._gateway.game.getUnitsByLocationsId(params.id),
    }
  }

  @Get('/stats')
  @HttpCode(200)
  public getStats(): {
    users: number;
    npc: number;
    live: { [key: string]: number };
    shots: number;
    nowShots: number;
    lights: number;
    nowLights: number;
    storeUsers: IUserBack[]
  } {
    return {
      users: this._gateway.game.users.counter,
      npc: this._gateway.game.npc.counter,
      live: this._gateway.game.npc.counters,
      shots: this._gateway.game.weapon.shots.counter,
      nowShots: this._gateway.game.weapon.shots.list.length,
      lights: this._gateway.game.weapon.lights.counter,
      nowLights: this._gateway.game.weapon.lights.list.length,
      storeUsers: this._gateway.game.users.listBack,
    };
  }

  @Get('/locations/:id')
  @HttpCode(200)
  public getLocation(@Param() params): ILocation {
    // console.log('Controller Get getLocation!!! ', params);
    return this._gateway.game.world.design[params.id];
  }
}
