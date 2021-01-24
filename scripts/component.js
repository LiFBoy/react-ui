#!/usr/bin/env node

const { argv } = require('yargs')
  .usage('Usage: cf-demo [path/to/component] [-p port]')
  .option('port', {
    alias: 'p',
    default: 8080,
    describe: 'storybook port',
  });
const assert = require('assert');
const inquirer = require('inquirer');
const glob = require('glob');
const path = require('path');
const startStorybook = require('./start-storybook.js');

const componentDir = argv._[0] || path.join(__dirname, '../components');

inquirer.registerPrompt(
  'autocomplete',
  require('inquirer-autocomplete-prompt')
);

async function runComponents(paths) {
  const all = '全部组件';
  const pathList = [all].concat(paths);
  const result = await inquirer.prompt([
    {
      type: 'autocomplete',
      name: 'component',
      message: '请选择要启动的组件',
      source(answersSoFar, input) {
        return new Promise((resolve) => {
          // 默认显示全部列表
          if (!input) resolve(pathList);
          else {
            resolve(
              pathList.filter((p) =>
                p.toLowerCase().includes(input.toLowerCase())
              )
            );
          }
        });
      },
    },
  ]);
  const { component } = result;
  const targetPath = path.join(
    componentDir,
    component === all ? '' : component
  );
  await start(targetPath);
}

async function start(targetPath) {
  await startStorybook(targetPath, argv);
}

function run() {
  const compPath = argv._.filter((_) => path.join(process.cwd(), _));
  if (compPath.length > 0) {
    start(compPath);
    return;
  }
  glob(
    '**/*.{stories,story}.{js,jsx,ts,tsx}',
    {
      cwd: componentDir,
    },
    (er, fileList) => {
      if (er) throw er;
      assert(
        fileList.length > 0,
        '目录下没有找到 *.{stories,story}.{js,jsx,ts,tsx} 文件: ' + componentDir
      );
      // 过滤组件列表
      const uniqMap = fileList.reduce(
        (result, comPath) =>
          Object.assign(result, {
            [comPath.split(path.sep)[0]]: null,
          }),
        {}
      );
      runComponents(Object.keys(uniqMap));
    }
  );
}

run();
