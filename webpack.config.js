var path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: './dist/bundle.js'
    },
    module: {
        loaders: [
            {test: /\.html$/, loader: "underscore-template-loader"},
            {test: /\.css$/, loader: 'style!css!'},
            {test: /\.json/, loader: 'json-loader'}, {
                test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/font-woff&name=./dist/[hash].[ext]"
            }, {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=application/octet-stream&name=./dist/[hash].[ext]"
            }, {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
                loader: "file?&name=./dist/[hash].[ext]" 
            }, {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
                loader: "url?limit=10000&mimetype=image/svg+xml&name=./dist/[hash].[ext]"
            }
        ]
    }
}