var gulp = require('gulp');

gulp.task('default', function () {
    gulp.src('./node_modules/requirejs/require.js')
        .pipe(gulp.dest('./lib'));

    gulp.src('./Scripts/TypeSpec/*.d.ts')
        .pipe(gulp.dest('./dist/src'));

    gulp.src('./Scripts/TypeSpec/*.js')
        .pipe(gulp.dest('./dist/src'));

    gulp.src('../README.md')
        .pipe(gulp.dest('./dist'));

    gulp.src('./package.json')
        .pipe(gulp.dest('./dist'));
});