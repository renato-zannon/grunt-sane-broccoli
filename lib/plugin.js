var path = require('path');
var broccoli = require('broccoli');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var path = require('path');
var copyDereferenceSync = require('copy-dereference').sync;
var Watcher = require('broccoli-sane-watcher');

var plugin = {
  builder: function(config) {
    var tree;
    if (typeof config === 'function') {
      tree = config();
    } else if (typeof config === 'string' || typeof config === 'undefined') {
      var configFile = config || 'Brocfile.js';
      var configPath = path.join(process.cwd(), configFile);
      try {
        tree = require(configPath);
      } catch(e) {
        // grunt.fatal("Unable to load Broccoli config file: " + e.message);
      }
    }
    return new broccoli.Builder(tree);
  },
  build: function(dest, config) {
    var builder = this.builder(config);
    return builder.build()
      .then(function(output) {
        rimraf.sync(dest);
        mkdirp.sync(path.join(dest, '..'));
        copyDereferenceSync(output.directory, dest);
        return output;
      });
  },
  serve: function(config, options) {
    var builder = this.builder(config);
    broccoli.server.serve(builder, { host: options.host, port: options.port, liveReloadPort: options.liveReloadPort });
  },
  watch: function(dest, config) {
    var builder = this.builder(config);
    var watcher = new Watcher(builder, { interval: 100 });
    return watcher.on('change', function(results) {
      console.log('\n\nChange detected');
      rimraf.sync(dest);
      mkdirp.sync(path.join(dest, '..'));
      copyDereferenceSync(results.directory, dest);
      console.log('Build successful\n');
      watcher.emit("livereload");
    });
  }
};

module.exports = plugin;
