var jsonSchema = require("json-schema");
var util = require('util');
var readOnlyDocumentPrunerFactory = require("./readOnlyDocumentPruner");
var maxDecimalHandlerFactory = require("./maxDecimalHandler");
var exampleJson = require("./exampleJson");
var emptyFieldsPrumer = require("./emptyFieldsPrumer");

function schemaFactory(rawSchema) {

	var readOnlyDocumentProner = readOnlyDocumentPrunerFactory(rawSchema);
	var maxDecimalHandler = maxDecimalHandlerFactory(rawSchema);
	var normalizedJSON;

	function validate(document, options) {
		var doPruneReadOnlyFields = !options || options.removeReadOnlyFields !== false; // remove readonly fields from the object, default: true
		if(doPruneReadOnlyFields){
			readOnlyDocumentProner(document);
		}
		var doPruneEmptyFields = !options || options.removeEmptyFields !== false; // remove empty fields (null, "" and undefined) from the object, default: true
		if (doPruneEmptyFields) {
			emptyFieldsPrumer.prune(document);
		}
		var doDecimalsValidation = !options || options.doDecimalsValidation !== false; // remove readonly fields from the object, default: true
		if (doDecimalsValidation) {
			maxDecimalHandler(document);
		}
		return jsonSchema.validate(document, rawSchema);
	}
	function toJSON() {
		normalizedJSON = normalizedJSON || JSON.parse(JSON.stringify(rawSchema, function(key, val) {
			return util.isRegExp(val) ? val.source : val;
		}));
		return normalizedJSON;
	}

	return {
		validate:validate,
		schema:rawSchema,
		exampleJson: exampleJson(rawSchema),
		exampleJsonArray: exampleJson(rawSchema, {asArray:true}),
		toJSON: toJSON
	};
}

module.exports = schemaFactory;
