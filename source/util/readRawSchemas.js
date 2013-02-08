"use strict";
var path = require("path");
var fs = require("fs");

function readRawSchemas(schemasDirectory) {
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

