"use strict";
var traverse = require('traverse');

module.exports = (function() {

	function toNullEmptyFields(documents) {
		if (documents === '') {
			return null;
		}
		traverse(documents).forEach(function(value) {
			if (value === '') {
				this.update(null);
			}
		});

		return documents;
	}

	return {
		toNull: toNullEmptyFields
	};
})();