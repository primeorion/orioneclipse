System.config({
  paths: {
    // paths serve as alias
    'npm:': 'node_modules/'
  },
  // map tells the System loader where to look for things
  map: {
    // our app is within the app folder
    app: 'app',

    // angular bundles
    '@angular/core': 'npm:@angular/core/bundles/core.umd.js',
    '@angular/common': 'npm:@angular/common/bundles/common.umd.js',
    '@angular/compiler': 'npm:@angular/compiler/bundles/compiler.umd.js',
    '@angular/platform-browser': 'npm:@angular/platform-browser/bundles/platform-browser.umd.js',
    '@angular/platform-browser-dynamic': 'npm:@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js',
    '@angular/http': 'npm:@angular/http/bundles/http.umd.js',
    '@angular/router': 'npm:@angular/router/bundles/router.umd.js',
    '@angular/forms': 'npm:@angular/forms/bundles/forms.umd.js',
    '@angular/upgrade': 'npm:@angular/upgrade/bundles/upgrade.umd.js',

'angular2-notifications': 'node_modules/angular2-notifications',
    // other libraries
    'primeng': 'node_modules/primeng',
    'angular2-color-picker': 'node_modules/angular2-color-picker',
    'ng2-dnd': 'node_modules/ng2-dnd',
    'd3': 'node_modules/d3',
    'rxjs': 'npm:rxjs',
    'angular2-in-memory-web-api': 'npm:angular2-in-memory-web-api',
    // ag libraries
    'ag-grid-ng2': 'node_modules/ag-grid-ng2',
    'ag-grid': 'node_modules/ag-grid',
    'ag-grid-enterprise': 'node_modules/ag-grid-enterprise',
    'socket.io-client' : 'node_modules/socket.io-client',
  },
  // packages tells the System loader how to load when no filename and/or no extension

  packages: {
    app: {
      main: './main.js',
      defaultExtension: 'js'
    },
    rxjs: {
      defaultExtension: 'js'
    },
    'ng2-ckeditor': {
      main: 'lib/CKEditor.js',
      defaultExtension: 'js'
    },
    'angular2-in-memory-web-api': {
      main: './index.js',
      defaultExtension: 'js'
    },
    'ag-grid-ng2': {
      defaultExtension: "js"
    },
    'ag-grid': {
      defaultExtension: "js"
    },
    'ag-grid-enterprise': {
      defaultExtension: "js"
    },
    'primeng': { defaultExtension: 'js' },
    'angular2-color-picker': {defaultExtension: 'js'},
    'ng2-dnd': { main: 'index.js', defaultExtension: 'js' },
    'd3': { defaultExtension: 'js' },
    'angular2-notifications': { main: 'components.js', defaultExtension: 'js' },
    'socket.io-client' : {main: 'socket.io.js'}
  }
});