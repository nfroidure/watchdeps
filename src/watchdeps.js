var request = require('request');
var fs = require('fs');
var glob = require("glob");
var Promise = require('bluebird');

function watchdeps(options, callback) {

  var watchdepsPromise =
    getDependencies(options.recursively ?
      '**/node_modules/*/package.json' :
      'node_modules/*/package.json'
    ).then(function(dependencies) {
      if(options.verbose) {
        console.log('Found ' + dependencies.length + ' dependencies.');
      }
      return processDependencies(dependencies, options);
    });

  if(callback) {
    return watchdepsPromise
      .then(callback)
      .catch(callback);
  }

  return watchdepsPromise;

}

function getDependencies(pattern) {
  return Promise.promisify(glob)(pattern, {});
}

function processDependencies(dependencies, options) {
  return Promise.all(dependencies.map(function(dependency) {
    return processDependency(dependency, options);
  })).then(function(results) {
    return {
      processed: results.reduce(function(sum, n) {
        return n + sum;
      }, 0),
      total: dependencies.length
    };
  });
};

function processDependency(dependency, options) {
  return (Promise.promisify(fs.readFile)(dependency, 'utf-8'))
    .then(function(content) {
      var contents = JSON.parse(content);
      var matches;
      if(!(
        contents.repository &&
        contents.repository.type &&
        contents.repository.url
      )) {
        options.verbose && console.log(contents.name + ' has no repository field.');
        return 0;
      }
      if('git' !== contents.repository.type) {
        options.verbose && console.log(contents.name +
          ' is not a git repository (' + contents.repository.type + ').');
        return 0;
      }
      matches = contents.repository.url.match(
        /^(?:git@github.com:|https?:\/\/github.com\/|git:\/\/github.com\/)([^/]+)\/([^/]+)\.git/i
      );
      if(!matches) {
        matches = contents.repository.url.match(
          /^(?:git@github.com:|https?:\/\/github.com\/|git:\/\/github.com\/)([^/]+)\/([^/]+)(?:\/|$)/i
        );
      }
      if(!matches) {
        options.verbose && console.log(contents.name +
          ' is not a GitHub repository (' + contents.repository.url + ').');
        return 0;
      }
      options.verbose && console.log(contents.name +
        ': sending watch request.');
      return (new Promise(function(resolve, reject) {
        request[options.unwatch ? 'del' : 'put']({
          url: 'https://api.github.com/repos/' + matches[1] + '/' + matches[2] +
            '/subscription',
          body: {
            subscribed: true
          },
          json: true,
          headers: {
            "user-agent": "npm-watchdeps",
            authorization: "Basic " + (new Buffer(options.username + ":" + options.password, "ascii").toString("base64"))
          }
        }).on('response', function(response) {
          if(((!options.unwatch) && 200 !== response.statusCode) ||
            (options.unwatch && 204 !== response.statusCode)) {
            options.verbose && console.log(contents.name +
              ' couldn\'t update subscription (' + response.statusCode + ').');
            if(401) {
              return reject(new Error('E_BAD_CREDENTIALS'));
            }
            if(403) {
              return reject(new Error('E_UNAUTHORIZED'));
            }
            return reject(new Error('E_UNEXPECTED_RESPONSE'));
          }
          options.verbose && console.log(contents.name +
            ': successfully ' + (options.unwatch ? 'un' : ' ') + 'watched.');
          resolve(1);
        });
      }));
    });
};

module.exports = watchdeps;
