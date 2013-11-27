#!/usr/bin/env node
"use strict";
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.APP_ENV = process.env.APP_ENV || 'development';
var jsHint = require("./../node_modules/jshint/src/cli.js");
var options = { args: ['.']};
if (process.argv.join('').indexOf('teamcity') !== -1) {
	options.reporter = require('jshint-teamcity-reporter').reporter;
}
if (!jsHint.run(options)) {
	return setTimeout(function () {
		console.error("Exiting because of jsHint errors");
		process.exit(1);
	}, 1000);
}
//run Mocha
var realProcessExit = process.exit;
process.exit = function (code) {
	setTimeout(realProcessExit.bind(process, code), 1000);
};
require('./../node_modules/mocha/bin/_mocha');
