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

class Road extends Component {
    constructor(props) {
        super(props);
        this.helpTooltipElement = null;
        this.helpTooltip = null;
        this.measureTooltipElement = null;
        this.measureTooltip = null;
        this.sketch = null;
        this.listener = null;
        this.map = null;
        this.draw = null;
        this.vector = null;
        this.state = {
            sketch: null,
            continueLineMsg: 'Click to continue drawing the line',
            continuePolygonMsg: 'Click to continue drawing the polygon',
            select: 'LineString'
        }

    }

    // 2.dom渲染成功后进行map对象的创建
    componentDidMount() {
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

        var map = new Map({
            layers: [raster, this.vector],
            target: 'map',
            view: new View({
                center: [12909824.6852, 4931594.7854],
                zoom: 15
            })
        });

        //中间站
        var stops = [
            [12909554.6597, 4931694.7854],   //14
            [12909824.6852, 4931594.7854],    //43
            [12910026.8837, 4930523.89946],   //63
            [12910870.563, 4929357.26511]     //85
        ];
        var path = [
            [12909531.6597, 4931900.7854],   //1
            [12909550.6597, 4931820.7854],   //2
            [12909552.6597, 4932814.7854],   //14
            [12909554.6597, 4931804.7854],   //14
            [12909555.6597, 4931794.7854],   //14
            [12909556.6597, 4931784.7854],   //14
            [12909557.6597, 4931774.7854],   //14
            [12909558.6597, 4931764.7854],   //14
            [12909561.6597, 4931754.7854],   //14
            [12909562.6597, 4931744.7854],   //14
            [12909563.6597, 4931734.7854],   //14
            [12909564.6597, 4931724.7854],   //14
            [12909555.6597, 4931714.7854],   //14
            [12909554.6597, 4931700.7854],   //14
            [12909564.6597, 4931697.7854],   //14
            [12909574.6597, 4931680.7854],   //14
            [12909584.6597, 4931675.7854],   //14
            [12909594.6597, 4931670.7854],   //14
            [12909604.6597, 4931663.7854],   //14
            [12909614.6597, 4931660.7854],   //14
            [12909624.6597, 4931658.7854],   //14
            [12909634.6597, 4931655.7854],   //14
            [12909644.6597, 4931651.7854],   //14
            [12909654.6597, 4931648.7854],   //14
            [12909664.6597, 4931645.7854],   //14
            [12909674.6597, 4931642.7854],   //14
            [12909684.6597, 4931638.7854],   //14
            [12909694.6597, 4931635.7854],   //14
            [12909704.6597, 4931631.7854],   //14
            [12909714.6597, 4931628.7854],   //14
            [12909724.6597, 4931625.7854],   //14
            [12909734.6597, 4931621.7854],   //14
            [12909744.6597, 4931618.7854],   //14
            [12909754.6597, 4931615.7854],   //14
            [12909764.6597, 4931612.7854],   //14
            [12909774.6597, 4931609.7854],   //14
            [12909784.6597, 4931606.7854],   //14
            [12909794.6597, 4931603.7854],   //14
            [12909804.6597, 4931600.7854],   //14
            [12909814.6597, 4931597.7854],   //14
            [12909824.6852, 4931594.7854],    //43
            [12909925.6852, 4931059.7854],    //53
            [12910026.8837, 4930523.89946],   //63
            [12910448.8837, 4929940.89946],
            [12910870.563, 4929357.26511]     //85
        ];

        var stopMakers = new Array();

        for (var i = 0; i < 4; i++) {
            var s = new Feature({
                type: 'stop',
                geometry: new Point(stops[i])
            });
            stopMakers.push(s);
        }


        var Coordinates = path;

        //将离散点构建成一条折线
        var route = new LineString(Coordinates);
        //获取直线的坐标
        var routeCoords = route.getCoordinates();
        var routeLength = routeCoords.length;

        var routeFeature = new Feature({
            type: 'route',
            geometry: route
        });
        var geoMarker = new Feature({
            type: 'geoMarker',
            geometry: new Point(routeCoords[0])
        });
        var startMarker = new Feature({
            type: 'icon',
            geometry: new Point(routeCoords[0])
        });
        var endMarker = new Feature({
            type: 'icon',
            geometry: new Point(routeCoords[routeLength - 1])
        });

        var styles = {
            'route': new Style({
                stroke: new Stroke({
                    width: 6,
                    color: '#F2C841'
                }),
                fill: new Fill({
                    color: "#F6E3A3"
                })
            }),
            /*'icon': new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    src: require()
                })
            }),*/
            'geoMarker': new Style({
                /*image: new CircleStyle({
                    radius: 7,
                    snapToPixel: false,
                    fill: new ol.style.Fill({ color: 'black' }),
                    stroke: new ol.style.Stroke({
                        color: 'white',
                        width: 2
                    })
                })*/
                image: new Icon({
                    src: require('../../images/Chevron.png'),
                    // size:[50,50],
                    rotateWithView: false,
                    // rotation: -Math.atan2(routeCoords[0][1] - routeCoords[1][1], routeCoords[0][0] - routeCoords[1][0]),
                    // scale: 0.3,
                })
            }),
            'stop': new Style({
                image: new CircleStyle({
                    radius: 10,
                    snapToPixel: false,
                    fill: new Fill({color: 'red'}),
                    stroke: new Stroke({
                        color: 'white',
                        width: 2
                    })
                })
            })
        };

        var animating = false;
        var speed, now;
        var speedInput = document.getElementById('speed');
        var startButton = document.getElementById('start-animation');

        var vectorLayer = new VectorLayer({
            id: 'carLayer',
            source: new VectorSource({
                features: [routeFeature, geoMarker, startMarker, endMarker, stopMakers[0], stopMakers[1], stopMakers[2], stopMakers[3]]
            }),
            style: function (feature) {
                //如果动画是激活的就隐藏geoMarker
                if (animating && feature.get('type') === 'geoMarker') {
                    return null;
                }
                return styles[feature.get('type')];
            }
        });

        //var center = ol.proj.fromLonLat([115.981,40.451]);

        map.addLayer(vectorLayer);

        // 要素移动
        var moveFeature = function (event) {
            console.log(event)
            var vectorContext = event.vectorContext;   //HTML5 Canvas context，ol.render.canvas.Immediate的对象
            var frameState = event.frameState;        //freme 的状态
            if (animating) {
                var elapsedTime = frameState.time - now;    //elapsedTime  已过时间
                //通过增加速度，来获得lineString坐标
                var index = Math.round(speed * elapsedTime / 1000);   //已经走了多少个点

                console.log("#########",index,routeCoords[index]);

                if (index >= routeLength) {
                    stopAnimation(true);
                    return;
                }

                if (index < 14) {
                    flashFeature(0);
                }
                if (index == 14) {
                    changeStyle(0, 1);
                }

                if (index > 14 && index < 43) {
                    flashFeature(1);
                }
                if (index == 43) {
                    changeStyle(1, 2);
                }


                if (index > 43 && index < 63) {
                    flashFeature(2);
                }
                if (index == 63) {
                    changeStyle(2, 3);
                }

                if (index > 63 && index < 85) {
                    flashFeature(3);
                }
                if (index == 85) {
                    changeStyle(3, 3);
                }

                var dx, dy, rotation, carStyle;
                if (routeCoords[index] && routeCoords[index + 1]) {
                    dx = routeCoords[index][0] - routeCoords[index + 1][0];
                    dy = routeCoords[index][1] - routeCoords[index + 1][1];
                    rotation = Math.atan2(dy, dx);
                    //console.log("***********",rotation);

                    carStyle = new Style({
                        image: new Icon({
                            src: require('../../images/Chevron.png'),
                            // size:[50,50],
                            rotateWithView: false,
                            // rotation: -rotation,
                            // scale: 0.3,
                        })
                    });
                    var currentPoint = new Point(routeCoords[index]);  //当前点
                    var feature = new Feature(currentPoint);
                    //Render a feature into the canvas.
                    // Note that any zIndex on the provided style will be ignored - features are rendered immediately in the order that this method is called.
                    // If you need zIndex support, you should be using an ol.layer.Vector instead
                    vectorContext.drawFeature(feature, carStyle);
                }
            }
            //继续动画效果
            map.render();
        };

        function changeStyle(previous, next) {
            //console.log(stopMakers[previous]);
            stopMakers[previous].setStyle(new Style({
                image: new CircleStyle({
                    radius: 10,
                    snapToPixel: false,
                    fill: new Fill({color: 'green'}),
                    stroke: new Stroke({
                        color: 'white',
                        width: 2
                    })
                })
            }));
        }

        var colors = ['red', 'green'];
        var colorIndex = 0;

        function flashFeature(index) {
            var color;
            colorIndex++;
            colorIndex = colorIndex % 30;

            if (colorIndex < 15) {
                color = colors[0];
            } else {
                color = colors[1];
            }
            stopMakers[index].setStyle(new Style({
                image: new CircleStyle({
                    radius: 10,
                    snapToPixel: false,
                    fill: new Fill({
                        color: color
                    }),
                    stroke: new Stroke({
                        color: 'white',
                        width: 2
                    })
                })
            }));
        }

        function startAnimation() {
            console.log(this)
            if (animating) {
                stopAnimation(false);
            } else {
                animating = true;
                now = new Date().getTime();
                /** 开始时的时间*/
                speed = speedInput.value;
                startButton.textContent = '结束运动';
                //隐藏geoMarker
                geoMarker.setStyle(null);
                //设置显示范围
                //map.getView().setCenter(center);
                map.on('postcompose', moveFeature);
                /** postcompose事件-- 地图渲染时都会触发   */
                map.render();
            }
        }

        /**
         * @param {boolean}结束动画
         */
        function stopAnimation(ended) {
            animating = false;
            startButton.textContent = '开始运动';

            //如果动画取消就开始动画
            var coord = ended ? routeCoords[routeLength - 1] : routeCoords[0];
            /** @type {ol.geom.Point} */
            (geoMarker.getGeometry()).setCoordinates(coord);
            //移除监听
            map.un('postcompose', moveFeature);
            /** 解除postcompose 事件  */
        }

        startButton.addEventListener('click', startAnimation, false);
    }




    render(){
        return(
            <div>
                <div style={{'fontWeight': 'bold'}}>
                    运动速度:&nbsp;
                    <input onChange={()=>{}}  id="speed" type="range" min="1" max="20" step="1" value="10" />
                </div>
                <button id="start-animation">
                    开始运动
                </button>
                <div id="map" className="map"/>
            </div>
        )
    }

}

export default Road
