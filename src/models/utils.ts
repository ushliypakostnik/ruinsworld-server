import type { Vector3, Triangle } from 'three';

export type TPosition = {
  x: number;
  z: number;
};
export type TPositions = Array<TPosition>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TConfig = { readonly [key: string]: any };

type TMessagesLanguage = { [key: string]: string };
export type TMessages = {
  readonly en: TMessagesLanguage;
  readonly ru: TMessagesLanguage;
};

export type TEventsData = number | null | undefined;
export type TEvents = {
  id: number;
  time: number;
  delay: number;
  data: TEventsData;
  callback: (data: TEventsData) => void;
};

type TResultTrue = {
  normal: Vector3;
  point?: Vector3;
  depth: number;
};
export type TResult = TResultTrue | false;

type TRayResultTrue = {
  distance: number;
  triangle: Triangle;
  position: Vector3;
};
export type TRayResult = TRayResultTrue | false;
