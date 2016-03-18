
'use strict';

// Author: Ark Roy
// Version: 1.0.0


//=======================================//
//          TABLE OF CONTENTS            //
//=======================================//
//                                       //
// 01. FILE PATHS                        //
// 02. PLUGINS                           //
// 03. TASK: COMPILE SASS-CSS            //
// 04. TASK: WRITE SASS DOCS             //
// 05. COMPILE APP JS                    //
// 06. COMPILE VENDOR JS                 //
// 07. TASK: WRITE JS DOCS               //
// 08. EXPORT HTML TEMPLATES             //
// 09. EXPORT HTML COMPONENTS            //
// 10. EXPORT IMAGES                     //
// 11. TASK: EXPORT FONTS                //
// 12. EXPORT FAVICON                    //
// 13. CLEAN BUILD                       //
// 14. DEV SEQUENCE                      //
// 15. WATCH CHANGES                     //
// 16. SERVE                             //
// 17. FILE SIZE REPORT                  //
// 18. BUILD SEQUENCE                    //
// 19. PAGE SPEED INSIGHTS               //
// 20. GALLEN FRAMEWORK                  //
// 21. TEST SEQUENCE                     //
//                                       //
//=======================================//

// ------------------------------------------------------------------------------------//
//                               DEVELOPER USAGE GUIDELINES                            //
//---------------|-------------|-------------------------------------------------------//
// PURPOSE       | COMMAND     | TASKS INCLUDED (IDs)                                  //
//---------------|-------------|-------------------------------------------------------//
// Clean Build   | gulp serve  | 03, 05, 06, 08, 09, 10, 11, 12, 13, 14, 15, 16        //
// for assets    |             |                                                       //
//---------------|-------------|-------------------------------------------------------//
// Watch file    | gulp watch  | 03, 05, 08, 09, 15, 16                                //
// changes only  |             |                                                       //
//---------------|-------------|-------------------------------------------------------//
// Production    | gulp build  | 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14        //
// Build         |             | 14, 15, 17, 18, 20, 21                                //
//---------------|-------------|-------------------------------------------------------//
// Test          | gulp test   | 20, 19, 17                                            //
// Build         |             |                                                       //
//---------------|-------------|-------------------------------------------------------//

// ===========================================
// 01. FILE PATHS
// ===========================================

// Overall Project files
var config = {
    build : {
        source : './src/',
        dest : './dist/',
    },
    // Bootstrap Files
    vendor : {
            js: [
                './bower_components/jquery/dist/jquery.js',
                './bower_components/handlebars/handlebars.js',
                './bower_components/bootstrap-sass/assets/javascripts/bootstrap.js'
            ]
    },
    // Fonts Files
    fonts : {
            in: './src/assets/fonts/*.*',
                //'./bower_components/bootstrap-sass/assets/fonts/**/*.*',
            out:'./dist/assets/fonts/'
    },
    // Images Files
    images : {
            in:'./src/assets/images/*.*',
            out: './dist/assets/images'
    },
    // App Styles
    styles: {
            in: './src/css/main.scss',
            out:'./dist/css/',
            maps: 'maps/',
            watch: './src/css/**/*',
            sassOpts: {
                outputStyle: 'compressed',
                precison: 3,
                errLogToConsole: true,
                includePaths: ['./bower_components/bootstrap-sass/assets/stylesheets']
            }
    },
    // App JS
    scripts : {
           in:  ['./src/js/*.js', './src/widgets/*.js'],
           out: './dist/js/'
    },
    // Autoprefixer Settings
    autoprefixerOptions : {
            browsers: ['last 2 versions', '> 5%', 'Firefox ESR']
    },
    // SASS docs destination
    sassdocOptions : {
            out: './docs/sass/'
    },
    // HTML Templates and Components
    html : {
            tplIn: './src/**/*.tpl.html',
            componentIn: './src/**/*.component.html',
            componentOut: './dist/widgets/'
    },
    // HTML files to be included for CSS cleaup (unCSS)
    cssClean : {
            in: './dist/**/*.html'
    },
    // Favicon
    favicon : {
            in: './src/favicon.png'
    },
    galen : {
            url: 'http://192.168.0.102:3000',
            report : './reports',
            specs  : './src/specs/**/*.gspec',
            test   : './src/test/**/*.js'
    }
}

// ===========================================
// 02. PLUGINS
// ===========================================

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    sassdoc = require('sassdoc'),
    jsdoc = require('gulp-jsdoc3'),
    jscs = require('gulp-jscs'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    inject = require('gulp-inject'),
    jshint = require('gulp-jshint'),
    uncss = require('gulp-uncss'),
    gulpPrint = require('gulp-print'),
    gulpif = require('gulp-if'),
    gulpInject = require('gulp-inject'),
    args = require('yargs').argv,
    size = require('gulp-size'),
    filesize = require('gulp-filesize'),
    rename = require('gulp-rename'),
    nano = require('gulp-cssnano'),
    notify = require('gulp-notify'),
    gulpPlumber = require('gulp-plumber'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    del = require('del'),
    runSequence = require('run-sequence'),
    psi = require('psi'),
    gulpGalen = require('gulp-galenframework'),
    browserSync = require('browser-sync').create();


// ===========================================
// 03. TASK: COMPILE SASS-CSS
// ===========================================

gulp.task('styles', function () {
    return gulp.src(config.styles.in)
        .pipe(sass(config.styles.sassOpts))
        .pipe(sourcemaps.init())
        .pipe(sass(config.styles.sassOpts).on('error', sass.logError))
        .pipe(gulpPlumber())
        .pipe(autoprefixer(config.autoprefixerOptions.browsers))
        .pipe(sourcemaps.write(config.styles.maps))
        .pipe(uncss({
            html: [config.html.tplIn, config.html.componentIn]
        }))
        .pipe(nano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(config.styles.out))
        .pipe(browserSync.stream())
        .pipe(notify({ message: 'Styles Updated' }));
       // .pipe(reload({stream:true}));
});


// ===========================================
// 04. TASK: WRITE SASS DOCS
// ===========================================
gulp.task('sassdoc', function () {
    return gulp
        .src(config.styles.in)
        .pipe(sassdoc({dest: config.sassdocOptions.out}));
});


// ===========================================
// 05. COMPILE APP JS
// ===========================================
gulp.task('scripts', function() {
    return gulp
        .src(config.scripts.in)
        .pipe(gulpPlumber())
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe(jscs())
        .pipe(jscs.reporter())
        .pipe(jscs.reporter('fail'))
        .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(config.scripts.out))
        .pipe(browserSync.stream())
        .pipe(notify({ message: 'Scripts updated' }));

});


// ===========================================
// 06. COMPILE VENDOR JS
// ===========================================
gulp.task('vendorjs', function() {
    return gulp.src(config.vendor.js)
        .pipe(gulpPlumber())
        .pipe(concat('vendor.js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(config.scripts.out))
        .pipe(browserSync.stream())
        .pipe(notify({ message: 'VendorJS files updated' }));
});


// ===========================================
// 07. TASK: WRITE JS DOCS
// ===========================================
gulp.task('jsdoc', function (cb) {
    gulp.src(config.scripts.in, {read: false})
        .pipe(jsdoc(cb));
});


// ===========================================
// 08. EXPORT HTML TEMPLATES
// ===========================================
gulp.task('html', function () {
  return gulp.src(config.html.tplIn)
  //.pipe(inject(gulp.src('js/*.min.js', {read: false}), {relative: false}))
  //.pipe(inject(gulp.src(scripts.out + 'app.min.js', {read: false}), {relative: false}))
  //.pipe(inject(gulp.src('css/*.min.css', {read: false}), {relative: true}))
  .pipe(gulp.dest(config.build.dest))
  .pipe(browserSync.stream())
  .pipe(notify({ message: 'HTML updated' }));
});


// ===========================================
// 09. EXPORT HTML COMPONENTS
// ===========================================
gulp.task('components', function () {
  return gulp.src(config.html.componentIn)
//  .pipe(inject(gulp.src(scripts.out + '*.js', {read: false}), {relative: true}))
//  .pipe(inject(gulp.src(styles.out + '*.css', {read: false}), {relative: true}))
  .pipe(gulp.dest(config.html.componentOut))
  .pipe(browserSync.stream());
});


// ===========================================
// 10. EXPORT IMAGES
// ===========================================
gulp.task('images', function() {
    return gulp.src(config.images.in)
    .pipe(imagemin({
			progressive: true,
            interlaced: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		}))
    .pipe(gulp.dest(config.images.out))
    .pipe(browserSync.stream())
    .pipe(notify({ message: 'Images updated' }));
});



// ===========================================
// 11. TASK: EXPORT FONTS
// ===========================================
gulp.task('fonts', function () {
    return gulp
        .src(config.fonts.in)
        .pipe(gulp.dest(config.fonts.out))
        .pipe(browserSync.stream());
});


// ===========================================
// 12. EXPORT FAVICON
// ===========================================
gulp.task('favicon', function() {
    return gulp.src(config.favicon.in)
    .pipe(gulp.dest(config.build.dest))
    .pipe(notify({ message: 'Favicon updated' }));
});


// ===========================================
// 13. CLEAN BUILD
// ===========================================
gulp.task('clean', function() {
    del(config.build.dest);
});

// ===========================================
// 14. DEV SEQUENCE
// ===========================================

// run "gulp dev" in terminal to build the DEV app
gulp.task('build-dev', function(callback) {
    runSequence('clean', ['images', 'fonts', 'favicon'], ['vendorjs', 'scripts'], ['styles'], 'html', 'components', 'build-watch', callback);
});


// ===========================================
// 15. WATCH CHANGES
// ===========================================
gulp.task('build-watch', function() {
    gulp.watch(config.styles.in, ['styles'], browserSync.reload)
    gulp.watch(config.scripts.in, ['scripts'], browserSync.reload)
    gulp.watch(config.html.tplIn, ['html'], browserSync.reload)
    gulp.watch(config.html.componentsIn, ['components'], browserSync.reload)
    console.log('Watching...');
});

gulp.task('watch', ['build-watch']);



// ===========================================
// 16. SERVE
// ===========================================
gulp.task('serve', ['build-dev'], function(){
    if(browserSync.active){
        return;
    }
    browserSync.init({
            server: {
                baseDir: config.build.dest,
                index: "index.tpl.html"
            },
            files: [config.build.source + '**/*.*'],
            ghostMode: {
                clicks: true,
                location: true,
                forms: true,
                scroll: true
            },
            injectChanges: true,
            logFileChanges: true,
            logLevel: 'debug',
            logPrefix: 'fti-patterns',
            notify: true
    });
});

// ===========================================
// 17. FILE SIZE REPORT
// ===========================================
gulp.task('size', function(){
    return gulp.src(config.build.dest + '**/*.*')
        .pipe(size())
        .pipe(filesize());
});


// ===========================================
// 18. BUILD SEQUENCE
// ===========================================
gulp.task('build-prod', function(callback) {
    runSequence(['serve'],'size', 'sassdoc', 'jsdoc', callback);
});
gulp.task('build', ['build-prod']);



// ===========================================
// 19. PAGE SPEED INSIGHTS
// ===========================================
// get the PageSpeed Insights report
gulp.task('psiMobile', function () {
    return psi('http://127.0.0.1:8125/dist/index.tpl.html', {
        // key: key
        nokey: 'true',
        strategy: 'mobile',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
        console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
    });
});

gulp.task('psiDesktop', function () {
    return psi('http://127.0.0.1:8125/dist/index.tpl.html', {
        nokey: 'true',
        // key: key,
        strategy: 'desktop',
    }).then(function (data) {
        console.log('Speed score: ' + data.ruleGroups.SPEED.score);
    });
});


// ===========================================
// 20. CLEAN TEST REPORTS
// ===========================================
gulp.task('clean-report', function (done) {
    del([config.galen.in], function (err) {
        if (err) {
            throw err;
        }
        done();
    });
});

// ===========================================
// 20. GALEN SETUP
// ===========================================
//gulp.task('ui-test', ['clean-report'], function (done) {
//
//    var
//        // Here we create an empty Array to store vinyl File Objects.
//        files = [],
//
//        // Here we define a simple utility Function that we will call to
//        // execute the Galen specs.
//        galen = function galen (file, callback) {
//            spawn('galen', [
//                'test',
//                file.path,
//                '--htmlreport',
//                config.galen.out + '/' + file.relative.replace(/\.test/, '')
//            ], {'stdio' : 'inherit'}).on('close', function (code) {
//                callback(code === 0);
//            });
//        };
//
//    gulp.src([config.galen.in])
//        .pipe(tap(function (file) {
//            files.push(file);
//        }))
//        .on('end', function () {
//            async.rejectSeries(files, function (file, finished) {
//                galen(file, finished);
//            }, function (errors) {
//               if (errors && errors.length > 0) {
//                  done("Galen reported failed tests: " + (errors.map(function(f) {
//                     return f.relative;
//                  }).join(", ")));
//               }
//               else {
//                  done();
//               }
//            });
//        });
//});

//gulp.task('test', function() {
//  gulp.src(config.galen.specs).pipe(gulpGalen.check({
//    url: config.galen.url,
//   // galenPath: gulpGalen.check({galenPath: './node_modules/.bin/galen'}),
//    cwd: config.galen.test,
//    htmlreport: config.galen.report
//  }));
//});

//gulp.task('test', function(done) {
//  gulp.src('./src/specs/**/*.gspec').pipe(gulpGalen.check({
//    galenPath: './node_modules/.bin/galen',
//    url: config.galen.url,
//    cwd: '.src/test/'
//  }),
//
//  , done));
//});

gulp.task('test', function() {
  gulp.src('./src/specs/**/*.gspec')
    .pipe(gulpGalen.check({
      url: config.galen.url,
      //galenPath: './node_modules/.bin/galen',
      cwd:'.src/test/',
      htmlreport: config.galen.report
  }));
})

// ===========================================
// 21. TEST SEQUENCE
// ===========================================
//gulp.task('build-test', ['ui-test', 'size'], serve({
//    'middleware' : function (req, res, next) {
//        index(reportsDir, {
//            'filter'     : false,
//            'hidden'     : true,
//            'icons'      : true,
//            'stylesheet' : false,
//            'template'   : false,
//            'view'       : 'details'
//        })(req, res, next);
//    },
//    'port' : config.galen.port,
//    'root' : config.galen.out
//}));
//
//gulp.task('test', ['build-test']);



