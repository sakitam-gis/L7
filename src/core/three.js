import 'three/src/polyfills.js';
import { BufferAttribute } from 'three/src/core/BufferAttribute.js';

// export * from '../../build/three.js';
function Float32BufferAttribute( array, itemSize, normalized ) {
  if(Array.isArray( array )){
    array = new Float32Array( array )
  }
	BufferAttribute.call( this, array, itemSize, normalized );

}

Float32BufferAttribute.prototype = Object.create( BufferAttribute.prototype );
Float32BufferAttribute.prototype.constructor = Float32BufferAttribute;

export * from 'three/src/constants.js';
export { Scene } from 'three/src/scenes/Scene.js';
export { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
export { CanvasTexture } from 'three/src/textures/CanvasTexture.js';
export { Object3D } from 'three/src/core/Object3D.js';
export { Group } from 'three/src/objects/Group';
export { Clock } from 'three/src/core/Clock';
export { Points } from 'three/src/objects/Points.js';
export { LineSegments } from 'three/src/objects/LineSegments.js';
export { Mesh } from 'three/src/objects/Mesh.js';
export { Texture } from 'three/src/textures/Texture.js';
export { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget.js';
export { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera.js';
export { OrthographicCamera } from 'three/src/cameras/OrthographicCamera.js';
export { BufferGeometry } from 'three/src/core/BufferGeometry.js';
export { InstancedBufferGeometry } from 'three/src/core/InstancedBufferGeometry';
export { PlaneBufferGeometry } from 'three/src/geometries/PlaneGeometry.js';
export { BoxBufferGeometry } from 'three/src/geometries/BoxGeometry.js';
export { Raycaster } from 'three/src/core/Raycaster.js';
export { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils.js';
export { Matrix4 } from 'three/src/math/Matrix4.js';
export { Matrix3 } from 'three/src/math/Matrix3.js';
export { Line } from 'three/src/objects/Line.js';
export { Vector4 } from 'three/src/math/Vector4.js';
export { Vector3 } from 'three/src/math/Vector3.js';
export { Vector2 } from 'three/src/math/Vector2.js';
export { ShaderMaterial } from 'three/src/materials/ShaderMaterial.js';
export { DataTexture } from 'three/src/textures/DataTexture.js';
export { Color } from 'three/src/math/Color.js';
export {
  Float64BufferAttribute,
  // Float32BufferAttribute,
  Uint32BufferAttribute,
  Int32BufferAttribute,
  Uint16BufferAttribute,
  Int16BufferAttribute,
  Uint8ClampedBufferAttribute,
  Uint8BufferAttribute,
  Int8BufferAttribute,
  BufferAttribute
} from 'three/src/core/BufferAttribute.js';

export { InstancedBufferAttribute } from 'three/src/core/InstancedBufferAttribute'

export { Float32BufferAttribute }
