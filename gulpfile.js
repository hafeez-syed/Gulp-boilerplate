var gulp = require('gulp'),
    /*
    *  Gulp load plugins load all plugins that begin with 'gulp-' prefix.
    *  It stores them in the plugins object, removes that gulp prefix and
    *  camel case them eg. gulp-svg-sprites becomes plugins.svgSprites
    * */
    $ = require('gulp-load-plugins')({lazy: true}),
    args = require('yargs').argv,
    del = require('del'),
    wiredep = require('wiredep').stream,
    config = require('./gulp.config'),
    browserSync = require('browser-sync'),
    port = process.env.PORT || config.defaultPort,
    messages = require('./gulptasks/logMessage')(),
    logMessage = messages.logMessage,
    notification = messages.handleNotification;

gulp.task('default', ['help']);
gulp.task('build', build);
gulp.task('less-watcher', lessWatcher);
gulp.task('wiredep', wiredepFiles);
gulp.task('inject', ['wiredep', 'styles', 'templateCache'], injectFiles);
gulp.task('serve-dev', ['inject'], serveDev);
gulp.task('help', $.taskListing);
gulp.task('styles', ['clean-styles'], styles);
gulp.task('fonts', ['clean-fonts'], copyFonts);
gulp.task('images', ['clean-images'], copyImages);
gulp.task('clean-styles', cleanStyles);
gulp.task('clean-fonts', cleanFonts);
gulp.task('clean-images', cleanImages);
gulp.task('clean', cleanAll);
gulp.task('clean-code', cleanCode);
gulp.task('templateCache', ['clean-code'], templateCache);
gulp.task('optimize', ['inject'], optimize);


function styles() {
    logMessage('Compiling Less --> CSS');
    return gulp
        .src(config.allLess)
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
        .pipe(gulp.dest(config.temp));
}

function copyFonts() {
    logMessage('Copying fonts.');
    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts'));
}

function copyImages() {
    logMessage('Copying and compressing images');
    return gulp
        .src(config.images)
        .pipe($.imagemin({optimizationLevel: 4}))
        .pipe(gulp.dest(config.build + 'images'));
}

function build() {
    logMessage('Code checking with JSHint and JSCS');
    return gulp
        .src(config.allJs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jscs.reporter())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
        .pipe($.jshint.reporter('fail'))
    ;
}

function cleanAll() {
    var files = [].concat(config.build, config.temp);
    return del(files);
}

function cleanCode() {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    return del(files);
}

function templateCache() {
    logMessage('Creating AngularJS $templateCache');

    return gulp
        .src(config.htmlTemplates)
        .pipe($.minifyHtml({empty:true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
}

function cleanStyles() {
    var lessFiles = config.temp + '**/*.css';
    return clean(lessFiles);
}

function cleanFonts() {
    var fontsFiles = config.build + 'fonts/**/*.*';
    return clean(fontsFiles);
}

function cleanImages() {
    var imagesFiles = config.build + 'images/**/*.*';
    return clean(imagesFiles);
}

function clean(path) {
    logMessage('Cleaning . . . ' + path);
    return del(path);
}

function lessWatcher() {
    logMessage('Watching LESS files: . . . ' + config.allLess);
    gulp.watch(config.allLess, ['styles']);
}

function wiredepFiles() {
    logMessage('Wire up the bower css and out app js into the html');
    var options = config.wiredepDefaultOptions();
    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.injectJs)))
        .pipe(gulp.dest(config.client));
}

function injectFiles() {
    logMessage('Wire up the app css into the html, and call wiredep');
    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.allCss)))
        .pipe(gulp.dest(config.client));
}

function optimize() {
    logMessage('Optimizing the javascript, css, html');
    
    var assets = $.useref.assets({searchPath: './'});
    var templateCache = config.temp + config.templateCache.file;

    return gulp.src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {read: false}), {
            starttag: '<!-- inject:templates:js -->',
            relative: false,
            addRootSlash: true
        }))
        .pipe(assets)
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe(gulp.dest(config.build));
}

function serveDev() {
    var isDev = true;
    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.serverFiles]
    };

    return $.nodemon(nodeOptions)
        .on('restart', ['build'], function(eve) {
            logMessage('*** nodemon restarted');
            logMessage('files changed on restart:\n' + eve);
            setTimeout(function() {
                browserSync.notify('reloading now . . .');
                browserSync.reload({stream: false});
            }, config.browserReloadDelay);
        })
        .on('start', function() {
            logMessage('*** nodemon started');
            startBrowserSync();
        })
        .on('crash', function() {
            logMessage('*** nodemon crashed: script crashed for some reason');
        })
        .on('exist', function() {
            logMessage('*** nodemon existed cleanly');
        });
}

function changeEvent (event) {
    var srcPattern = new RegExp('/.*(?=/' + config.src  + ')');
    logMessage('PATH === ' + event.path.replace(srcPattern) + ', ' + event.type);
    notification('PATH === ' + event.path.replace(srcPattern) + ' is ' + event.type);
}

function startBrowserSync() {
    if (args.nosync || browserSync.active) {
        return;
    }

    gulp.watch(config.allLess, ['styles'])
        .on('change', function(event) {
           changeEvent(event);
        });

    var browserSyncOptions = {
        proxy: 'localhost:' + port,
        port: 8443,
        https: {
            key: "./src/certs/custom.key",
            cert: "./src/certs/custom.crt"

        },
        files: [
            config.client + '**/*.js',
            '!' + config.allLess,
            config.allCss
        ],
        ghostMode: {
            clicks: true,
            location: true,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'gulp-patterns',
        notify: true,
        reloadDelay: 0
    };

    browserSync(browserSyncOptions);

    logMessage('Starting browser-sync on port' + port);
    notification('GULP application is ready');
}
