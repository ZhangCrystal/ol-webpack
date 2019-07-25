import {Map, View} from 'ol';
import 'ol/ol.css';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
// import {baiduMapLayer,baiduMapLayerLabel,baiduRasterLayer} from './src/components/BaiduMap2';
import {ScaleLine,ZoomSlider,OverviewMap,Zoom} from 'ol/control'

const map=new Map({
  target: 'app',
  layers: [
    new TileLayer({
      source: new XYZ({
        url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      })
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  }),
    controls:[
        new ScaleLine(),
        new ZoomSlider(),
        new OverviewMap(),
        new Zoom()
    ],

});
// var baiduMapSat = new TileLayer({
//     title: "百度地图卫星",
//     source: new ol.source.BaiduMap({mapType:"sat"})
// });
// map.addLayer(baiduMapSat);
