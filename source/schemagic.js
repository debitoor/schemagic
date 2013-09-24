delete require.cache[__filename]; //do not cache in require cache
var getSchemasDirectory = require("./util/getSchemasDirectory");
var readRawSchemas = require("./util/readRawSchemas");
var schemaFactory = require("./util/schemaFactory");
var getSchemaFromObject = require("./util/getSchemaFromObject");
var cache = require("./util/cache"); //use requires caching to have a singleton
var path = require("path");
var cloneDeep = require("lodash.clonedeep");
var traverse = require("traverse");


function schemagicInit() {
	var startDir = path.dirname(module.parent.filename);
	var schemasDirectory;
	if(cache.schemaDirectories[startDir]){
		schemasDirectory = cache.schemaDirectories[startDir];
	} else {
		schemasDirectory = getSchemasDirectory(startDir);
		cache.schemaDirectories[startDir] = schemasDirectory;
	}
	if(cache.schemagics[schemasDirectory]){
		return cache.schemagics[schemasDirectory];
	}
	var rawSchemas = readRawSchemas(schemasDirectory);
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
	var foreignKeys = {};
	if(rawSchemas.foreignKeys){
		foreignKeys = rawSchemas.foreignKeys;
		delete rawSchemas.foreignKeys;
	}
	Object.keys(rawSchemas).forEach(function (schemaName) {
		schemagic[schemaName] = schemaFactory(rawSchemas[schemaName], foreignKeys);
		var rawPatchSchema = cloneDeep(rawSchemas[schemaName]);
		traverse(rawPatchSchema).forEach(function () {
			if(this.key === "required"){
				this.update(false);
			}
		});
		schemagic[schemaName].allOptional = schemaFactory(rawPatchSchema, foreignKeys);
	});
	cache.schemagics[schemasDirectory] = schemagic;
	return schemagic;
}

module.exports = schemagicInit();
