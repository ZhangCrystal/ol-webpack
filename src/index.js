import React,{Component} from "react"
import ReactDOM from 'react-dom';
import Home from './pages/home/home';
import Measure from './pages/measure';
import Baidu from './pages/baidu';
import Road from './pages/road';
import FlightAnimation from './pages/flightAnimation';

ReactDOM.render(
    <div>
        {/*<Home />*/}
        {/*<Baidu/>*/}
        {/*<Measure/>*/}
        {/*<Road/>*/}
        <FlightAnimation/>
    </div>
    ,
    document.getElementById('app')
);