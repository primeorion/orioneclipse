/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function(global) {
  // map tells the System loader where to look for things
  var map = {
    'app':                        'app', // 'dist',
    '@angular':                   'node_modules/@angular',
    'angular2-in-memory-web-api': 'node_modules/angular2-in-memory-web-api',
    'rxjs':                       'node_modules/rxjs',
    'ag-grid-ng2':	              'node_modules/ag-grid-ng2',
    'ag-grid-enterprise':	        'node_modules/ag-grid-enterprise',
    'ag-grid':	                  'node_modules/ag-grid',
    'primeng':	                  'node_modules/primeng',
    'ng2-dnd':                    'node_modules/ng2-dnd',
    'd3':                         'node_modules/d3'
  };
  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'app':                        { main: 'main.js',  defaultExtension: 'js' },
    'rxjs':                       { defaultExtension: 'js' },
    'ag-grid-ng2':	              { defaultExtension: 'js' },
    'ag-grid':	                  { defaultExtension: 'js' },
    'ag-grid-enterprise':	        { defaultExtension: 'js' },
    'angular2-in-memory-web-api': { defaultExtension: 'js' },
    'primeng':                    { defaultExtension: 'js' },
    'ng2-dnd':                    { defaultExtension: 'js' },
    'd3':                         { defaultExtension: 'js' }
  };
  var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated',
    'upgrade',
    'forms'
  ];
  // Individual files (~300 requests):
  function packIndex(pkgName) {
    packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
  }

  // Bundled (~40 requests):
  function packUmd(pkgName) {
    packages['@angular/'+pkgName] = { main: '/bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  }

  // Most environments should use UMD; some (Karma) need the individual index files
  var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;

  // Add package entries for angular packages
  ngPackageNames.forEach(setPackageConfig);

  // No umd for router yet
  packages['@angular/router'] = { main: 'index.js', defaultExtension: 'js' };
  var config = {
    map: map,
    packages: packages
  }
  System.config(config);
})(this);
