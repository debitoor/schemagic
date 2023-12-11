const path = require('path');
const readRawSchemas = require('../../lib/readRawSchemas');

describe('/source/util/redRawSchemas', function() {
	describe('will read schema', function() {
		let schemas;
		before(function() {
			schemas = readRawSchemas(path.join(__dirname, 'schemas'));
		});

		it('reads the test schema', function(){
			expect(schemas).to.eql({
				test: require('./schemas/test'),
				'test.it': require('./schemas/test.it'),
				test2: require('./schemas/test2'),
				'test3.with.dot': require('./schemas/test3.with.dot'),
				foreignKeys: require('./schemas/foreignKeys')
			});
		});
	});
});