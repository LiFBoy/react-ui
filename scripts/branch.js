const simpleGit = require('simple-git');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const git = simpleGit(rootDir);

const MAIN_BRANCH = 'feature-init/1.0.0';
const { argv } = require('yargs')
  .usage('Usage: branch update|merge');

switch (argv._[0]) {
  case 'update':
    updateFromFeature();
    break;
  case 'merge':
    mergeToFeature();
    break;
  default: break;
}

function updateFromFeature() {
  git.add('.')
    .then(() => git.stash() )
    .then(() => git.pull('origin', MAIN_BRANCH) )
    .then(() => git.stash(['apply']));
}

function mergeToFeature() {
  // git.add('.')
  //   .then(() => git.stash() )
  //   .then(() => git.pull('origin', MAIN_BRANCH) )
  //   .then(() => git.stash(['apply']));
}