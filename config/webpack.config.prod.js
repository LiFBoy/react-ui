'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const eslintFormatter = require('eslint-friendly-formatter');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const InlineSourcePlugin = require('html-webpack-inline-source-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const { name, version } = require('../package.json');

const getPublishPath = () => {
  switch (process.env.BUILD_ENV) {
    case 'test':
      return `//cdn.xiaoyuanhao.com/test/${name}/${version}/`;
    case 'production':
      return `//s.xiaoyuanhao.com/${name}/${version}/`;
    default:
      return '/';
  }
};

module.exports = {
  mode: 'production',
  entry: {
    main: './src/index.js',
  },
  output: {
    filename: 'js/[name].[chunkhash:8].js',
    chunkFilename: 'js/[name].[chunkhash:8].chunk.js',
    path: path.resolve('build'),
    publicPath: getPublishPath(),
    library: `${name}-[name]`,
    libraryTarget: 'umd',
    jsonpFunction: `webpackJsonp_${name}`,
    globalObject: 'window',
  },
  devtool: 'false',
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx', '.jsx'],
    alias: {
      '@': path.resolve('src'),
    },
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'ReactDOM': 'ReactDOM',
    'react-addons-transition-group': 'React.addons.TransitionGroup',
    'react-addons-pure-render-mixin': 'React.addons.PureRenderMixin',
  },
  module: {
    rules: [{
      test: /\.(ts|js)x?$/,
      include: path.resolve('src'),
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
      },
    }, {
      test: /\.(js|jsx)$/,
      include: path.resolve('src'),
      // exclude: /react-engine/,
      enforce: 'pre',
      use: [{
        options: {
          formatter: eslintFormatter,
        },
        loader: 'eslint-loader',
      }],
    }, {
      test: /\.html$/,
      use: [{
        loader: 'html-loader',
        options: { minimize: { removeAttributeQuotes: false }},
      }],
    }, {
      test: /\.(css|less)$/,
      include: /node_modules/,
      use: [
        MiniCssExtractPlugin.loader,
        {
          loader: 'css-loader',
          options: {
            importLoaders: 2,
            modules: {
              mode: 'global',
              localIdentName: '[local]-[hash:base64:5]',
            }
          },
        },
        {
          loader: 'postcss-loader',
          options: require('./postcss.config'),
        },
        {
          loader: 'less-loader',
          options: require('./less.config'),
        },
      ],
    }, {
      test: /\.(css|less)$/,
      exclude: /node_modules/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
        options: {
          publicPath: getPublishPath()
        }
      }, {
        loader: 'css-loader',
        options: {
          importLoaders: 2,
          modules: {
            mode: 'global',
            localIdentName: '[local]-[hash:base64:5]',
          }
        },
      }, {
        loader: 'postcss-loader',
        options: require('./postcss.config'),
      }, {
        loader: 'less-loader',
        options: { javascriptEnabled: true },
      }],
    }, {
      test: /\.svg$/,
      loader: 'svg-url-loader',
      options: {
        limit: 10000,
        noquotes: true,
      },
    }, {
      test: /\.(png|jpe?g|gif)(\?.*)?$/,
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: 'img/[name].[hash:8].[ext]',
      },
    }, {
      test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
      loader: 'file-loader',
      options: {
        name: 'fonts/[name].[hash:8].[ext]',
      },
    }],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new AntdDayjsWebpackPlugin(),
    new HardSourceWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css',
      chunkFilename: 'css/[name].[contenthash:8].chunk.css',
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      favicon: './public/favicon.ico',
      inject: true,
      inlineSource: 'runtime~.+\\.js',
    }),
    new OptimizeCSSAssetsPlugin(),
    new ManifestPlugin(),
    new InlineSourcePlugin(),
    new webpack.DefinePlugin({
      'window._IS_LOCAL': JSON.stringify(false),
      '_SERVER_ENV': JSON.stringify(process.env.BUILD_ENV),
    }),
  ],
  // 优化代码
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true,
      }),
    ],
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        libs: {
          name: 'vendor-libs',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial',
        },
        antdUI: {
          name: 'antd-ui',
          priority: 20,
          test: /[\\/]node_modules[\\/]antd[\\/]/,
        },
        commons: {
          name: 'components',
          test: /src\/components/,
          minChunks: 3,
          priority: 2,
          reuseExistingChunk: true,
        },
      },
    },
    runtimeChunk: true,
    concatenateModules: true,
  },
  performance: {
    hints: false,
  },
};
