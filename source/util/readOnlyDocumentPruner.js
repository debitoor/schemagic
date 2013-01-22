var util = require('util');

var readOnlyDocumentPruner = (function() {

	function getPruneDefinition(jsonSchema) {
		var pruneDefinition = [];

		if (jsonSchema.type === 'array') {
			scanPropertyDefinition(jsonSchema, [], pruneDefinition);
		} else if (jsonSchema.type === 'object') {
			scanPropertiesDefinition(jsonSchema.properties, [], pruneDefinition);
		} else {
			throw new Error('Currently readOnlyDocumentPruner only supports objects and arrays at root ' +
				'level in the schema. Current type not supported: ' + jsonSchema.type);
		}
		return pruneDefinition;
	}
	
	function scanPropertiesDefinition(properties, path, pruneDefinition) {
		var keys = Object.keys(properties);
		keys.forEach(function(key){
			path.push(key);

			scanPropertyDefinition(properties[key], path, pruneDefinition);

			path.pop();
		});
	}

	function scanPropertyDefinition(property, path, pruneDefinition) {
		if (property.readonly) {
			pruneDefinition.push(JSON.parse(JSON.stringify(path)));
		} else if (property.type === 'object') {
			scanPropertiesDefinition(property.properties, path, pruneDefinition);
		} else if (property.type === 'array') {
			scanArrayDefinition(property, path, pruneDefinition);
		}
	}

	function scanArrayDefinition(arrayDef, path, pruneDefinition) {
		if (arrayDef.items.readonly) {
			pruneDefinition.push(JSON.parse(JSON.stringify(path)));
		} else {
			scanPropertiesDefinition(arrayDef.items.properties, path, pruneDefinition);
		}
	}

	function prune(document, pruneDefinition) {

		pruneDefinition.forEach(function(prunePath){
			pruneDocument(document, prunePath, 0);
		});
	}

	function pruneDocument(document, prunePath, index) {

		var property = prunePath[index];
		var subDoc = document[property];

		if (!subDoc) {
			return;
		} else if (prunePath.length===index+1) {		// end of prune path
			delete document[property];
		} else if (util.isArray(subDoc)) {				// we have an array
			pruneArray(subDoc, prunePath, index+1);
		} else {                                        // goto next property
			pruneDocument(subDoc, prunePath, index+1);
		}
	}

	function pruneArray(array, prunePath, index) {
		array.forEach(function(doc){
			pruneDocument(doc, prunePath, index);
		});
	}

	function getPruneFunction(jsonSchema) {
		var pruneDefinition = getPruneDefinition(jsonSchema);

		return function(document) {
			prune(document, pruneDefinition);
		};
	}

	return {
		getPruneDefinition: getPruneDefinition,
		prune: prune,
		getPruneFunction: getPruneFunction
	};
}());

module.exports = readOnlyDocumentPruner.getPruneFunction;

// methods exported for unit testing
module.exports.getPruneDefinition = readOnlyDocumentPruner.getPruneDefinition;
module.exports.prune = readOnlyDocumentPruner.prune;