import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import path from 'path';
import webpack from 'webpack';

const destDir = path.resolve(__dirname, 'dist');
const config: webpack.Configuration = {
    entry: './src/index.ts',
    devtool: 'source-map',
    output: {
        path: destDir,
        filename: 'volumaze.js'
    },
    devServer: {
        host: '0.0.0.0',
        contentBase: './src'
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                loader: [MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: [/node_modules/, /\.spec\.ts$/]
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    plugins: [
        new HtmlWebpackPlugin({template: "./src/volumaze.html"}),
        new MiniCssExtractPlugin({filename: 'volumaze.css'}),
        new CopyPlugin([{ from: "./src/track.mp3", to: destDir}])

    ]
};

export default config;