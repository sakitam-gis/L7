import MapBox from './mapbox';
import { default as AMap } from './AMap';
import Maptalks from './maptalks';

export {
  AMap,
  MapBox,
  Maptalks
};
const MapType = {
  amap: AMap,
  mapbox: MapBox,
  maptalks: Maptalks
};

export const getMap = type => {
  return MapType[type.toLowerCase()];
};

export const registerMap = (type, map) => {
  if (getMap(type)) {
    throw new Error(`Map type '${type}' existed.`);
  }
  map.type = type;
  // 存储到 map 中
  MapType[type.toLowerCase()] = map;
};
