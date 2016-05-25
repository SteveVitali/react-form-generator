var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var watchify = require('watchify');
var babel = require('babelify');
var resolutions = require('browserify-resolutions');

function compile(watch) {
  var bundler = watchify(
    browserify('./example-form.jsx', { debug: true })
      .plugin(resolutions, ['react'])
      .transform(babel)
  );

  function rebundle() {
    var start = Date.now();
    bundler.bundle()
      .on('error', function(err) {
        console.error(err); this.emit('end');
      })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'));
    console.log('Updated in', (Date.now() - start) + 'ms');
  }

  watch && bundler.on('update', rebundle);

  rebundle();
}

gulp.task('build', function() { return compile(); });
gulp.task('watch', function() { return compile(true); });

gulp.task('default', ['watch']);
