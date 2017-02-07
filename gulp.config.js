  var rootPath = './',
      src = rootPath + 'src',
      build = rootPath + 'build/',
      bowerComponents = './bower_components',
      fonts = bowerComponents + '/font-awesome/fonts/**/*.*',
      defaultPort =  7203,
      client = src + '/client/',
      htmlTemplates =  client + '**/*.html',
      nodeServer = './src/server/app.js',
      serverFiles = src + '/server',
      test = rootPath + 'test',
      temp = rootPath + '.tmp/',
      styles = client + 'styles',
      allJs = [src + '/**/*.js', rootPath + '*.js'],
      allLess = [styles + '/*.less'],
      allCss = temp + 'styles.css',
      index = client + 'index.html',
      clientApp = client + 'app/',
      injectJs = [
          clientApp + '**/*.module.js',
          clientApp + '**/*.js',
          '!' + clientApp + '**/*.spec.js'
      ],
      images = client + 'images/**/*.*',
      templateCache = {
          file: 'templates.js',
          options: {
              module: 'app.core',
              standAlone: false,
              root: 'app/'
          }
      },
      bower = {
          json: require('./bower.json'),
          directory: bowerComponents,
          ignorePath: '../..'
      },
      wiredepDefaultOptions = function() {
          return {
              bowerJson: bower.json,
              directory: bower.directory,
              ignorePath: bower.ignorePath
            };
      },
      browserReloadDelay = 1000
    ;

module.exports =  {
    allCss: allCss,
    allJs: allJs,
    allLess: allLess,
    browserReloadDelay: browserReloadDelay,
    build: build,
    client: client,
    htmlTemplates: htmlTemplates,
    templateCache: templateCache,
    defaultPort: defaultPort,
    fonts: fonts,
    images: images,
    index: index,
    injectJs: injectJs,
    nodeServer: nodeServer,
    rootPath: rootPath,
    serverFiles: serverFiles,
    src: src,
    styles: styles,
    temp: temp,
    test: test,
    wiredepDefaultOptions: wiredepDefaultOptions
};
