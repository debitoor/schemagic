var util = require('util');
var format = util.format;
var foreignKeyValidationFactory = require('./foreignKeyValidationFactory');
var exampleJson = require('./exampleJson');
var imjv = require('../is-my-json-valid');
var clone = require('clone');
var traverse = require('traverse');
var moment = require('moment');
var xtend = require('xtend');

function schemaFactory(rawSchema, foreignKeys) {
	var foreignKeyValidation = foreignKeyValidationFactory(foreignKeys);
	var schema = schemaWithAdditionalPropertiesNotAllowedAsDefault(rawSchema);
	var schemaWitNoReadonlyProperties = schemaWitNoReadonly(schema);
	var validateSchema = imjv(schema, {filter: true});
	var validateSchemaNoReadonly = imjv(schemaWitNoReadonlyProperties, {filter: true});
	var normalizedJSON;

	function validate(document, options, optionalCallback) {
		options = options || {};
		options.formats = xtend({
			'date-time': datetimeFormatCheck,
			date: dateFormatCheck,
			currency: currencyFormatCheck
		}, options.formats || {});
		if (options.removeReadOnlyFields === true) { // remove readonly fields from the object, default: false
			validateSchemaNoReadonly(document, {filter: true});
		}
		validateSchema(document, options);
		var errors = validateSchema.errors || [];
		var doForeignKeyValidation = options && options.foreignKey === true;
		if (errors.length === 0 && doForeignKeyValidation && foreignKeys) {
			if (!optionalCallback) {
				throw new Error('Foreign key validation requires a callback');
			}
			return foreignKeyValidation(document, options, function (err, foreignKeyErrors) {
				if (err) {
					return optionalCallback(err);
				}
				errors = errors.concat(foreignKeyErrors);
				var result = {valid: !errors.length, errors: errors};
				return optionalCallback(null, result);
			});
		}
		var result = {valid: !errors.length, errors: errors};
		if (optionalCallback) {
			return optionalCallback(null, result);
		}
		return result;
	}

	function toJSON() {
		normalizedJSON = normalizedJSON || JSON.parse(JSON.stringify(schema, function (key, val) {
			return util.isRegExp(val) ? val.source : val;
		}));
		return normalizedJSON;
	}

	return {
		validate: validate,
		schema: schema,
		exampleJson: exampleJson(schema),
		exampleJsonArray: exampleJson(schema, {asArray: true}),
		toJSON: toJSON
	};
}

function schemaWitNoReadonly(schema) {
	var s = clone(schema);
	var t = traverse(s);
	t.forEach(function (value) {
		if (this.key === 'readonly' && value) {
			var getProp = getParentObjectProp.bind(this);
			var additionalProperties = getProp('additionalProperties');
			var oneOfAllOfOrAnyOff = ['oneOf', 'anyOf', 'allOf'].some(getProp);
			if ((!oneOfAllOfOrAnyOff) && (additionalProperties !== false)) {
				throw new Error(
					format('Schema "%s" can not have readonly properties in object that allows ' +
						'additionalProperties in property "%s" ',
						s.description || 'No description', this.path.join('.')
					)
				);
			}
			this.parent.remove(true);
		}
	});
	return s;

	function getParentObjectProp(prop) {
		return t.get(this.parent.parent.parent.path.concat(prop));
	}
}

function schemaWithAdditionalPropertiesNotAllowedAsDefault(schema) {
	var s = clone(schema);
	var t = traverse(s);
	t.forEach(function (value) {
		if (this.key === 'type' && value === 'object') {
			var getProp = getParentObjectProp.bind(this);
			var additionalProperties = getProp('additionalProperties');
			var oneOfAllOfOrAnyOff = ['oneOf', 'anyOf', 'allOf'].some(getProp);
			if ((!oneOfAllOfOrAnyOff) && (additionalProperties !== true)) {
				t.set([].concat(this.parent.path, ['additionalProperties']), false);
			}
		}
	});
	return s;

	function getParentObjectProp(prop) {
		return t.get(this.parent.path.concat(prop));
	}
}

var minYear = 1970;
var dateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
function datetimeFormatCheck(value) {
	var dateTime = moment(value, 'YYYY-MM-DDThh:mm:ssZ');
	if (!dateTime || !dateTime.isValid() || !dateTimePattern.test(value)) {
		return false;
	} else if (dateTime.year() < minYear) {
		return false;
	}
	return true;
}

var datePattern = /^\d{4}-\d{2}-\d{2}$/;
function dateFormatCheck(value) {
	var dateTime = moment(value, 'YYYY-MM-DD');
	if (!dateTime || !dateTime.isValid() || !datePattern.test(value)) {
		return false;
	} else if (dateTime.year() < minYear) {
		return false;
	}
	return true;
}

var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;
var max = MAX_SAFE_INTEGER / 100;
var min = -MAX_SAFE_INTEGER / 100;
function currencyFormatCheck(value) {
	console.error(value, (value.toString().split('.')[1] || '').length);
	if (typeof value !== 'number') {
		return false;
	} else if ((value.toString().split('.')[1] || '').length > 2) {
		return false;
	} else if (value > max || value < min) {
		return false;
	}
	return true;
}


module.exports = schemaFactory;
