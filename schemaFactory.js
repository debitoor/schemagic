var util = require('util');
var foreignKeyValidationFactory = require('./foreignKeyValidationFactory');
var generateExampleJson = require('./generateExampleJson');
var imjv = require('is-my-json-valid');
var clone = require('clone');
var traverse = require('traverse');
var formats = require('./formats');
var parseExampleJson = require('./parseExampleJson');

var dataRegExp = /^data\./;

function schemaFactory(rawSchema, foreignKeys) {
	var normalizedJSON;

	var foreignKeyValidation = foreignKeyValidationFactory(foreignKeys);
	var schema = schemaWithAdditionalPropertiesNotAllowedAsDefault(rawSchema);
	var schemaWitNoReadonlyProperties = schemaWitNoReadonly(schema);

	var validateSchema;
	var filterSchema;
	var validateSchemaNoReadonly;

	var exampleJson = generateExampleJson(schema);
	var example = parseExampleJson(exampleJson); //make sure it can be parser, this will throw if not
	var exampleJsonArray = generateExampleJson(schema, { asArray: true });
	var exampleArray = parseExampleJson(exampleJsonArray); //make sure it can be parser, this will throw if not
	var exampleMinimalJson = generateExampleJson(schema, { minimal: true });
	var exampleMinimal = exampleMinimalJson && parseExampleJson(exampleMinimalJson); //make sure it can be parser, this will throw if not
	var exampleNoReadOnlyJson = generateExampleJson(schema, { noReadOnly: true });
	var exampleNoReadOnly = exampleMinimalJson && parseExampleJson(exampleMinimalJson); //make sure it can be parser, this will throw if not

	var schemaContainer = {
		localize,
		validate,
		schema,
		exampleJson,
		exampleJsonArray,
		example,
		exampleArray,
		exampleMinimalJson,
		exampleMinimal,
		exampleNoReadOnlyJson,
		exampleNoReadOnly,
		toJSON
	};
	return schemaContainer;	


	function getValidateSchemaInstance() {
		validateSchema = validateSchema || imjv(schema, {
			formats: formats,
			verbose: true
		});
		return validateSchema;
	}
	function getFilterSchemaInstance() {
		filterSchema = filterSchema || imjv(schema, {
			filter: true,
			formats: formats
		});
		return filterSchema;
	}

	function getValidateSchemaNoReadonlyInstance() {
		validateSchemaNoReadonly = validateSchemaNoReadonly || imjv(schemaWitNoReadonlyProperties, {
			filter: true
		});
		return validateSchemaNoReadonly;
	}

	function localize(locale) {
		return locale && schemaContainer.localizedSchemas && schemaContainer.localizedSchemas[locale] || schemaContainer;
	}

	function validate(document, options, optionalCallback) {
		options = options || {};

		getValidateSchemaInstance()(document);
		var errors = getValidateSchemaInstance().errors || [];
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

		function transformErrorsAndHandleReadOnly(errors) {
			errors.forEach(function (err) {
				if (err.field) {
					err.property = err.field;
					delete err.field;
				}
				if (err.value && typeof err.value === 'string' && dataRegExp.test(err.value)) {
					err.property += '.' + err.value.split('.').pop();
					delete err.value;
				}
				if (err.property) {
					err.property = err.property.replace(dataRegExp, '');
					if (!err.property || err.property === 'data') {
						err.property = 'root';
					}
					var index = parseInt(err.property, 10);
					if (!isNaN(index)) {
						err.index = index;
					}
				}
			});
			if (options.removeReadOnlyFields === true) { // remove readonly fields from the object, default: false
				getValidateSchemaNoReadonlyInstance()(document);
			} else if (options.filter === true) {
				getFilterSchemaInstance()(document);
			}
			var result = { valid: !errors.length, errors: errors };
			return result;
		}
	}

	function toJSON() {
		normalizedJSON = normalizedJSON || JSON.parse(JSON.stringify(schema, function (key, val) {
			return util.isRegExp(val) ? val.source : val;
		}));
		return normalizedJSON;
	}
}

function schemaWitNoReadonly(schema) {
	if (schema.readonly) {
		if (schema.type !== 'object') {
			throw new Error('only object type root objects in schema are allowed to be readonly');
		}
		return {
			description: schema.description,
			type: 'object',
			additionalProperties: false
		};
	}

	return traverse(schema).map(function (value) {
		if (this.key === 'readonly' && value) {
			this.parent.remove();
		}
	});
}

function schemaWithAdditionalPropertiesNotAllowedAsDefault(schema) {
	var hasHiddenProperties = false;
	var s = clone(schema);
	var t = traverse(s);
	
	t.forEach(function (value) {
		if (this.key === 'hidden' && value === true) {
			hasHiddenProperties = true;
		}
		if (this.key === 'type' && value === 'object') {
			var getProp = getParentObjectProp.bind(this);
			var additionalProperties = getProp('additionalProperties');
			var oneOfAllOfOrAnyOff = ['oneOf', 'anyOf', 'allOf'].some(getProp);
			if ((!oneOfAllOfOrAnyOff) && (additionalProperties !== true)) {
				t.set([].concat(this.parent.path, ['additionalProperties']), false);
			}
		}
	});

	if (hasHiddenProperties) {
		const schemaWithoutHiddenProperties = traverse(clone(s))
			.forEach(function (value) {
				(this.key === 'hidden') && (value === true) && this.parent.remove();
			});

		s.toJSON = function () {
			return schemaWithoutHiddenProperties;
		};
	}

	return s;

	function getParentObjectProp(prop) {
		return !this.parent || t.get(this.parent.path.concat(prop));
	}
}

module.exports = schemaFactory;
