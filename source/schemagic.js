var readRawSchemas = require("./util/readRawSchemas");
var schemaFactory = require("./util/schemaFactory");
var getSchemaFromObject = require("./util/getSchemaFromObject");

function schemagicFactory(options) {
	var rawSchemas = readRawSchemas(options && options.dir);
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
	if(rawSchemas){
		Object.keys(rawSchemas).forEach(function (schemaName) {
			schemagic[schemaName] = schemaFactory(rawSchemas[schemaName]);
		});
	} else {

	}
	return schemagic;
}

module.exports = schemagicFactory;