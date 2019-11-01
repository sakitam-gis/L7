import Engine from './engine';
import { LAYER_MAP } from '../layer';
import Base from './base';
import LoadImage from './image';
import FontAtlasManager from './atlas/font-manager';
import { getMap } from '../map/index';
import Global from '../global';
import { getInteraction } from '../interaction/index';
import { compileBuiltinModules } from '../geom/shader';
import Style from './style';
import Controller from './controller/control';
import * as Control from '../component/control';
import { epsg3857 } from '@antv/geo-coord/lib/geo/crs/crs-epsg3857';
import throttle from '../util/throttle';
const EventNames = [ 'mouseout', 'mouseover', 'mousedown', 'mouseleave', 'touchstart', 'touchmove', 'touchend', 'mouseup', 'rightclick', 'click', 'dblclick' ];
export default class Scene extends Base {
  getDefaultCfg() {
    return Global.scene;
  }
  constructor(cfg) {
    super(cfg);
    this._initMap();
    this.crs = epsg3857;
    this.fontAtlasManager = new FontAtlasManager();
    this._layers = [];
    this.animateCount = 0;
  }

  _initEngine(mapContainer) {
    this._engine = new Engine(mapContainer, this);
    this.addImage();// 初始化图标加载器
    this.registerMapEvent(); // 和高德地图同步状态
    // this._engine.run();
    compileBuiltinModules();
  }
  _initContoller() {
    const controlCtr = new Controller({ scene: this });
    this.set('controlController', controlCtr);
    if (this.get('zoomControl')) {
      const zoomControl = new Control.Zoom().addTo(this);
      this.set('zoomControl', zoomControl);

    }
    if (this.get('scaleControl')) {
      const scaleControl = new Control.Scale().addTo(this);
      this.set('scaleControl', scaleControl);
    }
    if (this.get('attributionControl')) {
      const attributionControl = new Control.Attribution().addTo(this);
      this.set('attributionControl', attributionControl);
    }
  }
  // 为pickup场景添加 object 对象
  addPickMesh(object) {
    this._engine._picking.add(object);
  }
  _initMap() {
    this.mapContainer = this.get('id');
    this.mapType = this.get('mapType') || 'amap';
    const MapProvider = getMap(this.mapType);
    const Map = new MapProvider(this._attrs);
    Map.mixMap(this);
    this.mapProvider = Map;
    this._container = Map.container;
    Map.on('mapLoad', () => {
      this.map = Map.map;
      this._markerContainier = Map.l7_marker_Container;
      this._initEngine(Map.renderDom);
      Map.asyncCamera(this._engine);
      this.initLayer();
      this._registEvents();
      const hash = this.get('hash');
      if (hash) {
        const Ctor = getInteraction('hash');
        const interaction = new Ctor({ layer: this });
        interaction._onHashChange();
      }
      this.style = new Style(this, {});
      this._initContoller();
      this.emit('loaded');
    });
  }
  initLayer() {
    for (const key in LAYER_MAP) {
      Scene.prototype[key] = cfg => {
        const layer = new LAYER_MAP[key](this, cfg);
        this._layers.push(layer);
        return layer;
      };
    }

  }
  // 添加 Tile Source
  addTileSource(id, Sourcecfg) {
    this.style.addSource(id, Sourcecfg);
  }
  getTileSource(id) {
    return this.style.getSource(id);
  }
  on(type, hander) {
    if (this.map) { this.map.on(type, hander); }
    super.on(type, hander);
  }
  off(type, hander) {
    if (this.map) { this.map.off(type, hander); }
    super.off(type, hander);
  }
  addImage() {
    this.image = new LoadImage();
    this.image.on('imageLoaded', () => {
      this._engine.update();
    });
  }
  _initEvent() {

  }
  getLayers() {
    return this._layers;
  }
  getLayer(id) {
    let res = false;
    this._layers.forEach(layer => {
      if (layer.layerId === id) {
        res = layer;
        return;
      }
    });
    return res;
  }
  _addLayer() {

  }
  getContainer() {
    return this._container;
  }
  getMarkerContainer() {
    return this._markerContainier;
  }
  map2Png() {
    this.scene._engine.update();
    const vis = this.scene._engine._renderer.domElement.toDataURL();
    const map = this.scene.map.getContainer().getElementsByClassName('amap-layer')[0].toDataURL();
    return [ map, vis ];

  }
  _registEvents() {
    this._eventHander = e => {
      if (e.target.nodeName !== 'CANVAS') return;
      this._engine._picking.pickdata(e);
    };
    this._throttleHander = throttle(this._eventHander, 50);
    EventNames.forEach(event => {
      this._container.addEventListener(event, this._eventHander, true);
    });
    // mousemove 事件截流
    this._container.addEventListener('mousemove', this._throttleHander, true);
  }
  _unRegistEvents() {
    EventNames.forEach(event => {
      this._container.removeEventListener(event, this._eventHander, true);
    });
    this._container.removeEventListener('mousemove', this._throttleHander, true);
  }
  removeLayer(layer) {
    const layerIndex = this._layers.indexOf(layer);
    if (layerIndex > -1) {
      this._layers.splice(layerIndex, 1);
    }
    layer.destroy();
    layer = null;
    this._engine.update();
  }
  startAnimate() {
    if (this.animateCount === 0) {
      this.unRegsterMapEvent();
      this._engine.run();
    }
    this.animateCount++;
  }

  stopAnimate() {
    if (this.animateCount === 1) {
      this._engine.stop();
      this.registerMapEvent();
    }
    this.animateCount++;
  }
  // 地图状态变化时更新可视化渲染
  registerMapEvent() {
    this._updateRender = () => this.render();
    this.mapProvider.on('render', this._updateRender);
    window.addEventListener('onresize', this._updateRender);
  }

  unRegsterMapEvent() {
    this.mapProvider.off('render', this._updateRender);
    window.removeEventListener('onresize', this._updateRender);
  }
  // control

  addControl(ctr) {
    this.get('controlController').addControl(ctr);
    return this;
  }

  removeControl(ctr) {
    this.get('controlController').removeControl(ctr);
  }
  render() {
    this.emit('camerachange');
    this._engine.update();
  }
  destroy() {
    super.destroy();
    this._layers.forEach(layer => {
      layer.destroy();
    });
    this._layers.length = 0;
    this.image = null;
    this.fontAtlasManager = null;
    this.style.destroy();
    this.style = null;
    this._engine.destroy();
    this._engine = null;
    this.mapProvider.destroy();
    this.unRegsterMapEvent();
    this._unRegistEvents();
  }
}
