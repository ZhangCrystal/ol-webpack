import React,{Component} from "react"
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import {Vector} from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM';
import {GeoJSON} from 'ol/format';
import {fromLonLat} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import Point from 'ol/geom/Point';
import 'ol/ol.css';
import Control from 'ol/control/Control';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import {ScaleLine,ZoomSlider,OverviewMap,Zoom} from 'ol/control';
import Interaction from 'ol/interaction/Interaction';
import Select from 'ol/interaction/Select';
import {bbox} from 'ol/loadingstrategy';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify'

class Home extends Component{
    constructor(props) {
        super(props);
        this.map = new Map({
            // target: 'map',
            layers: [
                new TileLayer({
                    source: new OSM()
                })
            ],
            view: new View({
                center: fromLonLat([37.41, 8.82]),
                zoom: 4,
            }),
            controls:[
                new ScaleLine(),
                new ZoomSlider(),
                // new LayerSwitcher(),
                new OverviewMap(),
                new Zoom()
            ],
        });
    }

    // 2.dom渲染成功后进行map对象的创建
    componentDidMount(){
        var container = document.getElementById('popup');
        var content = document.getElementById('popup-content');
        var closer = document.getElementById('popup-closer');
        this.map.setTarget("map");
        // var vectorSource = new Vector({
        //     format: new GeoJSON(),
        //     loader: function(extent, resolution, projection) {
        //         var proj = projection.getCode();
        //         var url = 'https://ahocevar.com/geoserver/wfs?service=WFS&' +
        //             'version=1.1.0&request=GetFeature&typename=osm:water_areas&' +
        //             'outputFormat=application/json&srsname=' + proj + '&' +
        //             'bbox=' + extent.join(',') + ',' + proj;
        //         var xhr = new XMLHttpRequest();
        //         xhr.open('GET', url);
        //         var onError = function() {
        //             vectorSource.removeLoadedExtent(extent);
        //         }
        //         xhr.onerror = onError;
        //         xhr.onload = function() {
        //             if (xhr.status == 200) {
        //                 vectorSource.addFeatures(
        //                     vectorSource.getFormat().readFeatures(xhr.responseText));
        //             } else {
        //                 onError();
        //             }
        //         };
        //         xhr.send();
        //     },
        //     strategy: bbox
        // });

        var source = new Vector({
            url: '../../data/7day-M2.5.json',
            format: new GeoJSON()
        });

        const vector=new VectorLayer({
            id: 'vector',
            title: 'Earthquakes',
            source: source,
            // source:vectorSource,
            style:new Style({
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({
                        color: '#0000FF'
                    }),
                    stroke:new Stroke({
                        color: '#000000'
                    })
                })
            })
        });
        this.map.addLayer(vector)
        // vector.setMap(this.map);

        var draw = new Draw({
            source: source,
            type: 'LineString',
            // type: 'Point'
        });

        draw.on('drawend', function(evt){
            var feature = evt.feature;
            var p = feature.getGeometry();
            console.log(p.getCoordinates());
        });

        const interactions= new Select({
            style: new Style({
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({
                        color: '#FF0000'
                    }),
                    stroke: new Stroke({
                        color: '#000000'
                    })
                })
            })
        });

        this.map.addInteraction(interactions);
        // this.map.addInteraction(draw);
        var overlay = new Overlay({
            element: container,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
        closer.onclick = function() {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
        this.map.addOverlay(overlay);
        this.map.on('singleclick', function(evt) {
            document.getElementById('info').innerHTML = '';
            var pixel = evt.pixel;
            var feature = this.forEachFeatureAtPixel(pixel, function(feature, layer) {
                return feature;
            });
            if (feature) {
                var coordinates = feature.getGeometry().getCoordinates();
                content.innerHTML = '<p>You clicked here:</p><code>' + feature.get('title')  +
                    '</code>';
                overlay.setPosition(coordinates);
                document.getElementById('info').innerHTML += 'Title: ' + feature.get('title') + '<br/>';
            }
        });
    }

    render(){
        return(
            <div>
                <div id="map" className="map"/>
                <div id="info" className="info"/>
                <div id="popup" className="ol-popup">
                    <a href="#" id="popup-closer" className="ol-popup-closer"></a>
                    <div id="popup-content"></div>
                </div>
            </div>
        )
    }

}

export default Home
