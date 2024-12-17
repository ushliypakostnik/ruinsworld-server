// Nest
import { Controller, Get, Param, HttpCode, Inject } from '@nestjs/common';

// Types
import type { ILocation, IMapUnit } from '../models/api';

// Constants
import { RacesConfigAPI, ThingsConfig } from '../models/gameplay';

// Modules
import Gateway from '../services/gateway';

@Controller()
export default class Api {
  @Inject(Gateway)
  private _gateway: Gateway;

  @Get('/config')
  @HttpCode(200)
  public getCofig(): {
    version: string,
    size: number,
    exp: number,
    humansX: number,
    humansY: number,
    reptilsX: number,
    reptilsY: number,
    races: typeof RacesConfigAPI;
    things: typeof ThingsConfig;
  } {
    // console.log('Controller Get getCofig!!! ');
    return {
      version: process.env.VERSION,
      size: Number(process.env.SIZE),
      exp: Number(process.env.EXP_COEF_USER),
      humansX: Number(process.env.START_X_HUMANS),
      humansY: Number(process.env.START_Y_HUMANS),
      reptilsX: Number(process.env.START_X_REPTILOIDS),
      reptilsY: Number(process.env.START_Y_REPTILOIDS),
      races: RacesConfigAPI,
      things: ThingsConfig,
    };
  }

  @Get('/locations/:id')
  @HttpCode(200)
  public getLocation(@Param() params): ILocation {
    // console.log('Controller Get getLocation!!! ', params);
    return this._gateway.game.world.design[params.id];
  }

  @Get('/map/:id')
  @HttpCode(200)
  public getMap(@Param() params): {
    locations: ILocation[];
    units: IMapUnit[];
  } {
    // console.log('Controller Get getMap!!! ', params);
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
    };
  }

  @Get('/stats')
  @HttpCode(200)
  public getStats(): {
    users: number;
    npc: number;
    live: { [key: string]: number };
    things: number;
    nowThings: { [key: string]: number };
    shots: number;
    nowShots: number;
    lights: number;
    nowLights: number;
  } {
    return {
      users: this._gateway.game.users.counter,
      npc: this._gateway.game.npc.counter,
      live: this._gateway.game.npc.counters,
      things: this._gateway.game.things.counter,
      nowThings: this._gateway.game.things.counters,
      shots: this._gateway.game.weapon.shots.counter,
      nowShots: this._gateway.game.weapon.shots.list.length,
      lights: this._gateway.game.weapon.lights.counter,
      nowLights: this._gateway.game.weapon.lights.list.length,
    };
  }

  @Get('/destroy')
  @HttpCode(200)
  public destroy(): void {
    console.log('Controller Get destroy!!! ');
  }
}
