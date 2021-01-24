const path = require('path');
const webpack = require('webpack');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const eslintFormatter = require('eslint-friendly-formatter');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const { name } = require('../package');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'js/[name].js',
    chunkFilename: 'js/[name].chunk.js',
    path: path.resolve('build'),
    publicPath: '/',
    library: `${name}-[name]`,
    libraryTarget: 'umd',
    jsonpFunction: `webpackJsonp_${name}`,
    globalObject: 'window'
  },
  devtool: 'cheap-module-eval-source-map',
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx', '.jsx'],
    alias: {
      '@': path.resolve('src'),
      'react-dom': '@hot-loader/react-dom'
    }
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    ReactDOM: 'ReactDOM',
    'react-addons-transition-group': 'React.addons.TransitionGroup',
    'react-addons-pure-render-mixin': 'React.addons.PureRenderMixin'
  },
  module: {
    rules: [
      // {
      //   test: /\.(js|jsx)$/,
      //   include: path.resolve('src'),
      //   enforce: 'pre',
      //   use: [
      //     {
      //       options: {
      //         formatter: eslintFormatter
      //       },
      //       loader: 'eslint-loader'
      //     }
      //   ]
      // },
      {
        test: /\.(ts|js)x?$/,
        include: path.resolve('src'),
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            ['@babel/plugin-proposal-class-properties', { loose: true }],
            'react-hot-loader/babel'
          ]
        }
      },
      {
        test: /\.(css|less)$/,
        include: /node_modules/, // 注意两个 loader 的区别，这个只针对 node_modules 中的内容
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                mode: 'global',
                localIdentName: '[local]-[hash:base64:5]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: require('./postcss.config')
          },
          {
            loader: 'less-loader',
            options: require('./less.config')
          }
        ]
      },
      {
        test: /\.(css|less)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader'
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
              modules: {
                mode: 'global',
                localIdentName: '[local]-[hash:base64:5]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: require('./postcss.config')
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true
            }
          }
        ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new AntdDayjsWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebPackPlugin({
      filename: 'index.html',
      template: './public/index.html',
      favicon: './public/favicon.ico',
      inject: true,
      meta: {
        'x-server-env': process.env.BUILD_ENV
      }
    }),
    new webpack.DefinePlugin({
      'window._IS_LOCAL': JSON.stringify(true),
      _SERVER_ENV: JSON.stringify(process.env.BUILD_ENV)
    })
  ]
};
