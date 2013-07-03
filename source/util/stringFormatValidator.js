var _ = require('underscore');
var moment = require('moment');
var propertyHandlerFactory = require('./propertyHandlerFactory.js');

function isValidFormat(format) {
	return format==='date';
	//return format==='date' || format==='date-time';  // ignore date-time for now
}

function isValidType(type) {
	return type==="string" || _.isArray(type) && _.contains(type, "string");
}

var datePattern = /^\d{4}-\d{2}-\d{2}$/;
var dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;

var stringFormatValidator = propertyHandlerFactory({
	toBeProcess: function(properties) {
		if (isValidFormat(properties.format) && isValidType(properties.type)) {
			return {
				format: properties.format
			};
		}
		return null;
	},

	processHandler: function(document, property, data) {

		var value = document[property];
		var format = data.format;
		if (typeof value !== 'string') {
			return;
		}
		value = value.trim();

		if (format==='date-time') {
			if (!dateTimePattern.test(value) || !moment(value, "YYYY-MM-DDThh:mm:ssZ").isValid()) {
				return {
					property: property,
					message: 'should be a date in ISO 8601 format of YYYY-MM-DDThh:mm:ssZ (date-time)'
				};
			}
		}

		if (format==='date') {
			if (!datePattern.test(value) || !moment(value, "YYYY-MM-DD").isValid()) {
				return {
					property: property,
					message: 'should be a date of format YYYY-MM-DD (date)'
				};
			}
		}
	}
});


module.exports = stringFormatValidator.getProcessFunction;

// methods exported for unit testing
module.exports.getDefinition = stringFormatValidator.getDefinition;
module.exports.process = stringFormatValidator.process;