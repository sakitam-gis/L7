// @ts-ignore
import '!style-loader!css-loader!./css/l7.css';
// @ts-ignore
import * as maptalks from 'maptalks';
import { Scale, Zoom } from '@l7/component';
import { PolygonLayer } from '@l7/layers';
// @ts-ignore
import { Scene } from '@l7/scene';
import * as React from 'react';

export default class Maptalks extends React.Component {
  private scene: Scene;

  public componentWillUnmount() {
    this.scene.destroy();
  }

  public async componentDidMount() {
    const response = await fetch(
      'https://gw.alipayobjects.com/os/rmsportal/vmvAxgsEwbpoSWbSYvix.json',
    );
    const scene = new Scene({
      id: 'map',
      type: 'maptalks',
      center: [121.507674, 31.223043],
      pitch: 65.59312320916906,
      zoom: 15.4,
      minZoom: 15,
      maxZoom: 18,
      baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'https://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/tile/{z}/{y}/{x}',
      })
    });

    this.scene = scene;
    // @ts-ignore
    const layer = new PolygonLayer({
      opacity: 1.0,
      baseColor: 'rgb(16,16,16)',
      windowColor: 'rgb(30,60,89)',
      //brightColor:'rgb(155,217,255)'
      brightColor: 'rgb(255,176,38)'
    });

    layer
      .source(await response.json())
      .shape('extrude')
      .size('floor', [0, 2000])
      .color('rgba(242,246,250,1.0)');
      // @ts-ignore
      // .animate({
      //   enable: true
      // });
    scene.addLayer(layer);
    scene.render();
    scene.on('loaded', () => {
      const zoomControl = new Zoom({
        position: 'bottomright',
      });
      const scaleControl = new Scale();
      scene.addControl(zoomControl);
      scene.addControl(scaleControl);
      console.log(layer);
      // layer.fitBounds();
    });
  }

  public render() {
    return (
      <div
        id="map"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    );
  }
}
