const util = require('util');
const foreignKeyValidationFactory = require('./foreignKeyValidationFactory');
const generateExampleJson = require('./generateExampleJson');
const imjv = require('is-my-json-valid');
const clone = require('clone');
const traverse = require('traverse');
const formats = require('./formats');
const parseExampleJson = require('./parseExampleJson');

const dataRegExp = /^data\./;

function schemaFactory(rawSchema, foreignKeys) {
	let normalizedJSON;

	const foreignKeyValidation = foreignKeyValidationFactory(foreignKeys);
	const schema = schemaWithAdditionalPropertiesNotAllowedAsDefault(rawSchema);
	const schemaWitNoReadonlyProperties = schemaWitNoReadonly(schema);

	const validateSchema = getValidateSchemaInstance();
	const filterSchema = getFilterSchemaInstance();
	const validateSchemaNoReadonly = getValidateSchemaNoReadonlyInstance();

	const exampleJson = generateExampleJson(schema);
	const example = parseExampleJson(exampleJson); //make sure it can be parser, this will throw if not
	const exampleJsonArray = generateExampleJson(schema, { asArray: true });
	const exampleArray = parseExampleJson(exampleJsonArray); //make sure it can be parser, this will throw if not
	const exampleMinimalJson = generateExampleJson(schema, { minimal: true });
	const exampleMinimal = exampleMinimalJson && parseExampleJson(exampleMinimalJson); //make sure it can be parser, this will throw if not
	const exampleNoReadOnlyJson = generateExampleJson(schema, { noReadOnly: true });
	const exampleNoReadOnly = exampleMinimalJson && parseExampleJson(exampleMinimalJson); //make sure it can be parser, this will throw if not

	const schemaContainer = {
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
		return imjv(schema, {
			formats: formats,
			verbose: true
		});
	}
	function getFilterSchemaInstance() {
		return imjv(schema, {
			filter: true,
			formats: formats
		});
	}

	function getValidateSchemaNoReadonlyInstance() {
		return imjv(schemaWitNoReadonlyProperties, {
			filter: true
		});
	}

	function localize(locale) {
		return locale && schemaContainer.localizedSchemas && schemaContainer.localizedSchemas[locale] || schemaContainer;
	}

	function validate(document, options, optionalCallback) {
		options = options || {};

		validateSchema(document);
		let errors = validateSchema.errors || [];
		const doForeignKeyValidation = options && options.foreignKey === true;
		if (errors.length === 0 && doForeignKeyValidation && foreignKeys) {
			if (!optionalCallback) {
				throw new Error('Foreign key validation requires a callback');
			}
			return foreignKeyValidation(document, options, function (err, foreignKeyErrors) {
				if (err) {
					return optionalCallback(err);
				}
				errors = errors.concat(foreignKeyErrors);
				const result = transformErrorsAndHandleReadOnly(errors);
				return optionalCallback(null, result);
			});
		}
		const result = transformErrorsAndHandleReadOnly(errors);
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
					const index = parseInt(err.property, 10);
					if (!isNaN(index)) {
						err.index = index;
					}
				}
			});
			if (options.removeReadOnlyFields === true) { // remove readonly fields from the object, default: false
				validateSchemaNoReadonly(document);
			} else if (options.filter === true) {
				filterSchema(document);
			}
			const result = { valid: !errors.length, errors: errors };
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
	let hasHiddenProperties = false;
	const schemaCopy = clone(schema);
	const schemaTraverse = traverse(schemaCopy);
	
	schemaTraverse.forEach(function (value) {
		if (this.key === 'hidden' && value === true) {
			hasHiddenProperties = true;
		}
		if (this.key === 'type' && value === 'object') {
			const getProp = getParentObjectProp.bind(this);
			const additionalProperties = getProp('additionalProperties');
			const oneOfAllOfOrAnyOff = ['oneOf', 'anyOf', 'allOf'].some(getProp);
			if ((!oneOfAllOfOrAnyOff) && (additionalProperties !== true)) {
				schemaTraverse.set([].concat(this.parent.path, ['additionalProperties']), false);
			}
		}
	});

	if (hasHiddenProperties) {
		const schemaWithoutHiddenProperties = traverse(clone(schemaCopy))
			.forEach(function (value) {
				(this.key === 'hidden') && (value === true) && this.parent.remove();
			});

		schemaCopy.toJSON = function () {
			return schemaWithoutHiddenProperties;
		};
	}

	return schemaCopy;

	function getParentObjectProp(prop) {
		return !this.parent || schemaTraverse.get(this.parent.path.concat(prop));
	}
}

module.exports = schemaFactory;
