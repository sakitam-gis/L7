/**
 * @author sakitam-fdd <smilefdd@gmail.com>
 * @date 2019/10/31 7:59 下午
 * @desc maptalks 适配器
 * @version 1.0
 */

import Base from '../core/base';
import Global from '../global';
import Util from '../util';
const DEG2RAD = Math.PI / 180;
const MAX_RES = 2 * 6378137 * Math.PI / (256 * Math.pow(2, 20));

function getFovRatio(fov) {
  return Math.tan(fov / 2 * DEG2RAD);
}

export default class Maptalks extends Base {
  getDefaultCfg() {
    return Util.assign(Global.scene, {
      zoomControl: false,
      attribution: false,
      overviewControl: false,
    });
  }
  static project(lnglat) {
    const maxs = 85.0511287798;
    const lat = Math.max(Math.min(maxs, lnglat[1]), -maxs);
    const scale = 256 << 20;
    let d = Math.PI / 180;
    let x = lnglat[0] * d;
    let y = lat * d;
    y = Math.log(Math.tan(Math.PI / 4 + y / 2));
    const a = 0.5 / Math.PI,
      b = 0.5,
      c = -0.5 / Math.PI;
    d = 0.5;
    x = scale * (a * x + b) - 215440491;
    y = -(scale * (c * y + d) - 106744817);
    return { x, y };
  }
  constructor(cfg) {
    super(cfg);
    this.container = document.getElementById(this.get('id'));
    this.initMap();
  }

  initMap() {
    const map = this.get('map');
    if (map instanceof maptalks.Map) {
      this.map = map;
      this.container = map.getContainer();
      this.addOverLayer();
    } else {
      this.map = new maptalks.Map(this.container, {
        ...this._attrs
      });

      this.map.destroy = () => this.map.remove();

      this.addOverLayer();
    }

    setTimeout(() => {
      this.emit('mapLoad');
    }, 10);
  }

  asyncCamera(engine) {
    this._engine = engine;
    this.map.on('zoomstart zooming zoomend movestart moving moveend dragrotatestart dragrotating dragrotateend resize spatialreferencechange', this.updateCamera, this);
    this.updateCamera();
  }

  updateCamera() {
    const map = this.map;
    const fov = map.getFov();
    const maxScale = map.getScale(map.getMinZoom()) / map.getScale(map.getMaxNativeZoom());
    const far = map.cameraFar || 2000;
    const near = map.cameraNear || 0.1;
    const bearing = map.getBearing();
    const pitch = map.getPitch() * DEG2RAD;
    const rotation = bearing * DEG2RAD;
    const { height } = map.getSize();
    const farZ = maxScale * height / 2 / getFovRatio(fov) * 1.4;

    const camera = this._engine._camera;

    camera.fov = fov * Math.PI / 180;
    camera.aspect = map.width / map.height;
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
    camera.matrixAutoUpdate = false;

    camera.position.z = map.cameraPosition[2];
    camera.position.x = map.cameraPosition[0];
    camera.position.y = map.cameraPosition[1];
    camera.up.x = map.cameraUp[0];
    camera.up.y = map.cameraUp[1];
    camera.up.z = map.cameraUp[2];
    camera.lookAt(...map.cameraLookAt);
    //
    // const targetZ = map.getGLZoom();
    // const scale = map.getGLScale();
    // const center2D = map._prjToPoint(map._prjCenter, targetZ);
    // const z = scale * (map.height || 1) / 2 / map.getDevicePixelRatio();
    // const cz = z * Math.cos(pitch);
    // const dist = Math.sin(pitch) * z;
    // const cx = center2D.x + dist * Math.sin(bearing);
    // const cy = center2D.y + dist * Math.cos(bearing);
    //
    // camera.position.x += cx;
    // camera.position.y += cy;
    // camera.position.z += cz;

    // camera.matrix.elements = map.cameraWorldMatrix;
    // camera.projectionMatrix.elements = map.projMatrix;
    this.emit('render');
  }

  projectFlat(lnglat) {
    return lnglat;
  }
  getCenter() {
    return this.map.getCenter();
  }

  getCenterFlat() {
    return this.projectFlat(this.getCenter());
  }

  addOverLayer() {
    this.canvasContainer = this.map.getPanels().canvasContainer;
    this.renderDom = document.createElement('div');
    this.renderDom.style.cssText += 'position: absolute;top: 0; z-index:10;height: 100%;width: 100%;pointer-events: none;';
    this.renderDom.id = 'l7_canvaslayer';
    this.l7_marker_Container = document.createElement('div');
    this.l7_marker_Container.className = 'l7_marker';
    this.canvasContainer.appendChild(this.renderDom);
    this.canvasContainer.appendChild(this.l7_marker_Container);
  }

  mixMap(scene) {
    const map = this.map;
    scene.getZoom = () => {
      return 19 - Math.log(this.map.getResolution() / MAX_RES) / Math.LN2;
    };

    scene.getCenter = () => {
      return map.getCenter();
    };

    scene.getSize = () => {
      return map.getSize();
    };

    scene.getPitch = () => {
      return map.getPitch();
    };

    scene.getRotation = () => {
      return map.getBearing();
    };

    scene.setZoom = zoom => {
      return map.setZoom(zoom);
    };

    scene.getBounds = () => {
      const extent = map.getExtent();
      return [[ extent.xmin, extent.ymin ], [ extent.xmax, extent.ymax ]];
    };

    scene.setZoomAndCenter = (zoom, center) => {
      return map.setCenterAndZoom(new maptalks.Coordinate(center), zoom);
    };

    scene.setBounds = extent => {
      return map.setBounds(new AMap.Bounds([ extent[0], extent[1] ], [ extent[2], extent[3] ]));
    };

    scene.setRotation = rotation => {
      return map.setBearing(rotation);
    };

    scene.zoomIn = () => {
      return map.zoomIn();
    };

    scene.zoomOut = () => {
      return map.zoomOut();
    };

    scene.panTo = lnglat => {
      return map.panTo(new maptalks.Coordinate(lnglat));
    };

    scene.panBy = (x, y) => {
      return map.panBy(new maptalks.Point([ x, y ]));
    };

    scene.setPitch = pitch => {
      return map.setPitch(pitch);
    };

    scene.pixelToLngLat = pixel => {
      const coordinates = map.containerPointToCoordinate(new maptalks.Point(pixel));
      return {
        lng: coordinates.x,
        lat: coordinates.y
      };
    };

    scene.lngLatToPixel = lnglat => {
      return map.coordinateToContainerPoint(new maptalks.Coordinate(lnglat));
    };

    scene.fitBounds = extent => {
      return map.fitExtent(new maptalks.Extent(extent[0][0], extent[0][1], extent[1][0], extent[1][1]));
    };

    scene.containerToLngLat = pixel => {
      const coordinates = map.containerPointToCoordinate(new maptalks.Point(pixel));
      return {
        lng: coordinates.x,
        lat: coordinates.y
      };
    };

    scene.lngLatToContainer = lnglat => {
      return map.coordinateToContainerPoint(new maptalks.Coordinate(lnglat));
    };
  }

  destroy() {
    if (this.map) {
      this.map.off('zoomstart zooming zoomend movestart moving moveend dragrotatestart dragrotating dragrotateend resize spatialreferencechange', this.handleMapMove);
      this.map.remove();
    }
  }
}
