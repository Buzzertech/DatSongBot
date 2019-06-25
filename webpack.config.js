const path = require('path');
const slsw = require('serverless-webpack');
const webpack = require('webpack');

module.exports = {
  entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  target: 'node',
  resolve: {
    extensions: ['.ts', '.js', '.json', 'node'],
  },
  optimization: {
    nodeEnv: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false,
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.node$/,
        loader: 'node-loader',
      },
    ],
  },
  devtool: 'inline-source-map',
  externals: {
    'chrome-aws-lambda': 'chrome-aws-lambda',
    'aws-sdk': 'aws-sdk',
    '@ffmpeg-installer/ffmpeg': '@ffmpeg-installer/ffmpeg',
  },
};
