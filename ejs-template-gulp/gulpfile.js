const { src, dest, task, parallel, watch } = require('gulp-help')(require('gulp'))
const plumber = require('gulp-plumber')
const notify = require('gulp-notify')
const ejs = require('gulp-ejs')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const cleanCSS = require('gulp-clean-css')
const packageImporter = require('node-sass-package-importer')
const sourcemaps = require('gulp-sourcemaps')
const imagemin = require('gulp-imagemin')
const rename = require('gulp-rename')
const connect = require('gulp-connect')

const srcDir = {
  ejs: ['src/ejs/**/*.ejs', '!' + 'src/ejs/**/_*.ejs'],
  sass: 'src/styles/**/*.scss',
  image: 'src/images/**/*'
}

const distDir = {
  ejs: 'dist/',
  sass: 'dist/styles/',
  image: 'dist/images/'
}

/**
 * EJS compile
 */
function ejsCompile() {
  return src(srcDir.ejs)
    .pipe(plumber())
    .pipe(ejs({}, {}, {ext:'.html'}))
    .pipe(rename({ extname: ".html" }))
    .pipe(dest(distDir.ejs))
    .pipe(connect.reload())
}
ejsCompile.description = 'Compile ejs to html'

/**
 * sass compile
 * @returns {*}
 */
function sassCompile() {
  return src(srcDir.sass)
    .pipe(
      plumber({
        errorHandler: notify.onError('Error: <%= error.message %>')
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        importer: packageImporter({
          extensions: ['.scss', '.css']
        })
      })
    )
    .pipe(autoprefixer())
    .pipe(dest(distDir.sass))
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(dest(distDir.sass))
    .pipe(connect.reload())
}
sassCompile.description = 'SCSS Compile Task'

function minifyImage() {
  return src(srcDir.image)
    .pipe(imagemin([
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo()
    ]))
    .pipe(dest(distDir.image))
}
minifyImage.description = 'Minify images'

/**
 * Start server
 */
function start(done) {
  return connect.server({
    root: './dist',
    livereload: true,
    port: 3000
  }, function () { this.server.on('close', done) })
}

/**
 * File Watcher
 */
function watcher() {
  watch(srcDir.ejs, task('ejsCompile'))
  watch(srcDir.sass, task('sassCompile'))
}
watcher.description = 'gulp watch task'

/**
 * gulp tasks
 */
exports.ejsCompile = ejsCompile
exports.sassCompile = sassCompile
exports.minifyImage = minifyImage
exports.start = start
exports.watch = watcher
exports.build = parallel(ejsCompile, sassCompile, minifyImage)
