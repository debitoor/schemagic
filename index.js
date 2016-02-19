delete require.cache[__filename]; //do not cache in require cache
var getSchemasDirectory = require('./getSchemasDirectory');
var readRawSchemas = require('./readRawSchemas');
var schemaFactory = require('./schemaFactory');
var getSchemaFromObject = require('./getSchemaFromObject');
var cache = require('./cache'); //use requires caching to have a singleton
var path = require('path');
var clone = require('clone');
var traverse = require('traverse');


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
		'getSchemaFromObject',
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
		var schemaForeignKeys = getSchemaForeignKeys(schemaName, foreignKeys);
		schemagic[schemaName] = schemaFactory(rawSchemas[schemaName], schemaForeignKeys);
		var rawPatchSchema = clone(rawSchemas[schemaName]);
		var t = traverse(rawPatchSchema);
		t.forEach(function (value) {
			//make sure null is allowed for all non-required properties
			if (this.key === 'type' && this.path.length >= 3 && this.path[this.path.length - 3] === 'properties') {
				var required = t.get([].concat(this.parent.path, ['required']));
				if (required === false) {
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
		t.forEach(function () {
			if (this.key === 'required' && this.path.length >= 3 && this.path[this.path.length - 3] === 'properties') {
				this.update(false);
			}
		});
		schemagic[schemaName].patch = schemaFactory(rawPatchSchema, schemaForeignKeys);
		var rawArraySchema = {
			"required": true,
			"type": 'array',
			"items": clone(rawSchemas[schemaName])
		};
		schemagic[schemaName].array = schemaFactory(rawArraySchema, schemaForeignKeys);
	});
	cache.schemagics[schemasDirectory] = schemagic;
	return schemagic;
}

function getSchemaForeignKeys(schemaName, foreignKeys) {
	return Object.keys(foreignKeys).reduce(function (memo, key) {
		var keyParts = key.split('.');
		if (keyParts.length === 1) {
			memo[key] = foreignKeys[key];
		} else {
			var keySchemaName = keyParts.slice(0, keyParts.length - 1).join('.');
			if (keySchemaName === schemaName) {
				memo[keyParts.pop()] = foreignKeys[key];
			}
		}
		return memo;
	}, {});
}

module.exports = schemagicInit();
