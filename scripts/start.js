'use strict';

process.on('unhandledRejection', err => {
  throw err;
});

const merge = require('webpack-merge');
const chalk = require('chalk');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const devConfig = require('../config/webpack.config.dev');

const host = '127.0.0.1';
const port = 8009;
const { ANALYZER } = process.env;

/**
 * combination devConfig and devServer
 * product serverConfig
 */
const serverConfig = merge(devConfig, {
  devServer: {
    clientLogLevel: 'none',
    compress: true,
    historyApiFallback: true,
    host: host,
    disableHostCheck: true,
    hot: true,
    inline: true,
    open: true,
    overlay: false,
    port: port,
    progress: false,
    publicPath: '/',
    public: `${host}:${port}`,
    quiet: true,
    watchOptions: {
      poll: false,
    },
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: {
      '/nbugs-api/portal': {
        enable: true,
        target: 'http://user-container-test.xiaoyuanhao.com',
        changeOrigin: true,
        secure: false,
        onProxyReq: function(proxyReq) {
          proxyReq.setHeader('Cookie', 'orgId=a;userId=10515856cef747878a6e2daca94b1bd1');
        }
      },
    },
  },
});

if (ANALYZER) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  serverConfig.plugins.push(new BundleAnalyzerPlugin());
}

serverConfig.plugins.push(
  // 启动时进度条
  new ProgressBarPlugin({
    total: 20,
    format: `  start server [:bar] ${chalk.green.bold(':percent')} (:elapsed seconds)`,
    clear: false,
    summaryContent: false
  }),
  /**
   * Friendly-errors-webpack-plugin recognizes certain classes of webpack errors and cleans
   * aggregates and prioritizes them to provide a better Developer Experience.
   */
  new FriendlyErrorsPlugin({
    compilationSuccessInfo: {
      notes: [],
      messages: [`Your application is running here: http://${host}:${port}`],
    },
  }),
);

module.exports = serverConfig;
