'use strict';

var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var terser = require('gulp-terser');
var concat = require('gulp-concat');
var header = require('gulp-header');
var buffer = require('vinyl-buffer');
var pkg = require('./package.json');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var rename = require('gulp-rename');
var inject = require('gulp-inject');

var banner = ['/**',
    ' * <%= pkg.name %> v<%= pkg.version %>',
    ' * Copyright <%= pkg.author %>',
    ' * @link https://github.com/ionaru/easy-markdown-editor',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n');

function lint() {
    return gulp.src('./src/js/**/*.js')
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
}

function scripts() {
    return browserify({entries: './src/js/easymde.js', standalone: 'EasyMDE'}).bundle()
        .pipe(source('easymde.min.js'))
        .pipe(buffer())
//        .pipe(terser())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

function styles() {
    var css_files = [
        './node_modules/codemirror/lib/codemirror.css',
        './src/css/*.css',
        './node_modules/codemirror-spell-checker/src/css/spell-checker.css',
    ];

    return gulp.src(css_files)
        .pipe(concat('easymde.css'))
//        .pipe(cleanCSS())
        .pipe(rename('easymde.min.css'))
        .pipe(buffer())
        .pipe(header(banner, {pkg: pkg}))
        .pipe(gulp.dest('./dist/'));
}

function html() {
  return gulp.src('./src/EditorHTML.html')
  .pipe(inject(gulp.src(['./dist/*.css', './dist/*.js', './src/EditorInit.js']), {
    starttag: '/* inject:{{path}} */',
    endtag: '/* endinject */',
    relative: true,
    transform: function (filePath, file) {
      // return file contents as string
      return file.contents.toString('utf8'); //.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    }
  }))
  .pipe(gulp.dest('./dist'));
}

function htmljs() {
  return gulp.src('./src/EditorHTML.js')
  .pipe(inject(gulp.src(['./dist/EditorHTML.html']), {
    starttag: '/* inject:{{path}} */',
    endtag: '/* endinject */',
    relative: true,
    transform: function (filePath, file) {
      // return file contents as string
      return '`'+ file.contents.toString('utf8').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$') + '`';
    }
  }))
  .pipe(gulp.dest('./dist'));
}

var build = gulp.series(gulp.parallel(gulp.series(lint, scripts), styles), html, htmljs);

gulp.task('default', build);
gulp.task('lint', lint);
