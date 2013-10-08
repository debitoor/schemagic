var jsonSchema = require("json-schema");
var util = require('util');
var readOnlyDocumentPrunerFactory = require("./readOnlyDocumentPruner");
var maxDecimalHandlerFactory = require("./maxDecimalHandler");
var stringFormatValidatorFactory = require("./stringFormatValidator");
var foreignKeyValidationFactory = require("./foreignKeyValidationFactory");
var exampleJson = require("./exampleJson");
var emptyFieldsPrumer = require("./emptyFieldsPrumer");
var emptyStringsToNullFactory = require("./emptyStringsToNullFactory");

function schemaFactory(rawSchema, foreignKeys) {

	var readOnlyDocumentProner = readOnlyDocumentPrunerFactory(rawSchema);
	var maxDecimalHandler = maxDecimalHandlerFactory(rawSchema);
	var stringFormatValidator = stringFormatValidatorFactory(rawSchema);
	var foreignKeyValidation = foreignKeyValidationFactory(foreignKeys);
	var normalizedJSON;

	function validate(document, options, optionalCallback) {
		options = options || {};
		var errors = [];
		if (options.removeReadOnlyFields !== false) { // remove readonly fields from the object, default: true
			readOnlyDocumentProner(document);
		}
		if (options.emptyStringsToNull === true) { //replace empty strings to null, default: false
			emptyStringsToNullFactory.toNull(document);
		}
		if (options.removeEmptyFields !== false) { // remove empty fields (null, "" and undefined) from the object, default: true
			emptyFieldsPrumer.prune(document);
		}
		if (options.decimalsValidation !== false) {  // cut off remaining decimals, default: true
			maxDecimalHandler(document);
		}
		if (options.stringFormatValidation !== false) {
			errors = errors.concat(stringFormatValidator(document).errors);
		}

		errors = errors.concat(jsonSchema._validate(document, rawSchema, options).errors);
		var doForeignKeyValidation = options && options.foreignKey === true;
		if (errors.length === 0 && doForeignKeyValidation && foreignKeys) {
			if (!optionalCallback) {
				throw new Error("Foreign key validation requires a callback");
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
		normalizedJSON = normalizedJSON || JSON.parse(JSON.stringify(rawSchema, function (key, val) {
			return util.isRegExp(val) ? val.source : val;
		}));
		return normalizedJSON;
	}

	return {
		validate: validate,
		schema: rawSchema,
		exampleJson: exampleJson(rawSchema),
		exampleJsonArray: exampleJson(rawSchema, {asArray: true}),
		toJSON: toJSON
	};
}

module.exports = schemaFactory;
