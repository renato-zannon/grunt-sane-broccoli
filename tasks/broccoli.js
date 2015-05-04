module.exports = function(grunt) {
  var path = require('path');
  var plugin = require(path.join(__dirname, '..', 'lib', 'plugin'));

  grunt.registerMultiTask('broccoli', 'Execute Custom Broccoli task', broccoliTask);

  function broccoliTask() {
    if (typeof(this.data.env) === 'string') {
      process.env.BROCCOLI_ENV = this.data.env;
    } else if (this.data.env) {
      Object.keys(this.data.env).forEach(function (key) {
        process.env[key] = this.data.env[key];
      }.bind(this));
    } else {
      process.env.BROCCOLI_ENV = 'development';
    }

    var liveReloadPort = this.data.liveReloadPort || 35729;
    var command = this.args[0],
      dest = this.data.dest,
      config = this.data.config;

    if (command === 'build') {
      if (!dest) {
        grunt.fatal('You must specify a destination folder, eg. `dest: "dist"`.');
      }
      var done = this.async();
      plugin.build(dest, config).then(function(output) {
        if (output.totalTime) {
          grunt.log.ok('Build successful (' + Math.floor(output.totalTime / 1e6) + 'ms)');
        } else {
          grunt.log.ok('Build successful');
        }
        done();
      }, function(err) {
        grunt.log.error(err);
        done(false);
      });
    } else if(command === 'watch') {
      if (!dest) {
        grunt.fatal('You must specify a destination folder, eg. `dest: "dist"`.');
      }
      if(this.data.background) {
        var backgroundProcess = grunt.util.spawn({
          cmd: process.argv[0],
          args: [
            path.join(__dirname, '..', 'lib', 'background.js'),
            dest
          ]
        }, function() { });
        backgroundProcess.stdout.pipe(process.stdout);
        backgroundProcess.stderr.pipe(process.stderr);
        process.on('exit', function () {
          backgroundProcess.kill();
        });
      } else {
        var watcher = plugin.watch(dest, config).on('error', function(error) {
          grunt.log.error(error.stack);
        });
        if (this.data.liveReload) {
          var liveReload = require('tiny-lr');
          var liveReloadServer = liveReload();
          liveReloadServer.listen(liveReloadPort);
          watcher.on("livereload", function(){
            liveReloadServer.changed({body: {files: ['LiveReload files']}});
          });
        }
      }
      this.async();
    } else if(command === 'serve') {
      var host = this.data.host || 'localhost';
      var port = this.data.port || 4200;

      plugin.serve(config, { host: host, port: port, liveReloadPort: liveReloadPort });
      this.async();
    } else {
      grunt.fatal('You must specify either the :build, :watch or :serve command after the target.');
    }
  }
};
