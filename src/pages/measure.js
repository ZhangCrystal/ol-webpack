import React,{Component} from "react"
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import {Vector} from 'ol/source';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector'
import OSM from 'ol/source/OSM';
import {GeoJSON} from 'ol/format';
import {fromLonLat,transform} from 'ol/proj';
import XYZ from 'ol/source/XYZ';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import 'ol/ol.css';
import Control from 'ol/control/Control';
// import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
// import Fill from 'ol/style/Fill';
// import Stroke from 'ol/style/Stroke';
import {Style,Fill,Stroke,Icon} from 'ol/style'
import {ScaleLine,ZoomSlider,OverviewMap,Zoom} from 'ol/control';
import Interaction from 'ol/interaction/Interaction';
import Select from 'ol/interaction/Select';
import {bbox} from 'ol/loadingstrategy';
import Draw from 'ol/interaction/Draw';
import Modify from 'ol/interaction/Modify';
import {getArea, getLength} from 'ol/sphere';
import {unByKey} from 'ol/Observable';
import {LineString, Polygon} from 'ol/geom';

class Measure extends Component{
    constructor(props) {
        super(props);
        this.helpTooltipElement=null;
        this.helpTooltip=null;
        this.measureTooltipElement=null;
        this.measureTooltip=null;
        this.sketch=null;
        this.listener=null;
        this.map=null;
        this.draw=null;
        this.vector =null;
        this.state={
            sketch:null,
            continueLineMsg:'Click to continue drawing the line',
            continuePolygonMsg : 'Click to continue drawing the polygon',
            select:'LineString'
        }

    }

    // 2.dom渲染成功后进行map对象的创建
    componentDidMount(){
        var container = document.getElementById('popup');
        var raster = new TileLayer({
            source: new OSM()
        });
        var source = new VectorSource();

        this.vector = new VectorLayer({
            source: source,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                }),
                stroke: new Stroke({
                    color: '#ffcc33',
                    width: 2
                }),
                image: new CircleStyle({
                    radius: 7,
                    fill: new Fill({
                        color: '#ffcc33'
                    })
                })
            })
        });

        this.map = new Map({
                layers: [raster, this.vector],
                target: 'map',
                view: new View({
                  center: [-11000000, 4600000],
                  zoom: 15
                })
              });


        var overlay = new Overlay({
            element: container,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
        this.map.addOverlay(overlay);
        this.addInteraction();
        this.map.on('pointermove', this.pointerMoveHandler);
         this.map.getViewport().addEventListener('mouseout', ()=> {
             this.helpTooltipElement.classList.add('hidden');
         });

    }

    addInteraction=()=>{
         //测量距离
        const {select}=this.state;
         this.draw = new Draw({
             source: this.vector.getSource(),
             type:select,
             // freehand: true,  //是否是直线
             style: new Style({
                 fill: new Fill({
                   color: 'rgba(255, 255, 255, 0.2)'
                 }),
                 stroke: new Stroke({
                   color: 'rgba(0, 0, 0, 0.5)',
                   lineDash: [10, 10],
                   width: 2
                 }),
                 image: new CircleStyle({
                   radius: 5,
                   stroke: new Stroke({
                     color: 'rgba(0, 0, 0, 0.7)'
                   }),
                   fill: new Fill({
                     color: 'rgba(255, 255, 255, 0.2)'
                   })
                 })
               })
         });

         this.map.addInteraction(this.draw);

         this.createHelpTooltip(this.map);
         this.createMeasureTooltip(this.map);

          var listener;
         this.draw.on('drawstart', (evt)=>{
             this.sketch = evt.feature;
             var tooltipCoord = evt.coordinate;
             listener = this.sketch.getGeometry().on('change', (evt)=> {

                 var geom = evt.target;
                 var output;
                 if (geom instanceof Polygon) {
                     output = this.formatArea(geom);
                     tooltipCoord = geom.getInteriorPoint().getCoordinates();
                 } else if (geom instanceof LineString) {
                     output = this.formatLength(geom);
                     tooltipCoord = geom.getLastCoordinate();
                 }

                 this.measureTooltipElement.innerHTML = output;
                 this.measureTooltip.setPosition(tooltipCoord);
             });
         });

         this.draw.on('drawend', (evt)=>{
             this.measureTooltipElement.className = 'tooltip tooltip-static';
             this.measureTooltip.setOffset([0, -7]);
             // unset sketch
             this.sketch = null;
             // unset tooltip so that a new one can be created
             this.measureTooltipElement = null;
             this.createMeasureTooltip(this.map);
             unByKey(listener);
             var feature=evt.feature;
             var geometry=feature.getGeometry();
             var coordinate=geometry.getCoordinates();
             console.log(coordinate);
         });
    };

    createHelpTooltip(map) {
        if (this.helpTooltipElement) {
            this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
        }
        this.helpTooltipElement = document.createElement('div');
        this.helpTooltipElement.className = 'tooltip hidden';
        this.helpTooltip = new Overlay({
            element: this.helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(this.helpTooltip);
    }

    createMeasureTooltip(map) {
        if (this.measureTooltipElement) {
            this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
        }
        this.measureTooltipElement = document.createElement('div');
        this.measureTooltipElement.className = 'tooltip tooltip-measure';
        this.measureTooltip = new Overlay({
            element: this.measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        map.addOverlay(this.measureTooltip);
    }

    pointerMoveHandler = (evt)=> {
        if (evt.dragging) {
            return;
        }
        /** @type {string} */
        var helpMsg = 'Click to start drawing';

        if (this.sketch) {
            var geom = (this.sketch.getGeometry());
            if (geom instanceof Polygon) {
                helpMsg = this.state.continuePolygonMsg;
            } else if (geom instanceof LineString) {
                helpMsg = this.state.continueLineMsg;
            }
        }
        this.helpTooltipElement.innerHTML = helpMsg;
        this.helpTooltip.setPosition(evt.coordinate);


        this.helpTooltipElement.classList.remove('hidden');
    };

    formatLength = (line) =>{
        var length = getLength(line);
        var output;
        if (length > 100) {
            output = (Math.round(length / 1000 * 100) / 100) +
                ' ' + 'km';
        } else {
            output = (Math.round(length * 100) / 100) +
                ' ' + 'm';
        }
        return output;
    };

    formatArea = (polygon)=> {
        var area = getArea(polygon);
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) +
                ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) +
                ' ' + 'm<sup>2</sup>';
        }
        return output;
    };

    onChange=(e)=>{
        this.map.removeInteraction(this.draw);
        this.setState({select:e.target.value},()=>{
            this.addInteraction()
        })
    } ;


    render(){
        return(
            <div>
                <form className="form-inline">
                      <label>Measurement type &nbsp;</label>
                      <select value={this.state.select} onChange={this.onChange} id="type">
                        <option value="LineString">Length (LineString)</option>
                        <option value="Polygon">Area (Polygon)</option>
                        <option value="Point">Point (Point)</option>
                      </select>
                </form>
                <div id="map" className="map"/>
            </div>
        )
    }

}

export default Measure
