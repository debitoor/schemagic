var util = require('util');
var foreignKeyValidationFactory = require('./foreignKeyValidationFactory');
var exampleJson = require('./exampleJson');
var imjv = require('is-my-json-valid');
var clone = require('clone');
var traverse = require('traverse');
var moment = require('moment');

function schemaFactory(rawSchema, foreignKeys) {
	var foreignKeyValidation = foreignKeyValidationFactory(foreignKeys);
	var schema = schemaWithAdditionalPropertiesNotAllowedAsDefault(rawSchema);
	var schemaWitNoReadonlyProperties = schemaWitNoReadonly(schema);
	var validateSchema = imjv(schema, {
		filter: true,
		formats: {
			'date-time': datetimeFormatCheck,
			date: dateFormatCheck,
			currency: currencyFormatCheck,
			rate: rateFormat,
			'rate-negative':rateNegativeFormat,
			'currency-rate': currencyRateFormat
		}
	});
	var validateSchemaNoReadonly = imjv(schemaWitNoReadonlyProperties, {filter: true});
	var normalizedJSON;

	function validate(document, options, optionalCallback) {
		options = options || {};
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
				var result = transformErrorsAndHandleReadOnly(errors);
				return optionalCallback(null, result);
			});
		}
		var result = transformErrorsAndHandleReadOnly(errors);
		if (optionalCallback) {
			return optionalCallback(null, result);
		}
		return result;

		function transformErrorsAndHandleReadOnly(errors){
			errors.forEach(function(err){
				if(err.field) {
					err.property = err.field;
					delete err.field;
				}
			});
			if (options.removeReadOnlyFields === true) { // remove readonly fields from the object, default: false
				validateSchemaNoReadonly(document, {filter: true});
			}
			var result = {valid: !errors.length, errors: errors};
			return result;
		}
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
	var p = getReadonlyPath();
	if(p && p.length===1){
		if(s.type !== 'object'){
			throw new Error('only object type root objects in schema are allowed to be readonly');
		}
		return {
			description: s.description,
			type:'object',
			additionalProperties: false
		};
	}
	while(p){
		p.pop(); //pop readonly
		var prop = p.pop();
		var obj = t.get(p);
		delete obj[prop];
		t = traverse(s);
		p = getReadonlyPath();
	}
	return s;

	function getReadonlyPath() {
		return t.paths().filter(function(path){
			return path[path.length-1] === 'readonly' && t.get(path);
		})[0];
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
		return !this.parent || t.get(this.parent.path.concat(prop));
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
	if (typeof value !== 'number') {
		return false;
	} else if ((value.toString().split('.')[1] || '').length > 2) {
		return false;
	} else if (value > max || value < min) {
		return false;
	}
	return true;
}

function rateFormat(value) {
	if (typeof value !== 'number') {
		return false;
	} else if ((value.toString().split('.')[1] || '').length > 2) {
		return false;
	} else if (value > 100 || value < 0) {
		return false;
	}
	return true;
}

function rateNegativeFormat(value) {
	if (typeof value !== 'number') {
		return false;
	} else if ((value.toString().split('.')[1] || '').length > 2) {
		return false;
	} else if (value > 0 || value < -100) {
		return false;
	}
	return true;
}

function currencyRateFormat(value) {
	if (typeof value !== 'number') {
		return false;
	} else if ((value.toString().split('.')[1] || '').length > 6) {
		return false;
	} else if (value > 999999999 || value < 0.000001) {
		return false;
	}
	return true;
}

module.exports = schemaFactory;
