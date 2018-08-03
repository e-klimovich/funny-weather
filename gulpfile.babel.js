'use strict'

import gulp from 'gulp'
import sass from 'gulp-sass'
import concat from 'gulp-concat'
import zip from 'gulp-zip'
import sync from 'gulp-sync'
import pckg from './package.json'

const gulpsync = sync(gulp)
const version = pckg.version

gulp.task('styles', () =>
    gulp.src('./src/styles/**/*.scss')
        .pipe(sass())
        .pipe(concat('bundle.css'))
        .pipe(gulp.dest('./dest/'))
)

gulp.task('scripts', () =>
    gulp.src('./src/scripts/**/*.js')
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest('./dest/'))
)

gulp.task('build-zip', () =>
    gulp.src('./dest')
        .pipe(zip(`fancy_weather_v.${version}.zip`))
        .pipe(gulp.dest('./build/'))
)

gulp.task('watch', function() {
    gulp.watch(['./src/styles/**/*.scss'], ['styles']);
    gulp.watch(['./src/scripts/index.js'], ['scripts']);
});

// development
gulp.task('default', ['styles', 'scripts', 'watch'])

// build for publishing
gulp.task('build', gulpsync.sync(['styles', 'scripts', 'build-zip']))