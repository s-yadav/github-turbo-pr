const path = require('path');
const webpack = require('webpack');
const mode = process.env.NODE_ENV === 'development' ? 'development': 'production';

module.exports = {
  mode: mode,
  devtool: 'none',
  entry: {
    inject: './src/inject/inject.js',
    background: './src/bg/background.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
};
