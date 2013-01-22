var rawSchemas = require("./util/readRawSchemas");
var schemaFactory = require("./util/schemaFactory");
var getSchemaFromObject = require("./util/getSchemaFromObject");

function schemagicInit() {
	var schemagic = {
		getSchemaFromObject:getSchemaFromObject
	};
	Object.keys(rawSchemas).forEach(function (schemaName) {
		schemagic[schemaName] = schemaFactory(rawSchemas[schemaName]);
	});
	return schemagic;
}

module.exports = schemagicInit();