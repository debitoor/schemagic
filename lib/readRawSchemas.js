"use strict";
const path = require('path');
const fs = require('fs');
const deepEqual = require('deep-equal');

function readRawSchemas(schemasDirectory) {
	const schemaFileNames = fs.readdirSync(schemasDirectory);
	const schemas = {};
	schemaFileNames.forEach(function (schemaFileName) {
				if (/^\.\w+/.test(schemaFileName)) {
					return;
				}

				const schemaName = schemaFileName.replace('.js', '');
				const schemaFilePath = path.join(schemasDirectory, schemaFileName);
				if (!fs.statSync(schemaFilePath).isFile()) {
					return; //only require files (in schema dir root)
				}
				let schema = require(schemaFilePath);
				const keys = Object.keys(schema);
				if (keys.length === 1 && keys[0] === 'default') {
					schema = schema.default;
				}
				schemas[schemaName] = schema;
				if (schemaName !== 'foreignKeys') {
					const copy = JSON.parse(JSON.stringify(schema));
					if (!deepEqual(schema, copy)) {
						throw new Error(`The schema ${schemaFilePath} is not JSON stringify-able`);
					}
				}
	});
	return schemas;
}

module.exports = readRawSchemas;

