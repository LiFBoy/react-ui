const gulp = require('gulp');
const babel = require('gulp-babel');

const paths = {
  dest: {
    lib: 'lib', // commonjs 文件存放的目录名 - 本块关注
    esm: 'esm', // ES module 文件存放的目录名 - 暂时不关心
    dist: 'dist', // umd文件存放的目录名 - 暂时不关心
  },
  styles: 'components/**/*.less', // 样式文件路径 - 暂时不关心
  scripts: ['components/**/*.{ts,tsx}', '!components/**/demo/*.{ts,tsx}'], // 脚本文件路径
};

/**
 * 编译脚本文件
 * @param {string} babelEnv babel环境变量
 * @param {string} destDir 目标目录
 */
function compileScripts(babelEnv, destDir) {
  console.log(babelEnv, 'babelEnv');
  const { scripts } = paths;
  // 设置环境变量
  process.env.BABEL_ENV = babelEnv;
  return gulp
    .src(scripts)
    .pipe(babel()) // 使用gulp-babel处理
    .pipe(gulp.dest(destDir));
}

/**
 * 编译cjs
 */
function compileCJS() {
  const { dest } = paths;
  return compileScripts('cjs', dest.lib);
}

/**
 * 编译esm
 */
function compileESM() {
  const { dest } = paths;
  return compileScripts('esm', dest.esm);
}

function copyLess() {
  return gulp.src(paths.styles).pipe(gulp.dest(paths.dest.lib)).pipe(gulp.dest(paths.dest.esm));
}

function stylelint() {
  const gulpStylelint = require('gulp-stylelint');
  return gulp.src(['components/**/*.css', 'components/**/*.less', 'components/**/*.scss']).pipe(
    gulpStylelint({
      fix: true,
      reporters: [{ formatter: 'string', console: true }],
    }),
  );
}

function eslint() {
  const eslint = require('gulp-eslint');
  return (
    gulp
      .src([
        'components/**/*.js',
        'components/**/*.jsx',
        'components/**/*.ts',
        'components/**/*.tsx',
      ])
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      .pipe(eslint({ fix: true }))
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      .pipe(eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      .pipe(eslint.failAfterError())
  );
}

// 串行执行编译脚本任务（cjs,esm） 避免环境变量影响
// const buildScripts = gulp.series(compileCJS, compileESM);

// 整体并行执行任务
// const build = gulp.parallel(eslint, buildScripts, copyLess);

const build = gulp.series(gulp.parallel(eslint), compileCJS, compileESM, gulp.parallel(copyLess));
exports.build = build;
exports.eslint = eslint;
exports.stylelint = stylelint;
exports.default = build;
// ...
