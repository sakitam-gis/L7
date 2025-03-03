import { EventEmitter } from 'eventemitter3';
import { IImage } from '../asset/IIconService';
import { ILayer } from '../layer/ILayerService';
import { IMapConfig } from '../map/IMapService';
import { IRenderConfig } from '../renderer/IRendererService';

export interface ISceneService {
  on(type: string, hander: (...args: any[]) => void): void;
  off(type: string, hander: (...args: any[]) => void): void;
  removeAllListeners(event?: string): this;
  init(config: IMapConfig & IRenderConfig): void;
  addLayer(layer: ILayer): void;
  render(): void;
  destroy(): void;
}
export const SceneEventList = ['loaded', 'resize', 'destroy'];
