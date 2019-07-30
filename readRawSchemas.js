"use strict";
var path = require('path');
var fs = require('fs');
var deepEqual = require('deep-equal');

function readRawSchemas(schemasDirectory) {
	var schemaFileNames = fs.readdirSync(schemasDirectory);
	var schemas = {};
	schemaFileNames.forEach(function (schemaFileName) {
				if (/^\.\w+/.test(schemaFileName)) {
					return;
				}

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
				if (schemaName !== 'foreignKeys') {
					var copy = JSON.parse(JSON.stringify(schema));
					if (!deepEqual(schema, copy)) {
						throw new Error(`The schema ${schemaFilePath} is not JSON stringify-able`);
					}
				}
	});
	return schemas;
}

module.exports = readRawSchemas;

