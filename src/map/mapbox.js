import Base from '../core/base';
import Util from '../util';
import Global from '../global';
import * as THREE from '../core/three';
const WORLD_SIZE = 512;
const MERCATOR_A = 6378137.0;
const WORLD_SCALE = 1 / 100;
const PROJECTION_WORLD_SIZE = WORLD_SIZE / (MERCATOR_A * Math.PI) / 2;
export default class MapBox extends Base {
  getDefaultCfg() {
    return Util.assign(Global.scene, {
    });
  }
  static project(lnglat) {
    const d = Math.PI / 180;
    const x = -MERCATOR_A * lnglat[0] * d * PROJECTION_WORLD_SIZE;
    const y = -MERCATOR_A * Math.log(Math.tan((Math.PI * 0.25) + (0.5 * lnglat[1] * d))) * PROJECTION_WORLD_SIZE;
    return { x, y };
  }
  constructor(cfg) {
    super(cfg);
    this.container = document.getElementById(this.get('id'));
    this.handleRender = this.handleRender.bind(this);
    this.initMap();
    this.addOverLayer();
  }

  initMap() {
    this.map = new mapboxgl.Map({
      container: this.container,
      ...this._attrs
    });

    this.map.on('load', () => {
      this.emit('mapLoad');

      this.map.on('move', this.handleRender);
    });
  }

  handleRender() {
    this.updateCamera();
    this.emit('render');
  }

  asyncCamera(engine) {
    this.engine = engine;
    const camera = engine._camera;
    const scene = engine.world;
    const pickScene = engine._picking.world;
    camera.matrixAutoUpdate = false;
    scene.position.x = scene.position.y = WORLD_SIZE / 2;
    scene.matrixAutoUpdate = false;
    pickScene.position.x = pickScene.position.y = WORLD_SIZE / 2;
    pickScene.matrixAutoUpdate = false;
    this.updateCamera();
    this.map.on('move', () => {
      this.updateCamera();
    });
  }
  updateCamera() {
    const engine = this.engine;
    const scene = engine.world;
    const pickScene = engine._picking.world;
    const camera = engine._camera;
    // Build a projection matrix, paralleling the code found in Mapbox GL JS
    const fov = 0.6435011087932844;
    const cameraToCenterDistance = 0.5 / Math.tan(fov / 2) * this.map.transform.height * WORLD_SCALE;
    const halfFov = fov / 2;
    const groundAngle = Math.PI / 2 + this.map.transform._pitch;
    const topHalfSurfaceDistance = Math.sin(halfFov) * cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov);

    // Calculate z distance of the farthest fragment that should be rendered.
    const furthestDistance = Math.cos(Math.PI / 2 - this.map.transform._pitch) * topHalfSurfaceDistance + cameraToCenterDistance;

    // Add a bit extra to avoid precision problems when a fragment's distance is exactly `furthestDistance`
    let farZ = furthestDistance * 1.1;
    if (this.pitch > 50) {
      farZ = 1000;
    }
    const { x, y } = this.map.transform.point;
    camera.projectionMatrix = this.makePerspectiveMatrix(fov, this.map.transform.width / this.map.transform.height, 1, farZ);
    const cameraWorldMatrix = new THREE.Matrix4();
    const cameraTranslateZ = new THREE.Matrix4().makeTranslation(0, 0, cameraToCenterDistance);
    const cameraRotateX = new THREE.Matrix4().makeRotationX(this.map.transform._pitch);
    const cameraRotateZ = new THREE.Matrix4().makeRotationZ(this.map.transform.angle);
    const cameraTranslateXY = new THREE.Matrix4().makeTranslation(x * WORLD_SCALE, -y * WORLD_SCALE, 0);
    // const cameraTranslateCenter = new THREE.Matrix4().makeTranslation(0, 0, cameraToCenterDistance);
    // Unlike the Mapbox GL JS camera, separate camera translation and rotation out into its world matrix
    // If this is applied directly to the projection matrix, it will work OK but break raycasting
    cameraWorldMatrix
      .premultiply(cameraTranslateZ)
      .premultiply(cameraRotateX)
      .premultiply(cameraRotateZ)
      .premultiply(cameraTranslateXY);

    camera.matrixWorld.copy(cameraWorldMatrix);

    const zoomPow = this.map.transform.scale * WORLD_SCALE;
    // Handle scaling and translation of objects in the map in the world's matrix transform, not the camera
    const scale = new THREE.Matrix4();
    const translateCenter = new THREE.Matrix4();
    const translateMap = new THREE.Matrix4();
    const rotateMap = new THREE.Matrix4();
    scale
      .makeScale(zoomPow, zoomPow, 1.0);
    translateCenter
      .makeTranslation(WORLD_SIZE / 2, -WORLD_SIZE / 2, 0);
    translateMap
      .makeTranslation(-this.map.transform.x, this.map.transform.y, 0);
    rotateMap
      .makeRotationZ(Math.PI);
    scene.matrix = new THREE.Matrix4();
    scene.matrix
      .premultiply(rotateMap)
      .premultiply(translateCenter)
      .premultiply(scale);
    pickScene.matrix = new THREE.Matrix4();
    pickScene.matrix
      .premultiply(rotateMap)
      .premultiply(translateCenter)
      .premultiply(scale);
  }
  makePerspectiveMatrix(fovy, aspect, near, far) {
    const out = new THREE.Matrix4();
    const f = 1.0 / Math.tan(fovy / 2),
      nf = 1 / (near - far);
    const newMatrix = [
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * nf, -1,
      0, 0, (2 * far * near) * nf, 0
    ];
    out.elements = newMatrix;
    return out;
  }

  projectFlat(lnglat) {
    return new mapboxgl.LngLat(lnglat).warp();
  }
  getCenter() {
    return this.map.getCenter();
  }
  getCenterFlat() {
    return this.projectFlat(this.getCenter());
  }
  addOverLayer() {
    const canvasContainer = this.map.getCanvasContainer();
    this.canvasContainer = canvasContainer;
    this.renderDom = document.createElement('div');
    this.renderDom.style.cssText += 'position: absolute;top: 0; z-index:10;height: 100%;width: 100%;pointer-events: none;';
    this.renderDom.id = 'l7_canvaslayer';
    this.l7_marker_Container = document.createElement('div');
    this.l7_marker_Container.className = 'l7_marker';
    canvasContainer.appendChild(this.l7_marker_Container);
    canvasContainer.appendChild(this.renderDom);
  }
  mixMap(scene) {
    const map = this.map;
    scene.getSize = () => {
      const size = map.transform;
      return [ size.width, size.height ];
    };

    scene.getCenter = () => {
      return map.getCenter();
    };

    scene.getSize = () => {
      const size = map.transform;
      return {
        width: size.width,
        height: size.height,
      };
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

    scene.getZoom = zoom => {
      return map.getZoom(zoom);
    };

    scene.getBounds = () => {
      return map.getBounds().toArray();
    };

    scene.setZoomAndCenter = (zoom, center) => {
      return map.flyTo({
        zoom,
        center
      });
    };

    scene.setBounds = extent => {
      return map.setBounds(extent);
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
      return map.panTo(lnglat);
    };

    scene.panBy = (x, y) => {
      return map.panTo([ x, y ]);
    };

    scene.setPitch = pitch => {
      return map.setPitch(pitch);
    };

    scene.pixelToLngLat = pixel => {
      const coordinates = map.unproject(pixel);
      return coordinates;
    };

    scene.lngLatToPixel = lnglat => {
      return map.project(lnglat);
    };

    scene.fitBounds = extent => {
      return map.fitBounds(extent);
    };

    scene.containerToLngLat = pixel => {
      const coordinates = map.unproject(pixel);
      return coordinates;
    };

    scene.lngLatToContainer = lnglat => {
      return map.project(lnglat);
    };
  }
}
