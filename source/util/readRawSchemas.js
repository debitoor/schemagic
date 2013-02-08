"use strict";
var path = require("path");
var fs = require("fs");
var existsSync = fs.existsSync || path.existsSync;
var DIR_NAME = "schemas";

function getSchemasDirectory() {
	var dir = path.join(__dirname, "../..");
	var lastDir;
	while (lastDir !== dir) {
		if (existsSync(path.join(dir, DIR_NAME))) {
			return path.join(dir, DIR_NAME);
		}
		lastDir = dir;
		dir = path.join(dir, "..");
	}
	return false;
}


function readRawSchemas() {
	var schemasDirectory = getSchemasDirectory();
	if (!schemasDirectory) {
		console.warn("schemagic: can't find directory \"%s\" to contain schemas", DIR_NAME);
	}
	var schemaFileNames = fs.readdirSync(schemasDirectory);
	var schemas = {};
	schemaFileNames.forEach(function (schemaFileName) {
		var schemaName = schemaFileName.replace('.js', '');
		var schemaFilePath = path.join(schemasDirectory, schemaFileName);
		if(!fs.statSync(schemaFilePath).isFile()){
			return; //only require files (in schema dir root)
		}
		schemas[schemaName] = require(schemaFilePath);
	});
	return schemas;
}

module.exports = readRawSchemas();

