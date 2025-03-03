import { IMapService } from '../map/IMapService';
export enum PositionType {
  'TOPRIGHT' = 'topright',
  'TOPLEFT' = 'topleft',
  'BOTTOMRIGHT' = 'bottomright',
  'BOTTOMLEFT' = 'bottomleft',
}
export interface IControlOption {
  position: PositionType;
}
export interface IControlServiceCfg {
  container: HTMLElement;
}
export interface IControlCorners {
  [key: string]: HTMLElement;
}
export interface IControl {
  setPosition(pos: PositionType): void;
  addTo(map: IMapService): void;
  onAdd(map: IMapService): HTMLElement;
  hide(): void;
  show(): void;
  remove(): void;
}
export interface IControlService {
  container: HTMLElement;
  controlCorners: IControlCorners;
  controlContainer: HTMLElement;
  init(cfg: IControlServiceCfg): void;
  addControl(ctr: IControl, map: IMapService): void;
  removeControl(ctr: IControl): void;
  destroy(): void;
}
