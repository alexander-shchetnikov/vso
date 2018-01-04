//gul vinil-ftp
var gulp = require('gulp'),
    sass = require('gulp-sass'),
    pug = require('gulp-pug'),
    gutil = require( 'gulp-util' ),
    ftp = require( 'vinyl-ftp' ),
    del  = require('del'),
    autoprefixer  = require('gulp-autoprefixer'),
    concat      = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify      = require('gulp-uglifyjs'),
    cssnano     = require('gulp-cssnano'), // Подключаем пакет для минификации CSS
    rename      = require('gulp-rename'), // Подключаем библиотеку для переименования файлов// Подключаем gulp-uglifyjs (для сжатия JS)
    browserSync = require('browser-sync');

gulp.task('pug',function () {
    return gulp.src('app/pug/*.pug')
        .pipe(pug({
                pretty:true
            }
        ))
        .pipe(gulp.dest('app/'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('sass',function(){
    return gulp.src('app/sass/main.sass')
        .pipe(sass())
        .pipe(autoprefixer(
                ['last 15 version','> 1%','ie 8','ie 7'],
                {cascade:true}
            )
        )
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('css-libs', ['sass'], function() {
    return gulp.src('app/css/libs.css') // Выбираем файл для минификации
        .pipe(cssnano()) // Сжимаем
        .pipe(rename({suffix: '.min'})) // Добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // Выгружаем в папку app/css
});

gulp.task('scripts', function() {
    return gulp.src([ // Берем все необходимые библиотеки
            'app/libs/jquery/dist/jquery.min.js', // Берем jQuery
            'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // Берем Magnific Popup
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('app/js')); // Выгружаем в папку app/js
});

gulp.task('browser-sync',function(){
    browserSync({
        server: {
            baseDir: 'app'
        },
        notify: false
    });
});

gulp.task('watch',['browser-sync','sass','pug'],function(){
    gulp.watch('app/sass/**/*.sass',['sass']);
    gulp.watch('app/pug/**/*.pug',['pug']);
    gulp.watch('app/*.html',browserSync.reload);
    gulp.watch('app/js/**/*.js',browserSync.reload);
});

gulp.task('clean',function(){
    return del.sync('dist');
});

gulp.task('clear', function () {
    return cache.clearAll();
});

gulp.task('deploy',function () {
   var conn = ftp.create({
       host:        'vso-test.kemsu.ru',
       user:        'vso',
       password:    '6C22DB5f0d',
       parallel:    10,
       log:         'gutil.log'
   });

   var globs = [
       "app/css/**",
       "app/*.html",
       "app/js/**",
       "app/fonts/**",
       "app/img/**"
   ];

    return gulp.src(globs,{
        base: './app/',
        buffer: false
    })
        .pipe( conn.newer( '/vso/' ) ) // only upload newer files
        .pipe( conn.dest( '/vso/' ) );
});

gulp.task('build',['clean','pug','sass'],function(){
    var build_css = gulp.src([
        'app/css/main.css'
    ])
        .pipe(gulp.dest('dist/css'));

    var build_fonts = gulp.src('app/fonts/**/*')
        .pipe(gulp.dest('dist/fonts'));

    var build_html = gulp.src('app/*.html')
        .pipe(gulp.dest('dist'));
});