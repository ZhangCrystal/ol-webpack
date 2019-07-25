import React,{Component} from "react"
import Home from './pages/home/home';
import Measure from './pages/measure';
import ReactDOM from 'react-dom';

ReactDOM.render(
    <div>
        <Home />
        {/*<Measure/>*/}
    </div>
    ,
    document.getElementById('app')
);