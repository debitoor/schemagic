const path = require('path');
const fs = require('fs');
const existsSync = fs.existsSync || path.existsSync;
const DIR_NAME = 'schemas';

module.exports = function getSchemasDirectory(startDir) {
	let dir = startDir;
	let lastDir;
	while (lastDir !== dir) {
		if (existsSync(path.join(dir, DIR_NAME))) {
			return path.join(dir, DIR_NAME);
		}
		lastDir = dir;
		dir = path.join(dir, '..');
	}
	return false;
};