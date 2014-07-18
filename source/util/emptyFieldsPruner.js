"use strict";
var _ = require('underscore');

var pruner = (function() {

	function pruneEmptyFields(documents) {
		if (_.isArray(documents)) {
			documents.map(function(document){
				pruneEmptyFields(document);
			});
			pruneEmptyFieldsArrayElements(documents);
		} else if (_.isObject(documents)) {
			pruneEmptyFieldsDocument(documents);
		}

		return documents;
	}

	function pruneEmptyFieldsArrayElements(array) {
		for (var i=array.length-1; i>=0; i--) {
			if (isNullValue(array[i])) {
				array.splice(i,1);
			}
		}
	}

	function pruneEmptyFieldsDocument(document){
		Object.keys(document).forEach(function(prop) {
			if (isNullValue(document[prop])) {
				delete document[prop];
			} else {
				pruneEmptyFields(document[prop]);
			}
		});
	}

	function isNullValue(value) {
		return value===null || value==="" || value===undefined;
	}

	return {
		prune: pruneEmptyFields
	};
})();

module.exports = pruner;