import * as THREE from 'three';

// Types
import type { IShot, IUnit } from '../../../models/api';
import type { ISelf } from '../../../models/modules';

// Modules
import Shots from './shots';
import Lights from './lights';

export default class Weapon {
  // Modules
  public shots: Shots;
  public lights: Lights;

  constructor() {
    // Modules
    this.shots = new Shots();
    this.lights = new Lights();
  }

  public onShot(message: IShot): IShot {
    return this.shots.onShot(message);
  }

  public onNPCShot(self: ISelf, message: { unit: IUnit, target: THREE.Vector3 }): void {
    this.lights.onNPCShot(self, message);
  }

  public onUnshot(message: number): string {
    return this.shots.onUnshot(message);
  }

  public onUnshotExplosion(message: number): void {
    this.shots.onUnshotExplosion(message);
  }

  public animate(self: ISelf) {
    this.lights.animate(self);
  }
}
