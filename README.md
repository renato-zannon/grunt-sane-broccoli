# grunt-sane-broccoli

Allows you to execute your Broccoli configurations as Grunt tasks. [Broccoli](https://github.com/joliss/broccoli) is an asset pipeline that allows for incremental builds. Broccoli rebuilds individual files instead of the entire project as Grunt watch does. Checkout the [Broccoli Sample App](https://github.com/joliss/broccoli-sample-app).

This is a fork of [grunt-broccoli](https://github.com/quandl/grunt-broccoli), substituting the default broccoli watcher with `broccoli-sane-watcher`.

## Running your tasks

grunt-sane-broccoli is a multi-task so you must specify a target when running the task.

#### Building to a directory

```bash
grunt broccoli:{targetName}:build
```

#### Watching for changes and re-building to a directory

```bash
grunt broccoli:{targetName}:watch
```

#### Running the Broccoli server

```bash
grunt broccoli:{targetName}:serve
```

## Configuring your tasks

You can configure these settings (see examples below):

`config`: [String or Function]
If a string, it refers to the location of the Brocfile relative to the current working directory.
If a function, it expects that the return value is a Broccoli-compatible tree.
Defaults to 'Brocfile.js'.

`dest`: [String]
Specifies the output folder. This doesn't affect the `serve` command.
The `build` and `watch` commands will abort if a `dest` directory is not set.

`host`/`port`: [String]/[Number]
Specifies the host and port that the Broccoli server runs on. This only affects the `serve` command.
Defaults to `localhost` and `4200`.

`env`: [String]
Set the `BROCCOLI_ENV` to use (see [broccoli-env](https://github.com/joliss/broccoli-env)).

## Examples

```javascript
broccoli: {
  dist: {
    dest: 'dist',
    config: function() {
      var transpiled = transpileTree('lib');
      var allFiles = mergeTrees([transpiled, 'vendor']);
      var concated = concatFiles(allFiles);
      var uglified = uglifyFiles(concated);
      return uglified;
    }
  },

  dev: {
    dest: 'tmp/tests',
    config: 'brocfiles/development.js',
    port: 4201
  }
}
```
