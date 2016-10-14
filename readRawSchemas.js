"use strict";
var path = require('path');
var fs = require('fs');

function readRawSchemas(schemasDirectory) {
	var schemaFileNames = fs.readdirSync(schemasDirectory);
	var schemas = {};
	schemaFileNames.forEach(function (schemaFileName) {
		var schemaName = schemaFileName.replace('.js', '');
		var schemaFilePath = path.join(schemasDirectory, schemaFileName);
		if (!fs.statSync(schemaFilePath).isFile()) {
			return; //only require files (in schema dir root)
		}
		var schema = require(schemaFilePath);
		var keys = Object.keys(schema);
		if (keys.length === 1 && keys[0] === 'default') {
			schema = schema.default;
		}
		schemas[schemaName] = schema;
	});
	return schemas;
}

module.exports = readRawSchemas;

