var rawSchemas = require("./util/readRawSchemas");
var schemaFactory = require("./util/schemaFactory");
var getSchemaFromObject = require("./util/getSchemaFromObject");

function schemagicInit() {
	var schemagic = {};
	Object.defineProperty(
		schemagic,
		"getSchemaFromObject",
		{
			enumerable: false,
			configurable: false,
			writable: false,
			value: getSchemaFromObject
		}
	); //schemagic.getSchemaFromObject is not enumerable
	Object.keys(rawSchemas).forEach(function (schemaName) {
		schemagic[schemaName] = schemaFactory(rawSchemas[schemaName]);
	});
	return schemagic;
}

module.exports = schemagicInit();