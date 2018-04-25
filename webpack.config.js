var path = require('path');
var webpack = require('webpack');
var WebpackBrowserPlugin = require('webpack-browser-plugin');

module.exports = {
    entry: ['./app/index.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: [{
                loader: 'babel-loader',
                options: {
                    presets: [['es2015', {modules: false}]]
                }
            }]
        },
            {
                test: /\.css$/,
                use: [ 'style-loader', 'css-loader' ]
            }]
    },
    devServer: {
        hot: true,
        port: 9000, //개발서버 포트 지정
        contentBase: path.resolve(__dirname, 'dist'), //기본 context
        publicPath: '/'
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new WebpackBrowserPlugin({
            browser: 'Explorer',
            port: '9000',
            url: 'http://127.0.0.1'
        })
        ,
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
};