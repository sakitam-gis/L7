/**
 * @author: sakitam-fdd <smilefdd@gmail.com>
 * @date: 20191031
 * @desc: maptalks 的适配器
 */

import {
  Bounds,
  CoordinateSystem,
  ICoordinateSystemService,
  ILngLat,
  IMapConfig,
  IMapService,
  IPoint,
  IViewport,
  MapType,
  TYPES,
} from '@l7/core';
import {DOM} from '@l7/utils';
import {inject, injectable} from 'inversify';
// @ts-ignore
import * as maptalks from 'maptalks';
import {ICenter, IMaptalksInstance} from '../../typings/index';
import Viewport from './Viewport';

const EventMap: {
  [key: string]: any;
} = {
  zoomstart: 'zoomstart',
  zoomchange: 'zooming',
  zoomend: 'zoomend',
  mapmove: 'moving',
  camerachange: 'zoomstart zooming zoomend movestart moving moveend dragrotatestart dragrotating dragrotateend resize spatialreferencechange',
};

const LNGLAT_OFFSET_ZOOM_THRESHOLD = 12;
const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20));

// @ts-ignore
export interface IMaptalksMapConfig extends IMapConfig {
  id: string | HTMLElement | HTMLCanvasElement;

  /**
   * maptalks inner layer container
   */
  layerContainer?: 'front' | 'back';

  baseLayer?: any,
  layers?: any[],
}

// @ts-ignore
export interface IMaptalksService extends IMapService {
  init(config: Partial<IMaptalksMapConfig>): void;
  map: IMaptalksInstance;

  getCenter(): ICenter;
  setMapStyle?: any;
}

/**
 * MaptalksService
 */
@injectable()
export default class MaptalksService implements IMaptalksService {
  public map: IMaptalksInstance;
  @inject(TYPES.ICoordinateSystemService)
  private readonly coordinateSystemService: ICoordinateSystemService;
  private viewport: Viewport;
  private markerContainer: HTMLElement;
  private cameraChangedCallback: (viewport: IViewport) => void;
  private $mapContainer: HTMLElement | HTMLCanvasElement | null;
  private $mapConfig: IMaptalksMapConfig;

  // init
  public addMarkerContainer(): void {
    const container = this.map.getContainer();
    this.markerContainer = DOM.create('div', 'l7_marker', container);
  }

  public getMarkerContainer(): HTMLElement {
    return this.markerContainer;
  }

  //  map event
  public on(type: string, handle: (...args: any[]) => void): void {
    this.map && this.map.on(EventMap[type] || type, handle);
  }
  public off(type: string, handle: (...args: any[]) => void): void {
    this.map && this.map.off(EventMap[type] || type, handle);
  }

  public getContainer(): HTMLElement | null {
    const { layerContainer } = this.$mapConfig;
    return layerContainer === 'front' ? this.map._panels['frontStatic'] : this.map._panels['backStatic'];
  }

  public getSize(): [number, number] {
    const size = this.map.getSize();
    return [size.width, size.height];
  }
  // get mapStatus method

  public getType() {
    return MapType.maptalks;
  }

  /**
   * get map zoom leave
   */
  public getZoom(): number {
    return 19 - Math.log(this.map.getResolution() / MAX_RES) / Math.LN2;
  }

  /**
   * set map zoom
   * @param zoom
   */
  public setZoom(zoom: number) {
    this.map.setZoom(zoom);
  }

  public getCenter() {
    return this.map.getCenter();
  }

  public setCenter(center: [number, number]) {
    this.map.setCenter(center);
  }

  public getPitch(): number {
    return this.map.getPitch();
  }

  public getRotation(): number {
    return this.map.getBearing();
  }

  public getBounds(): Bounds {
    const extent = this.map.getExtent();
    return [[extent.xmin, extent.ymin], [extent.xmax, extent.ymax]] as Bounds;
  }

  public getMinZoom(): number {
    return this.map.getMinZoom();
  }

  public getMaxZoom(): number {
    return this.map.getMaxZoom();
  }

  public setRotation(rotation: number): void {
    this.map.setBearing(rotation);
  }

  public zoomIn(): void {
    this.map.zoomIn();
  }

  public zoomOut(): void {
    this.map.zoomOut();
  }

  public panTo(p: [number, number]): void {
    this.map.panTo(new maptalks.Coordinate(p));
  }

  public panBy(pixel: [number, number]): void {
    this.map.panBy(new maptalks.Point(pixel));
  }

  public fitBounds(bound: Bounds): void {
    this.map.fitExtent(new maptalks.Extent(bound[0][0], bound[0][1], bound[1][0], bound[1][1]));
  }

  public setMaxZoom(max: number): void {
    this.map.setMaxZoom(max);
  }

  public setMinZoom(min: number): void {
    this.map.setMinZoom(min);
  }

  public setZoomAndCenter(zoom: number, center: [number, number]): void {
    this.map.setCenterAndZoom(new maptalks.Coordinate(center), zoom);
  }

  // TODO: 计算像素坐标
  public pixelToLngLat(pixel: [number, number]): ILngLat {
    const coordinates = this.map.containerPointToCoordinate(new maptalks.Point(pixel));
    return {
      lng: coordinates.x,
      lat: coordinates.y,
    };
  }

  public lngLatToPixel(lnglat: [number, number]): IPoint {
    return this.map.coordinateToContainerPoint(new maptalks.Coordinate(lnglat));
  }

  public containerToLngLat(pixel: [number, number]): ILngLat {
    const coordinates = this.map.containerPointToCoordinate(new maptalks.Point(pixel));
    return {
      lng: coordinates.x,
      lat: coordinates.y,
    };
  }

  public lngLatToContainer(lnglat: [number, number]): IPoint {
    return this.map.coordinateToContainerPoint(new maptalks.Coordinate(lnglat));
  }

  public async init(mapConfig: IMaptalksMapConfig): Promise<void> {
    const { id, ...rest } = mapConfig;
    if (typeof id === 'string') {
      this.$mapContainer = document.getElementById(id);
    } else {
      this.$mapContainer = id;
    }

    this.viewport = new Viewport();

    // @ts-ignore
    this.map = new maptalks.Map(id, {
      ...rest,
    });

    this.map.on('zoomstart zooming zoomend movestart moving moveend dragrotatestart dragrotating dragrotateend resize spatialreferencechange', this.handleCameraChanged, this);
    this.handleCameraChanged();
  }

  public destroy() {
    this.map.remove();
    this.$mapContainer = null;
  }

  public getMapContainer() {
    return this.$mapContainer;
  }

  public onCameraChanged(callback: (viewport: IViewport) => void): void {
    this.cameraChangedCallback = callback;
  }
  // 同步不同底图的配置项
  private initMapConig(): void {
    throw new Error('Method not implemented.');
  }
  private handleCameraChanged = () => {
    const { x: lng, y: lat } = this.map.getCenter();
    const size = this.map.getSize();
    // resync
    this.viewport.syncWithMapCamera({
      bearing: this.map.getBearing(),
      center: [lng, lat],
      viewportHeight: size.height,
      pitch: this.map.getPitch(),
      viewportWidth: size.width,
      zoom: this.getZoom(),
      cameraHeight: 0,
    });

    // set coordinate system
    if (this.viewport.getZoom() > LNGLAT_OFFSET_ZOOM_THRESHOLD) {
      this.coordinateSystemService.setCoordinateSystem(
        CoordinateSystem.LNGLAT_OFFSET,
      );
    } else {
      this.coordinateSystemService.setCoordinateSystem(CoordinateSystem.LNGLAT);
    }

    this.cameraChangedCallback(this.viewport);
  };
}
