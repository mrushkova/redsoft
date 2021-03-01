'use strict';

var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sourcemap = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var server = require('browser-sync').create();
var csso = require('gulp-csso');
var rename = require('gulp-rename');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var posthtml = require('gulp-posthtml');
var include = require('posthtml-include');

gulp.task('css', function () {
  return gulp
    .src('scss/main.scss')
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(gulp.dest('css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('css'))
    .pipe(server.stream());
});

gulp.task('scss', function () {
  return gulp.src('scss/main.scss').pipe(sass()).pipe(gulp.dest('css'));
});

gulp.task('server', function () {
  server.init({
    server: '.',
    notify: false,
    open: true,
    cors: true,
    ui: false,
  });

  gulp.watch('scss/**/*.scss', gulp.series('css', 'scss'));
  gulp.watch('img/*.svg', gulp.series('html'));
  gulp.watch('js/*.js', gulp.series('refresh'));
  gulp.watch('*.html', gulp.series('html', 'refresh'));
});

gulp.task('refresh', function (done) {
  server.reload();
  done();
});

gulp.task('html', function () {
  return gulp
    .src('*.html')
    .pipe(posthtml([include()]))
    .pipe(gulp.dest('.'));
});

gulp.task('js', () =>
  browserify({
    entries: 'js/main.js',
  })
    .transform('babelify', {
      presets: ['@babel/preset-env'],
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemap.init({ loadMaps: true }))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest('js'))
);

gulp.task('copy', function () {
  return gulp
    .src(['fonts/**/*.{woff,woff2}', 'img/**', 'js/**'], {
      base: 'source',
    })
    .pipe(gulp.dest('.'));
});

gulp.task('build', gulp.series('copy', 'css', 'html', 'js'));
gulp.task('start', gulp.series('build', 'server'));
