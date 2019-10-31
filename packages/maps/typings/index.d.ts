/// <reference path="../../../node_modules/@types/amap-js-api/index.d.ts" />

import { IControl } from 'mapbox-gl';

interface Window {
  onLoad: () => void;
}
interface IAMapEvent {
  camera: {
    fov: number;
    near: number;
    far: number;
    height: number;
    pitch: number;
    rotation: number;
    aspect: number;
    position: { x: number; y: number };
  };
}

interface IAMapInstance {
  get(key: string): unknown;
}

interface IMapboxInstance {
  _controls: IControl[];
  transform: {
    width: number;
    height: number;
  };
}

export interface ICenter {
  x: number;
  y: number;
}

export interface IExtent {
  projection?: any;
  xmax: number;
  xmin: number;
  ymax: number;
  ymin: number;
}

export interface IMaptalksInstance {
  _panels: {
    ui: HTMLElement;
    backStatic: HTMLElement;
    frontStatic: HTMLElement;
    canvasContainer: HTMLElement;
  }

  getContainer: () => HTMLElement;

  getZoom: () => number;
  getResolution: () => number;
  setZoom: (zoom: number) => IMaptalksInstance;

  getSize: () => { width: number; height: number };
  setSize: (size: [number, number]) => IMaptalksInstance;

  getCenter: () => ICenter;
  setCenter: (center: [number, number]) => IMaptalksInstance;

  getPitch: () => number;
  setPitch: (pitch: number) => IMaptalksInstance;

  getBearing: () => number;
  setBearing: (bearing: number) => IMaptalksInstance;

  getExtent: () => IExtent;

  getMinZoom: () => number;
  setMinZoom: (minZoom: number) => IMaptalksInstance;
  setMaxZoom: (maxZoom: number) => IMaptalksInstance;
  getMaxZoom: () => number;

  zoomIn: () => IMaptalksInstance;
  zoomOut: () => IMaptalksInstance;

  panTo: (coordinates: any, options?: {
    animation: boolean;
    duration: number;
  }) => IMaptalksInstance;

  panBy: (point: any, options?: {
    animation: boolean;
    duration: number;
  }) => IMaptalksInstance;

  fitExtent: (extent: IExtent, zoomOffset?: number) => IMaptalksInstance;

  setCenterAndZoom: (center: any, zoom: number) => IMaptalksInstance;

  coordinateToContainerPoint: (coordinates: any) => any;
  containerPointToCoordinate: (point: any) => any;

  on: (...args: any[]) => IMaptalksInstance;
  off: (...args: any[]) => IMaptalksInstance;

  remove: () => void;
}
