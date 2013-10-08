"use strict";
var _ = require('underscore');

module.exports = (function() {

	function toNullEmptyFields(documents) {
		if (_.isArray(documents)) {
			documents.map(function(document){
				toNullEmptyFields(document);
			});
			toNullEmptyFieldsArrayElements(documents);
		} else if (_.isObject(documents)) {
			toNullEmptyFieldsDocument(documents);
		} else if (isEmptyString(documents)) {
			documents = null;
		}

		return documents;
	}

	function toNullEmptyFieldsArrayElements(array) {
		for (var i=array.length-1; i>=0; i--) {
			if (isEmptyString(array[i])) {
				array[i] = null;
			}
		}
	}

	function toNullEmptyFieldsDocument(document){
		Object.keys(document).forEach(function(prop) {
			if (isEmptyString(document[prop])) {
				document[prop] = null;
			} else {
				toNullEmptyFields(document[prop]);
			}
		});
	}

	function isEmptyString(value) {
		return value === '';
	}

	return {
		toNull: toNullEmptyFields
	};
})();