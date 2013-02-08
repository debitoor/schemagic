"use strict";
var path = require("path");
var fs = require("fs");
var format = require("util").format;
var existsSync = fs.existsSync || path.existsSync;
var DIR_NAME = "schemas";

function getSchemasDirectory(startDir) {
	var dir = path.join(startDir || __dirname, "../..");
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


function readRawSchemas(startDir) {
	var schemasDirectory = getSchemasDirectory(startDir);
	if (!schemasDirectory) {
		throw new Error(format("schemagic: can't find directory \"%s\" to contain schemas", DIR_NAME));
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

module.exports = readRawSchemas;

