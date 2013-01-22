var jsonSchema = require("json-schema");
var readOnlyDocumentPruner = require("./readOnlyDocumentPruner");
var exampleJson = require("./exampleJson");

function schemaFactory(rawSchema) {

	var prune = readOnlyDocumentPruner(rawSchema);

	function validate(document, options) {
		var doPruning = !options || options.prune !== false; //unless options.prune===false, we do pruning
		if(doPruning){
			prune(document);
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
