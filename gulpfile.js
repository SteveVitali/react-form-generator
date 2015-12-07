var gulp = require('gulp');
var uglify = require('gulp-uglify');
var react = require('gulp-react');
var replace = require('gulp-replace');
var concat = require('gulp-concat');

// Build the version located at /dist/react-form-generator.min.js
// that can be used globally or through bower
gulp.task('build-global', function() {
  gulp.src('src/*.jsx')
    .pipe(react())
    .pipe(concat('form-generator.js'))
    .pipe(gulp.dest('dist'))
    .pipe(replace(
      'module.exports = FormGenerator',
      'window.FormGenerator = FormGenerator'
    ))
    .pipe(replace("var React = require('react');", ''))
    .pipe(replace("var ReactBootstrap = require('react-bootstrap');", ''))
    .pipe(uglify())
    .pipe(concat('form-generator.min.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('src/*.jsx', ['build-global']);
});

gulp.task('default', ['watch']);
