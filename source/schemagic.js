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
	if (cache.schemaDirectories[startDir]) {
		schemasDirectory = cache.schemaDirectories[startDir];
	} else {
		schemasDirectory = getSchemasDirectory(startDir);
		cache.schemaDirectories[startDir] = schemasDirectory;
	}
	if (cache.schemagics[schemasDirectory]) {
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
	if (rawSchemas.foreignKeys) {
		foreignKeys = rawSchemas.foreignKeys;
		delete rawSchemas.foreignKeys;
	}
	Object.keys(rawSchemas).forEach(function (schemaName) {
		schemagic[schemaName] = schemaFactory(rawSchemas[schemaName], foreignKeys);
		var rawPatchSchema = cloneDeep(rawSchemas[schemaName]);
		var t = traverse(rawPatchSchema);
		t.forEach(function (value) {
			if (this.key === "required" && this.path.length>=3 && this.path[this.path.length-3] === 'properties') {
				this.update(false);
			}
			//make sure null is allowed for all object properties
			if (this.key === 'type' && this.path.length>=3 && this.path[this.path.length-3] === 'properties') {
				var required = t.get([].concat(this.parent.path, 'required'));
				if(required === false){
				var type = value;
				if (!Array.isArray(type)) {
					type = [type];
				}
				if (type.indexOf('null') === -1) {
					console.warn('WARNING in schema: "' + schemaName + '": ' + this.parent.path.join('.') + ' is not required, but null is not allowed (allowing null)');
					type.push('null');
				}
				this.update(type);
				}
			}
		});
		schemagic[schemaName].patch = schemaFactory(rawPatchSchema, foreignKeys);
	});
	cache.schemagics[schemasDirectory] = schemagic;
	return schemagic;
}

module.exports = schemagicInit();
