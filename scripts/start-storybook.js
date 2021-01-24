const ejs = require('ejs');
const fs = require('mz/fs');
const path = require('path');
const execa = require('execa');

const cwd = process.cwd();
module.exports = async function (targetPath, options) {
  console.log(`Starting storybook at: ${targetPath}`);
  const storybookPath = path.resolve(__dirname, '../.storybook');
  const ejsPath = path.join(storybookPath, 'config.js.ejs');
  const configTmpl = await fs.readFile(ejsPath, {
    encoding: 'UTF8',
  });
  const config = ejs.render(configTmpl, {
    targetPath,
  });
  const configPath = path.join(storybookPath, 'config.js');
  await fs.writeFile(configPath, config, {
    encoding: 'UTF8',
  });

  // 完事清掉临时生成的 config 文件
  async function cleanup() {
    // if (await fs.exists(configPath)) {
    //   console.log('Cleaning up config file');
    //   await fs.unlink(configPath);
    // }
    // process.exit(0);
  }

  process.on('cleanup', cleanup);

  // do app specific cleaning before exiting
  process.on('exit', () => {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', () => {
    process.emit('cleanup');
  });

  // catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', () => {
    process.emit('cleanup');
  });

  await execa(
    path.resolve(cwd, 'node_modules/.bin/start-storybook'),
    ['-c', storybookPath, '-p', options.p],
    {
      cwd,
      shell: true,
      stdio: 'inherit',
    }
  );
};
