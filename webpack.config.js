const path = require('path');
// const CopyPlugin = require('copy-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');

module.exports = {
    entry: path.resolve(__dirname, 'src'),
    // entry:'./main.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js'
    },
    devtool: 'source-map',
    devServer: {
        port: 3000,
        clientLogLevel: 'none',
        stats: 'errors-only'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {  test:/\.js$/,
                exclude:/(node_modules)/,//排除掉node_module目录
                use:{
                    loader:'babel-loader',
                    options: {
                        presets: ['@babel/preset-env','@babel/preset-react'],
                        plugins: ['@babel/plugin-proposal-class-properties']
                    }
                }}
        ]
    },
    plugins: [
        // new CopyPlugin([{from: 'data', to: 'data'}]),
        new HtmlPlugin({
            template: 'index.html'
        })
    ]
};
