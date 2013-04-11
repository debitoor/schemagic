var jsonSchema = require("json-schema");
var readOnlyDocumentPrunerFactory = require("./readOnlyDocumentPruner");
var maxDecimalHandlerFactory = require("./maxDecimalHandler");
var exampleJson = require("./exampleJson");
var emptyFieldsPrumer = require("./emptyFieldsPrumer");

function schemaFactory(rawSchema) {

	var readOnlyDocumentProner = readOnlyDocumentPrunerFactory(rawSchema);
	var maxDecimalHandler = maxDecimalHandlerFactory(rawSchema);

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

	return {
		validate:validate,
		schema:rawSchema,
		exampleJson: exampleJson(rawSchema),
		exampleJsonArray: exampleJson(rawSchema, {asArray:true})
	};
}

module.exports = schemaFactory;
