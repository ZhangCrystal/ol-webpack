import React,{Component} from "react"
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileGrid from 'ol/tilegrid/TileGrid';
import TileImage from 'ol/source/TileImage';
import {fromLonLat,transform,Projection,addProjection,addCoordinateTransforms} from 'ol/proj';
import projzh from 'projzh';
import {applyTransform} from 'ol/extent';
import {OSM,XYZ} from 'ol/source'
import sphericalMercator from '../utils/tools'

class Baidu extends Component{
    constructor(props) {
        super(props);
    }

    // 2.dom渲染成功后进行map对象的创建
    componentDidMount(){
        // var extent = [72.004, 0.8293, 137.8347, 55.8271];

        var baiduMercator = new Projection({
            code: 'baidu',
            // extent: applyTransform(extent, projzh.ll2bmerc),
            units: 'm'
        });

        addProjection(baiduMercator);
        addCoordinateTransforms('EPSG:4326', baiduMercator, projzh.ll2bmerc, projzh.bmerc2ll);
        // addCoordinateTransforms('EPSG:3857', baiduMercator, projzh.smerc2bmerc, projzh.bmerc2smerc);

        var bmercResolutions = new Array(19);
        for (var i = 0; i < 19; ++i) {
            bmercResolutions[i] = Math.pow(2, 18 - i);
        }

        var urls = [0, 1, 2, 3, 4].map(function(sub) {
            return "http://online"+ sub + ".map.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt=20190723";
            // return 'http://shangetu' + sub +
            //     '.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46&udt=20150601';
        });

        var baidu = new TileLayer({
            source: new XYZ({
                projection: 'baidu',
                maxZoom: 18,
                tileUrlFunction: function(tileCoord) {
                    var x = tileCoord[1];
                    var y = tileCoord[2];
                    var z = tileCoord[0];
                    var hash = (x << z) + y;
                    var index = hash % urls.length;
                    index = index < 0 ? index + urls.length : index;

                    // 百度瓦片服务url将负数使用M前缀来标识
                    if(x<0){
                        x = "M"+(-x);
                    } if(y<0) {
                        y = "M" + (-y);
                    }
                    return urls[index].replace('{x}', x).replace('{y}', y).replace('{z}', z);
                },
                tileGrid: new TileGrid({
                    resolutions: bmercResolutions,// 设置分辨率
                    origin: [0, 0],// 设置原点坐标
                    // extent: applyTransform(extent, projzh.ll2bmerc),
                    tileSize: [256, 256]
                }),
            })
        });
        // // 自定义分辨率和瓦片坐标系
        // var resolutions = [];
        // var maxZoom = 18;
        //
        // // 计算百度使用的分辨率
        // for(var i=0; i<=maxZoom; i++){
        //     resolutions[i] = Math.pow(2, maxZoom-i);
        // }
        // var tilegrid  = new TileGrid({
        //     origin: [0,0],    // 设置原点坐标
        //     resolutions: resolutions    // 设置分辨率
        // });
        //
        // // 创建百度地图的数据源
        // var baiduSource = new TileImage({
        //     projection: 'EPSG:3857',
        //     tileGrid: tilegrid,
        //     tileUrlFunction: function(tileCoord, pixelRatio, proj){
        //         var z = tileCoord[0];
        //         var x = tileCoord[1];
        //         var y = tileCoord[2];
        //
        //         // 百度瓦片服务url将负数使用M前缀来标识
        //         if(x<0){
        //             x = 'M' + (-x);
        //         }
        //         if(y<0){
        //             y = 'M' + (-y);
        //         }
        //         return "http://online"+ parseInt(Math.random() * 10) + ".map.bdimg.com/tile/?qt=vtile&x="+
        //         x + "&y="+ y +"&z="+ z + "&styles=pl&scaler=2&udt=20190723";
        //     }
        // });
        //
        // // 百度地图层
        // var baiduMapLayer2 = new TileLayer({
        //     source: baiduSource
        // });
        //

        var raster = new TileLayer({
            source: new OSM()
        });

        // 创建地图

        var map=new Map({
            layers: [
                // baiduMapLayer2
                // raster,
                baidu
            ],
            view: new View({
                // 设置成都为地图中心
                center: transform([104.06, 30.67], 'EPSG:4326', 'EPSG:3857'),
                zoom: 3,
                minZoom:3
            }),
            target: 'baiduMap2'
        });
        // console.log(map.getView())
    }

    render(){

        return(
            <div id="baiduMap2" style={{width: '100%'}}/>
        )
    }

}

export default Baidu
