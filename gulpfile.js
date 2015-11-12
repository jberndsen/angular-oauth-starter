var gulp = require('gulp'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    ngAnnotate = require('gulp-ng-annotate'),
    sourceFiles = [
      'src/*.js',
    ];

gulp.task('build', function() {
  gulp.src(sourceFiles)
    .pipe(concat('angular-oauth-starter.js'))
    .pipe(ngAnnotate())
    .pipe(gulp.dest('./dist/'))
    .pipe(uglify())
    .pipe(rename('angular-oauth-starter.min.js'))
    .pipe(gulp.dest('./dist'))
});

gulp.task('default', ['build']);