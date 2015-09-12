var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    jade = require('gulp-jade'),
    rename = require('gulp-rename'),
    server = require('gulp-express');

gulp.task('server', function () {
  server.run(['server/index.js']);

  gulp.watch('client/views/**/*.jade', ['templates']);
  gulp.watch('client/scss/*.scss', ['styles']);

  gulp.watch('public/**/*.css', server.notify);
  gulp.watch('public/**/*.html', server.notify);

  gulp.watch(['server/*.js', 'server/**/*.js'], server.run);
});

gulp.task('styles', function() {
  return gulp.src('./client/scss/base.scss')
    .pipe(sass('sass', { style: 'expanded' }))
    .pipe(autoprefixer())
    .pipe(rename('stylesheet.css'))
    .pipe(gulp.dest('./public/assets/css/'));
});

gulp.task('templates', function() {
  return gulp.src('./client/views/**/*.jade')
    .pipe(jade({pretty: true}))
    .pipe(gulp.dest('./public/'))
});

gulp.task('set-dev-node-env', function() {
    return process.env.NODE_ENV = 'dev';
});

gulp.task('build', ['styles', 'templates']);
gulp.task('dev', ['set-dev-node-env', 'build', 'server']);