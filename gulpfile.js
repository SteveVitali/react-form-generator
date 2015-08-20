var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var react = require('gulp-react');

gulp.task('build', function() {
  gulp.src('src/*.jsx')
    .pipe(react())
    .pipe(concat('form-generator.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch(path.JS_SOURCE, ['build']);
});

gulp.task('default', ['watch']);
