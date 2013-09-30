var jsonSchema = require("json-schema");
var util = require('util');
var readOnlyDocumentPrunerFactory = require("./readOnlyDocumentPruner");
var maxDecimalHandlerFactory = require("./maxDecimalHandler");
var stringFormatValidatorFactory = require("./stringFormatValidator");
var foreignKeyValidationFactory = require("./foreignKeyValidationFactory");
var exampleJson = require("./exampleJson");
var emptyFieldsPrumer = require("./emptyFieldsPrumer");

function schemaFactory(rawSchema, foreignKeys) {

	var readOnlyDocumentProner = readOnlyDocumentPrunerFactory(rawSchema);
	var maxDecimalHandler = maxDecimalHandlerFactory(rawSchema);
	var stringFormatValidator = stringFormatValidatorFactory(rawSchema);
	var foreignKeyValidation = foreignKeyValidationFactory(foreignKeys);
	var normalizedJSON;

	function validate(document, options, optionalCallback) {
		options = options || {};
		var errors = [];
		var doPruneReadOnlyFields = !options || options.removeReadOnlyFields !== false; // remove readonly fields from the object, default: true
		if (doPruneReadOnlyFields) {
			readOnlyDocumentProner(document);
		}
		var doPruneEmptyFields = !options || options.removeEmptyFields !== false; // remove empty fields (null, "" and undefined) from the object, default: true
		if (doPruneEmptyFields) {
			emptyFieldsPrumer.prune(document);
		}
		var doDecimalsValidation = !options || options.decimalsValidation !== false; // cut off remaining decimals, default: true
		if (doDecimalsValidation) {
			maxDecimalHandler(document);
		}
		var doStringFormatValidation = !options || options.stringFormatValidation !== false;
		if (doStringFormatValidation) {
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
