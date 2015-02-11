var path = require('path');
var fs = require('fs');
var existsSync = fs.existsSync || path.existsSync;
var DIR_NAME = 'schemas';

module.exports = function getSchemasDirectory(startDir) {
	var dir = startDir;
	var lastDir;
	while (lastDir !== dir) {
		if (existsSync(path.join(dir, DIR_NAME))) {
			return path.join(dir, DIR_NAME);
		}
		lastDir = dir;
		dir = path.join(dir, '..');
	}
	return false;
};