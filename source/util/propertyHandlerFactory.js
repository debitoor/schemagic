var util = require('util');

var propertyHandlerFactory = function(options) {

	if (!options.toBeProcess) {
		throw new Error('toBeProcess is missing');
	}

	if (!options.processHandler) {
		throw new Error('processHandler is missing');
	}

	var toBeProcess = options.toBeProcess;

	var processHandler = options.processHandler;

	function pushToDefinition(data, path, definition) {
		definition.push({
			path: JSON.parse(JSON.stringify(path)),
			data: data
		});
	}

	function getDefinition(jsonSchema) {
		var definition = [];

		if (jsonSchema.type === 'array') {
			scanPropertyDefinition(jsonSchema, [], definition);
		} else if (jsonSchema.type === 'object') {
			scanPropertiesDefinition(jsonSchema.properties, [], definition);
		} else {
			throw new Error('Currently decimalPropertyHandler only supports objects and arrays at root ' +
				'level in the schema. Current type not supported: ' + jsonSchema.type + "\n" + JSON.stringify(jsonSchema, null, "\t"));
		}
		return definition;
	}

	function scanPropertiesDefinition(properties, path, definition) {
		if (!properties) {
			return;
		}
		var keys = Object.keys(properties);
		keys.forEach(function(key){
			path.push(key);

			scanPropertyDefinition(properties[key], path, definition);

			path.pop();
		});
	}

	function scanPropertyDefinition(property, path, definition) {
		var data = toBeProcess(property);
		if (data) {
			pushToDefinition(data, path, definition);
		} else if (property.type === 'object') {
			scanPropertiesDefinition(property.properties, path, definition);
		} else if (property.type === 'array') {
			scanArrayDefinition(property, path, definition);
		}
	}

	function scanArrayDefinition(arrayDef, path, definition) {
		var data = toBeProcess(arrayDef.items);
		if (data) {
			pushToDefinition(data, path, definition);
		} else {
			scanPropertiesDefinition(arrayDef.items.properties, path, definition);
		}
	}

	function process(document, definition) {

		definition.forEach(function(def){
			processDocument(document, def.data, def.path, 0);
		});
	}

	function processDocument(document, data, path, index) {

		var property = path[index];
		var subDoc = document[property];

		if (!subDoc) {
		} else if (path.length===index+1) {		// end of process path
			processHandler(document, property, data);
		} else if (util.isArray(subDoc)) {				// we have an array
			processArray(subDoc, data, path, index+1);
		} else {                                        // goto next property
			processDocument(subDoc, data, path, index+1);
		}
	}

	function processArray(array, data, processPath, index) {
		array.forEach(function(doc){
			processDocument(doc, data, processPath, index);
		});
	}

	function getProcessFunction(jsonSchema) {
		var definition = getDefinition(jsonSchema);

		return function(document) {
			process(document, definition);
		};
	}

	return {
		getDefinition: getDefinition,
		process: process,
		getProcessFunction: getProcessFunction
	};
};

module.exports = propertyHandlerFactory;