import * as THREE from 'three';

// Nest
import { Injectable } from '@nestjs/common';

// Types
import type {
  ILocations,
  ILocationsWorld,
  ILocationUnits,
  IPosition,
  ITree,
  IWell,
  IGrass,
  IZone,
  IStone,
  IStone2,
  IBuild,
  ITrash,
  IPin,
  IUpdateMessage,
} from '../../../models/api';
import type { TRayResult } from '../../../models/utils';
import type { ISelf, Octrees } from '../../../models/modules';
import { Fields } from '../../../models/modules';

// Constants
import {
  defaultLocation,
  MAP,
  BUILDS_GENERATION,
  STONES_GENERATION,
  GREEN_GENERATION,
  TRASHES_GENERATION,
  DECOR1_GENERATION,
  DECOR2_GENERATION,
} from './config';
import { EmitterEvents } from '../../../models/modules';
import { Moves, Things as ThingsEnum } from '../../../models/gameplay';

// Utils
import Octree from '../../math/octree';
import Helper from '../../utils/helper';

@Injectable()
export default class World {
  public locations: ILocations;
  public design: ILocationsWorld;
  public array: ILocationUnits[];

  private _ids: string[];
  private _item: ILocationUnits;
  private _x: number;
  private _y: number;
  private _number: number;
  private _number2: number;
  private _number3: number;
  private _positions: IPosition[];
  private _position: IPosition;
  private _trees: ITree[];
  private _wells: IWell[];
  private _stones1: IStone[];
  private _stones2: IStone[];
  private _stones3: IStone[];
  private _stones4: IStone2[];
  private _stones5: IPin[];
  private _builds: IBuild[];
  private _grasses: IGrass[];
  private _zones: IZone[];
  private _trashes: ITrash[];
  private _trashes2: ITrash[];
  private _SIZE = Number(process.env.WORLD); // количество "слоев" вокруг центральной локации
  private _helper: Helper;
  private _group: THREE.Group;
  private _group2: THREE.Group;
  private _mesh: THREE.Mesh;
  private _meshClone: THREE.Mesh;
  private _pseudo: THREE.Mesh;
  private _ray!: THREE.Ray;
  private _result!: TRayResult;
  private _octrees: Octrees;

  private _id: string;
  private _num1: number;
  private _num2: number;

  constructor() {
    this._ids = [];
    this._helper = new Helper();
    this.locations = {};
    this.design = {};
    this.array = [];
    this._octrees = {};
    const alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];

    this._trees = [];
    this._stones1 = [];
    this._stones2 = [];
    this._stones3 = [];
    this._stones4 = [];
    this._stones5 = [];
    this._grasses = [];
    this._zones = [];
    this._trashes = [];
    this._trashes2 = [];
    this._builds = [];
    this._wells = [];

    // Очень далекие горы
    this._stones2 = [];
    this._positions = [];
    for (let n = 0; n < 6; ++n) {
      this._position = this._helper.getUniqueRandomPosition(
        this._positions,
        0,
        0,
        30,
        (process.env.SIZE as unknown as number) * 1.25,
        (process.env.SIZE as unknown as number) * 1.1,
      );

      this._positions.push(this._position);
      this._num1 = (Math.random() + 1) * Helper.randomInteger(5, 10);
      this._stones2.push({
        ...this._position,
        scaleX: this._num1,
        scaleY: this._num1 * (Math.random() + 1.5),
        scaleZ: this._num1,
        rotateY: Helper.randomInteger(0, 360),
      });
    }

    for (let x = 0; x < this._SIZE * 2 + 1; ++x) {
      for (let y = 0; y < this._SIZE * 2 + 1; ++y) {
        const id = Helper.generateUniqueId(2, this._ids);
        this._ids.push(id);

        let config;
        const index = `${(y - this._SIZE).toString()}/${(
          x - this._SIZE
        ).toString()}`;
        if (Helper.isHasProperty(MAP, index)) config = MAP[index];
        else config = defaultLocation(x - this._SIZE, y - this._SIZE);

        config.index = `${alpha[x]}/${y + 1}`;

        // Далекие горы
        this._stones1 = [];
        this._number = Helper.randomInteger(4, 7);
        this._positions = [];
        for (let n = 0; n < this._number + this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            25,
            (process.env.SIZE as unknown as number) * 0.9,
            (process.env.SIZE as unknown as number) * 0.8,
          );

          this._positions.push(this._position);
          this._num1 = (Math.random() + 1) * Helper.randomInteger(3, 6);
          this._stones1.push({
            ...this._position,
            scaleX: this._num1,
            scaleY: this._num1 * (Math.random() + 1.5),
            scaleZ: this._num1,
            rotateY: Helper.randomInteger(0, 360),
          });
        }

        // Здания
        this._builds = [];
        if (
          x >= this._SIZE - 2 &&
          x <= this._SIZE + 2 &&
          y >= this._SIZE - 2 &&
          y <= this._SIZE + 2
        ) {
          this._positions = [];
          this._number2 = BUILDS_GENERATION[y][x];
          this._number = Helper.randomInteger(
            this._number2,
            Math.round(1.5 * this._number2),
          );
          if (x - this._SIZE === 0 && y - this._SIZE === 0) {
            this._number3 = 2.5;
          } else if (
            Math.abs(x - this._SIZE) < 2 &&
            Math.abs(y - this._SIZE) < 2
          ) {
            this._number3 = 1.75;
          } else {
            this._number3 = 1.25;
          }
          for (let n = 0; n < this._number; ++n) {
            this._position = this._helper.getUniqueRandomPosition(
              this._positions,
              0,
              0,
              20,
              (process.env.SIZE as unknown as number) * 0.4,
              30,
            );
            this._positions.push(this._position);
            this._builds.push({
              ...this._position,
              scale: Helper.randomInteger(15, Math.round(15 * this._number3)),
              scaleY: Helper.randomInteger(
                Math.round(15 * this._number3),
                Math.round(35 * this._number3),
              ),
              rotateX: Helper.randomInteger(-15, 15),
              rotateY: Helper.randomInteger(0, 360),
              rotateZ: Helper.randomInteger(-15, 15),
            });
          }
        }

        // Стены
        this._stones3 = [];
        this._number2 = STONES_GENERATION[y][x];
        this._number = Helper.randomInteger(
          Math.round(this._number2 * 3),
          Math.round(this._number2 * 6),
        );
        this._positions = [];
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            5,
            (process.env.SIZE as unknown as number) * 0.5,
            30,
          );
          this._positions.push(this._position);

          if (Helper.yesOrNo()) {
            this._num1 =
              (Math.random() + 1) * this._number2 * Helper.randomInteger(1, 5);
            this._num2 = 0.5;
          } else {
            this._num2 =
              (Math.random() + 1) * this._number2 +
              2 * Helper.randomInteger(1, 5);
            this._num1 = 0.5;
          }
          this._stones3.push({
            ...this._position,
            scaleX: this._num1,
            scaleY: (Math.random() + 1) * this._number2 * 2,
            scaleZ: this._num2,
            rotateY: Helper.randomInteger(0, 360),
          });
        }

        // Камешки
        this._stones4 = [];
        this._positions = [];
        for (let n = 0; n < DECOR1_GENERATION; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            1,
            (process.env.SIZE as unknown as number) * 0.7,
            15,
          );

          this._positions.push(this._position);
          this._stones4.push({
            ...this._position,
            y: 0,
            scale: Math.random() + 0.2,
            rotateY: Helper.randomInteger(0, 360),
            rotateX: Helper.randomInteger(15, 15),
          });
        }

        // Железяки
        this._stones5 = [];
        this._positions = [];
        for (let n = 0; n < DECOR2_GENERATION; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            1,
            (process.env.SIZE as unknown as number) * 0.7,
            15,
          );

          this._positions.push(this._position);
          this._stones5.push({
            ...this._position,
            y: 0,
            scale: (Math.random() + 0.6) * 4,
            rotateY: Helper.randomInteger(0, 360),
            rotateX: Helper.randomInteger(15, 15),
            color: Helper.randomInteger(1, 3),
          });
        }

        // Деревья
        this._trees = [];
        this._positions = [];
        this._number2 = GREEN_GENERATION[y][x];
        this._number = Helper.randomInteger(
          Math.round(this._number2),
          Math.round(1.5 * this._number2),
        );
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            20,
            (process.env.SIZE as unknown as number) * 0.6,
            30,
          );

          this._positions.push(this._position);
          this._trees.push({
            ...this._position,
            scale: Helper.randomInteger(
              this._number2 * 1.5,
              Math.round(2 * this._number2) * 1.5,
            ),
            rotateX: Helper.randomInteger(-1, 15),
            rotateY: Helper.randomInteger(0, 360),
            rotateZ: Helper.randomInteger(-1, 15),
          });
        }

        // Кусты
        this._grasses = [];
        this._positions = [];
        this._number2 = GREEN_GENERATION[y][x];
        this._number = Helper.randomInteger(
          Math.round(1 * this._number2),
          Math.round(3 * this._number2),
        );
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            10,
            (process.env.SIZE as unknown as number) * 0.6,
            30,
          );
          this._positions.push(this._position);
          this._grasses.push({
            ...this._position,
            scale: Helper.randomInteger(2, Math.round(1.5 * this._number2)),
          });
        }

        // Отравленные зоны
        this._zones = [];
        this._positions = [];
        this._number = Helper.randomInteger(3, 5);
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            30,
            (process.env.SIZE as unknown as number) * 0.35,
            50,
          );
          this._positions.push(this._position);
          this._zones.push({
            ...this._position,
            radius: Helper.randomInteger(15, 30),
          });
        }

        // Помойки
        this._trashes = [];
        this._positions = [];
        this._number2 = TRASHES_GENERATION[y][x];
        this._number = Helper.randomInteger(
          Math.round(1.5 * (this._number2 + Math.random())),
          Math.round(2.5 * (this._number2 + Math.random())),
        );
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            25,
            (process.env.SIZE as unknown as number) * 0.33,
            40,
          );
          this._positions.push(this._position);
          this._trashes.push({
            ...this._position,
            scale: Helper.randomInteger(15, 30) * (Math.random() + 1.75),
            scaleY: (Math.random() + 1) * 1.25, // Не трогать !!!
            rotate: Helper.randomInteger(0, 360),
          });
        }

        // Горки
        this._trashes2 = [];
        this._positions = [];
        this._number2 = TRASHES_GENERATION[y][x];
        this._number = Helper.randomInteger(
          Math.round(1.5 * (this._number2 + Math.random())),
          Math.round(2.5 * (this._number2 + Math.random())),
        );
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            25,
            (process.env.SIZE as unknown as number) * 0.33,
            40,
          );
          this._positions.push(this._position);
          this._trashes2.push({
            ...this._position,
            scale: Helper.randomInteger(15, 45) * (Math.random() + 1.5),
            scaleY: (Math.random() + 1) * 1.5, // Не трогать !!!
            rotate: Helper.randomInteger(0, 360),
          });
        }

        // Колодцы
        this._wells = [];
        this._positions = [];
        this._number = Helper.randomInteger(2, 4);
        for (let n = 0; n < this._number; ++n) {
          this._position = this._helper.getUniqueRandomPosition(
            this._positions,
            0,
            0,
            30,
            (process.env.SIZE as unknown as number) * 0.33,
            40,
          );
          this._positions.push(this._position);
          this._wells.push({
            ...this._position,
            y: 0,
            rotate: Helper.randomInteger(0, 360),
          });
        }

        const location = {
          id,
          x: x - this._SIZE,
          y: y - this._SIZE,
        };
        this.locations[id] = {
          ...location,
          users: [],
          npc: [],
          things: [],
        };
        this.design[id] = {
          ...location,
          ...config,
          trees: this._trees,
          stones1: this._stones1,
          stones2: this._stones2,
          stones3: this._stones3,
          stones4: this._stones4,
          stones5: this._stones5,
          grasses: this._grasses,
          zones: this._zones,
          trashes: this._trashes,
          trashes2: this._trashes2,
          builds: this._builds,
          wells: this._wells,
        };
        this.array.push({ ...location, users: [], npc: [], things: [] });
      }
    }
  }

  public init(self: ISelf) {
    // Создаем основу для всех локаций - основное "октодерево" каждой локации
    this.array.forEach((location: ILocationUnits) => {
      this._mesh = new THREE.Mesh(
        new THREE.BoxGeometry(
          Number(process.env.SIZE) * 1.6,
          1,
          Number(process.env.SIZE) * 1.6,
        ),
        new THREE.MeshBasicMaterial(),
      );
      this._mesh.position.y = -2.5;
      this._meshClone = this._mesh.clone();

      this._group = new THREE.Group();
      this._group.add(this._mesh);

      this._group2 = new THREE.Group();
      this._group2.add(this._meshClone);

      // Respauns
      this._mesh = new THREE.Mesh(
        new THREE.BoxGeometry(20.5 * 1.5, 20.5 * 1.2, 20.5 * 1.5),
      );
      this._mesh.position.set(0, -2.5, 0);
      this._meshClone = new THREE.Mesh(
        new THREE.BoxGeometry(20.5 * 1.25, 20.5 * 1.1, 20.5 * 1.25),
      );
      this._meshClone.position.set(0, -2.5, 0);
      this._group.add(this._mesh);
      this._group.add(this._meshClone);

      // Деревья
      this._pseudo = new THREE.Mesh(
        new THREE.BoxGeometry(1, 3, 1),
        new THREE.MeshBasicMaterial(),
      );
      this.design[location.id].trees.forEach((tree) => {
        this._mesh = this._pseudo.clone();
        this._mesh.position.set(tree.x, tree.scale / -5 - 2, tree.z);
        this._mesh.scale.set(
          tree.scale / 2,
          3,
          tree.scale * 2.5,
          tree.scale / 2.3,
        );
        this._mesh.rotateX(Helper.degreesToRadians(tree.rotateX));
        this._mesh.rotateY(Helper.degreesToRadians(tree.rotateY));
        this._mesh.rotateZ(Helper.degreesToRadians(tree.rotateZ));
        this._group.add(this._mesh);
      });

      // Стены
      this._pseudo = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial(),
      );
      this.design[location.id].stones3.forEach((stone) => {
        this._mesh = this._pseudo.clone();
        this._mesh.position.set(stone.x, stone.scaleY / -2, stone.z);
        this._mesh.scale.set(stone.scaleX, stone.scaleY, stone.scaleZ);
        this._mesh.rotateY(Helper.degreesToRadians(stone.rotateY));
        this._group.add(this._mesh);
      });

      // Помойки и горки
      this._pseudo = new THREE.Mesh(
        new THREE.ConeGeometry(1, 8),
        new THREE.MeshBasicMaterial(),
      );
      this.design[location.id].trashes
        .concat(this.design[location.id].trashes2)
        .forEach((trash) => {
          this._mesh = this._pseudo.clone();
          this._mesh.position.set(trash.x, trash.scaleY / -2 - 2, trash.z);
          this._mesh.scale.set(trash.scale, trash.scaleY, trash.scale);
          this._mesh.rotateY(Helper.degreesToRadians(trash.rotate));
          this._meshClone = this._mesh.clone();
          this._group.add(this._mesh);
          this._group2.add(this._meshClone);
        });

      // Добавляем строения
      this.design[location.id].builds.forEach((build) => {
        this._mesh = new THREE.Mesh(
          new THREE.BoxGeometry(
            build.scale * 1.3,
            build.scaleY * 2.15,
            build.scale * 1.3,
          ),
          new THREE.MeshBasicMaterial(),
        );
        this._mesh.position.set(build.x, build.scaleY * -0.25 - 4, build.z);
        this._mesh.rotateZ(Helper.degreesToRadians(build.rotateZ));
        this._mesh.rotateX(Helper.degreesToRadians(build.rotateX));
        this._mesh.rotateY(Helper.degreesToRadians(build.rotateY));
        this._group.add(this._mesh);
      });

      self.octrees[location.id] = new Octree();
      self.octrees[location.id].fromGraphNode(this._group);

      this._octrees[location.id] = new Octree();
      this._octrees[location.id].fromGraphNode(this._group2);

      // Улучшаем позиции камешков и железяк
      this.design[location.id].stones4.forEach((stone) => {
        this._ray = new THREE.Ray(
          new THREE.Vector3(stone.x, 50, stone.z),
          new THREE.Vector3(0, -60, 0),
        );
        this._result = this._octrees[location.id].rayIntersect(this._ray);
        if (this._result) {
          if (this._result.position.y > -2)
            stone.y = this._result.position.y + 1.6;
          else stone.y = -0.25;
        }
      });
      this.design[location.id].stones5.forEach((pin) => {
        this._ray = new THREE.Ray(
          new THREE.Vector3(pin.x, 50, pin.z),
          new THREE.Vector3(0, -60, 0),
        );
        this._result = this._octrees[location.id].rayIntersect(this._ray);
        if (this._result) pin.y = this._result.position.y + 1.5;
      });

      this.design[location.id].wells.forEach((well) => {
        this._ray = new THREE.Ray(
          new THREE.Vector3(well.x, 50, well.z),
          new THREE.Vector3(0, -60, 0),
        );
        this._result = this._octrees[location.id].rayIntersect(this._ray);
        if (this._result) well.y = this._result.position.y + 2;
      });
    });

    // addNPC event subscribe
    self.emiiter.on(EmitterEvents.addNPC, (npc) => {
      if (Number(process.env.WORLD) === 0) {
        this._num1 = 0;
        this._num2 = 0;
      } else {
        this._num1 =
          Helper.randomInteger(0, Number(process.env.WORLD)) *
          Helper.staticPlusOrMinus();
        this._num2 =
          Helper.randomInteger(0, Number(process.env.WORLD)) *
          Helper.staticPlusOrMinus();
      }
      this._id = this.getLocationIdByCoords(this._num1, this._num2);
      // console.log('World addNPC', this._num1, this._num2, this._id);
      this._addUnitOnLocation(self, npc.id, this._id, Fields.npc);
    });

    // addThing event subscribe
    self.emiiter.on(EmitterEvents.addThing, (thing) => {
      if (Number(process.env.WORLD) === 0) {
        this._num1 = 0;
        this._num2 = 0;
      } else {
        this._num1 =
          Helper.randomInteger(0, Number(process.env.WORLD)) *
          Helper.staticPlusOrMinus();
        this._num2 =
          Helper.randomInteger(0, Number(process.env.WORLD)) *
          Helper.staticPlusOrMinus();
      }
      this._id = this.getLocationIdByCoords(this._num1, this._num2);

      // Знаем локацию - тыкаем в модель сцены
      /////////////////////////////////////////////////////////////////////
      // Внимание!!! Максимальная высота холмов сейчас 8 * 5!!!
      this._ray = new THREE.Ray(
        new THREE.Vector3(thing.x, thing.y + 50, thing.z),
        new THREE.Vector3(0, -60, 0),
      );
      this._result = this._octrees[this._id].rayIntersect(this._ray);
      if (this._result) {
        // console.log(thing.id, this._result.position.y);
        this._number =
          thing.type === ThingsEnum.go
            ? this._result.position.y > -2
              ? 1.95
              : 1.85
            : thing.type === ThingsEnum.vodka
            ? this._result.position.y > -2
              ? 1.75
              : 1.8
            : 1.85;
        self.emiiter.emit(EmitterEvents.onAddThing, {
          id: thing.id,
          y:
            this._result.position.y > -2
              ? thing.y + this._result.position.y + this._number
              : thing.y,
        });
      }

      // console.log('World addThing', this._result);

      this._addUnitOnLocation(self, thing.id, this._id, Fields.things);
    });
  }

  public setNewPlayer(self: ISelf, id: string, location: string): void {
    // console.log('World setNew Player', id);
    this._addUnitOnLocation(self, id, location, Fields.users);
  }

  public onReenter(message: IUpdateMessage): void {
    if (message && Helper.isHasProperty(message, 'id')) {
      this._id = this.getLocationIdByUnitId(message.id as string, Fields.users);
      this.removeUnitFromLocation(message.id as string, this._id, Fields.users);
    }
  }

  public getLocationIdByCoords(x: number, y: number): string {
    return this.array.find(
      (location: ILocationUnits) => location.x === x && location.y === y,
    ).id;
  }

  private _getCoordsIdByLocationId(id: string): { x: number; y: number } {
    this._item = this.array.find(
      (location: ILocationUnits) => location.id === id,
    );
    return {
      x: this._item.x,
      y: this._item.y,
    };
  }

  public getLocationIdByUnitId(id: string, field: Fields): string {
    this._item = this.array.find((location: ILocationUnits) =>
      location[field].includes(id),
    );
    if (this._item) return this._item.id;
    return '';
  }

  private _addUnitOnLocation(
    self: ISelf,
    id: string,
    locationId: string,
    field: Fields,
  ): void {
    this.locations[locationId][field].push(id);
    this.array
      .find((location: ILocationUnits) => location.id === locationId)
      [field].push(id);
    self.units[id] = locationId;
  }

  public removeUnitFromLocation(
    id: string,
    locationId: string,
    field: Fields,
  ): void {
    if (!this.locations[locationId]) {
      console.log('AAAAAAAA', id, locationId, field, this.locations);
    }
    this.locations[locationId][field] = this.locations[locationId][
      field
    ].filter((unit) => unit !== id);
    this._item = this.array.find((location) => location.id === locationId);
    this._item[field] = this._item[field].filter((unit) => unit !== id);
  }

  public updatePlayer(id: string): string {
    this._id = this.getLocationIdByUnitId(id, Fields.users);
    // console.log('World updatePlayer', id, this._id);
    return this._id;
  }

  public onRelocation(self: ISelf, message: IUpdateMessage): void {
    // console.log('World onRelocation: ', message, this.locations[`${message.location}`]);
    if (
      message &&
      Helper.isHasProperty(message, 'id') &&
      Helper.isHasProperty(message, 'location')
    ) {
      this.removeUnitFromLocation(
        message.id as string,
        message.location as string,
        Fields.users,
      );
      const coords: { x: number; y: number } = this._getCoordsIdByLocationId(
        message.location as string,
      );
      this._x = coords.x;
      this._y = coords.y;
      if (message.direction === Moves.right) this._x += 1;
      else if (message.direction === Moves.left) this._x -= 1;
      else if (message.direction === Moves.bottom) this._y += 1;
      else if (message.direction === Moves.top) this._y -= 1;
      if (Math.abs(this._x) > this._SIZE) {
        if (this._x > 0) this._x -= 1;
        else this._x += 1;
        this._x *= -1;
      }

      if (Math.abs(this._y) > this._SIZE) {
        if (this._y > 0) this._y -= 1;
        else this._y += 1;
        this._y *= -1;
      }
      this._addUnitOnLocation(
        self,
        message.id as string,
        this.getLocationIdByCoords(this._x, this._y),
        Fields.users,
      );
      // console.log('World onRelocation', this.locations, this.array);
    }
  }

  public onNPCRelocation(self: ISelf, message: IUpdateMessage): void {
    // console.log('World onNPCRelocation: ', message, this.locations[`${message.location}`]);
    if (
      message &&
      Helper.isHasProperty(message, 'id') &&
      Helper.isHasProperty(message, 'location')
    ) {
      this.removeUnitFromLocation(
        message.id as string,
        message.location as string,
        Fields.npc,
      );
      const coords: { x: number; y: number } = this._getCoordsIdByLocationId(
        message.location as string,
      );
      this._x = coords.x;
      this._y = coords.y;
      if (message.direction === Moves.right) this._x += 1;
      else if (message.direction === Moves.left) this._x -= 1;
      else if (message.direction === Moves.bottom) this._y += 1;
      else if (message.direction === Moves.top) this._y -= 1;

      if (Math.abs(this._x) > this._SIZE) {
        if (this._x > 0) this._x -= 1;
        else this._x += 1;
        this._x *= -1;
      }

      if (Math.abs(this._y) > this._SIZE) {
        if (this._y > 0) this._y -= 1;
        else this._y += 1;
        this._y *= -1;
      }
      this._addUnitOnLocation(
        self,
        message.id as string,
        this.getLocationIdByCoords(this._x, this._y),
        Fields.npc,
      );
      // console.log('World onNPCRelocation', message, this._x, this._y);
    }
  }
}
