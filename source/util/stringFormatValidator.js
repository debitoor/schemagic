var _ = require('underscore');
var moment = require('moment');
var propertyHandlerFactory = require('./propertyHandlerFactory.js');

function isValidFormat(format) {
	return format==='date' || format==='date-time';
}

function isValidType(type) {
	return type==='string' || _.isArray(type) && _.contains(type, 'string');
}

var minYear = 1970;
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

		if (format === 'date-time') {
			var dateTime = moment(value, 'YYYY-MM-DDThh:mm:ssZ');
			if (!dateTime || !dateTime.isValid() || !dateTimePattern.test(value)) {
				return {
					property: property,
					message: 'should be a date in ISO 8601 format of YYYY-MM-DDThh:mm:ssZ (date-time)'
				};
			} else if (dateTime.year() < minYear) {
				return {
					property: property,
					message: 'should year be in range from 1970 to 9999'
				};
			}
		}

		if (format === 'date') {
			var date = moment(value, 'YYYY-MM-DD');
			if (!date || !date.isValid() || !datePattern.test(value)) {
				return {
					property: property,
					message: 'should be a date of format YYYY-MM-DD (date)'
				};
			} else if (date.year() < minYear) {
				return {
					property: property,
					message: 'should year be in range from 1970 to 9999'
				};
			}
		}
	}
});


module.exports = stringFormatValidator.getProcessFunction;

// methods exported for unit testing
module.exports.getDefinition = stringFormatValidator.getDefinition;
module.exports.process = stringFormatValidator.process;