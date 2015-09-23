var path = require('path');
var broccoli = require('broccoli');
var rimraf = require('rimraf');
var mkdirp = require('mkdirp');
var path = require('path');
var copyDereferenceSync = require('copy-dereference').sync;
var Watcher = require('broccoli-sane-watcher');
var fs = require("fs");

// Write the results tree to the dest path without blowing away the entire dest
// directory first. Remove all contents of dest, and place the contents of the
// results tree into it.
function write(src, dest){
  mkdirp.sync(dest);
  fs.readdirSync(dest).forEach(function(file) {
    rimraf.sync(path.join(dest, file));
  });
  fs.readdirSync(src).forEach(function(file) {
    copyDereferenceSync(path.join(src, file), path.join(dest, file));
  });
}

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
        write(output.directory, dest);
        return builder.cleanup().then(function() {
          return output;
        });
      });
  },
  serve: function(config, options) {
    var builder = this.builder(config);
    var watcher = new Watcher(builder, { interval: 100, verbose: true });
    broccoli.server.serve(builder, {
      host: options.host,
      port: options.port,
      watcher: watcher
    });
    return watcher
      .on('change', function(results) { watcher.emit('livereload'); })
      .on('error', function(results) { watcher.emit('livereload'); });
  },
  watch: function(dest, config) {
    var builder = this.builder(config);
    var watcher = new Watcher(builder, { interval: 100, verbose: true });
    return watcher.on('change', function(results) {
      write(results.directory, dest);
      watcher.emit('livereload');
    });
  }
};

module.exports = plugin;
