// 线上构建脚本
// @author Pluto <huarse@gmail.com>
// @create 2020/06/01 00:01

const ora = require('ora');
const webpack = require('webpack');
const chalk = require('chalk');
const dateformat = require('dateformat');
const prodConfig = require('../config/webpack.config.prod');

const { ANALYZER } = process.env;

process.on('unhandledRejection', err => {
  print('error', `unhandledRejection: ${err}`);
  throw err;
});

if (ANALYZER) {
  const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
  prodConfig.plugins.push(new BundleAnalyzerPlugin());
}


/**
 * print console log
 * @param type 日志类型
 * @param msg 日志内容
 */
function print(type, msg) {
  const LOG_TYPES = { 'debug': 'gray', 'info': 'cyan', 'success': 'green', 'warn': 'yellow', 'error': 'red' };
  const c = LOG_TYPES[type] || 'gray';
  const now = new Date();
  let _ss = (+now) % 1e3 + '';
  _ss = ((1e3 + _ss) + '').substring(1);
  console.log(chalk.gray('[' + dateformat(now, 'HH:MM:ss.') + _ss + ']'), chalk[c](msg));
}

const spinner = ora('项目构建中...').start();
webpack(prodConfig, (err, stats) => {
  spinner.stop();

  if (err) {
    print('error', err.stack || err);
    if (err.details) {
      print('error', err.details);
    }
    return;
  }

  const info = stats.toJson();
  if (stats.hasErrors()) {
    print('error', '项目构建失败！');
    print('error', info.errors);
    process.exit(1);
  }

  if (stats.hasWarnings()) {
    print('warn', info.warnings);
    print('warn', err);
  }

  print('success', '项目构建完成！');
});
