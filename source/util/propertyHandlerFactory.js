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
			throw new Error('Currently propertyHandlerFactory only supports objects and arrays at root ' +
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
		var errors = [];
		definition.forEach(function(def){
			processDocument(document, def.data, def.path, 0, errors);
		});
		return {valid:!errors.length,errors:errors};
	}

	function processDocument(document, data, path, index, errors) {

		var property = path[index];
		var subDoc = document[property];

		if (subDoc===undefined) {
		} else if (path.length===index+1) {		// end of process path
			var err = processHandler(document, property, data);
			if (err) {
				errors.push(err);
			}
		} else if (util.isArray(subDoc)) {				// we have an array
			processArray(subDoc, data, path, index+1, errors);
		} else {                                        // goto next property
			processDocument(subDoc, data, path, index+1, errors);
		}
	}

	function processArray(array, data, processPath, index, errors) {
		array.forEach(function(doc){
			processDocument(doc, data, processPath, index, errors);
		});
	}

	function getProcessFunction(jsonSchema) {
		var definition = getDefinition(jsonSchema);

		return function(document) {
			return process(document, definition);
		};
	}

	return {
		getDefinition: getDefinition,
		process: process,
		getProcessFunction: getProcessFunction
	};
};

module.exports = propertyHandlerFactory;