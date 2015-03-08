#! /usr/bin/env node

var program = require('commander');
var fs = require('fs');
var prompt = require('prompt');
var watchdeps = require('../src/watchdeps');

program
  .version('0.0.1')
  .option('-U, --unwatch', 'unwatch repositories.')
  .option('-v, --verbose', 'tell me everything!')
  .option('-r, --recursive', 'recursively watch the dependencies dependencies.')
  .option('-u, --username [value]', 'your GitHub username.')
  .option('-p, --password [value]', 'your GitHub password (leave empty to be prompted, recommended).')
  .parse(process.argv);

if(!(program.token || program.password)) {
  prompt.start();
  prompt.get({
    properties: {
      password: {
        hidden: true,
        required: true
      }
    }
  }, function (err, result) {
    if(err) {
      console.log(program.verbose ? err.stack : err);
    }
    program.password = result.password;
    runWatchdeps(program);
  });
} else {
  runWatchdeps(program);
}

function runWatchdeps(program) {
  watchdeps(program).then(function(result) {
    console.log('Done (' + result.processed + ' dependencies watched on ' + result.total + ').');
  }, function(err) {
    if(err) {
      console.log(program.verbose ? err.stack : err);
    }
  });
}
