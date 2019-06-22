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
  target: 'node',
  externals: [
    /aws-sdk/, // Available on AWS Lambda
  ],
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
  externals: {
    'chrome-aws-lambda': 'chrome-aws-lambda',
    '@ffmpeg-installer/ffmpeg': '@ffmpeg-installer/ffmpeg',
  },
};
