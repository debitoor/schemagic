var path = require('path');
var getSchemasDirectory = require('../../getSchemasDirectory');

describe('/source/util/getSchemasDirectory', function(){
	describe('when it thinks it is in /test/integration/schemas/tmp/tmp', function(){
		var dir;
		before(function(){
			dir = getSchemasDirectory(path.join(__dirname, 'schemas/tmp/tmp'));
		});

		it('will check parent directory and read the schemas from /test/integration/schemas', function(){
			expect(dir).to.eql(path.join(__dirname, 'schemas'));
		});
	});

	describe('when it thinks it is in /test/integration/schemas/tmp/', function(){
		var dir;
		before(function(){
			dir = getSchemasDirectory(path.join(__dirname, 'schemas/tmp'));
		});

		it('will read the schemas from /test/integration/schemas', function(){
			expect(dir).to.eql(path.join(__dirname, 'schemas'));
		});
	});

});