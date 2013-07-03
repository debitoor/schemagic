var schemas = require("../exampleSchemas");
var stringFormatValidatorFactory = require('./../../source/util/stringFormatValidator.js');


describe('source/util/stringFormatValidator', function () {

	describe('getDefinition', function () {

		it('will fail if root schema is not an object', function (done) {
			try {
				stringFormatValidatorFactory.getDefinition(schemas.emptySchema);
				done(new Error('Exception expected'));
			} catch (ex) {
				done();
			}
		});

		it('will get empty definition if no read only fields', function () {
			var definition = stringFormatValidatorFactory.getDefinition(schemas.noStringFormatSchema);
			expect(definition).to.eql([]);
		});

		it('can get the definition for a simple json schema', function () {
			var definition = stringFormatValidatorFactory.getDefinition(schemas.simpleStringFormatSchema);
			expect(definition).to.eql([
				{path:['b'], data: {format: 'date'}},
				{path:['d'], data: {format: 'date'}}]);
		});

		it('can get the definition for a nested json schema', function () {
			var definition = stringFormatValidatorFactory.getDefinition(schemas.nestedStringFormatSchema);
			expect(definition).to.eql([
				{path:['b','d'], data: {format: 'date'}},
				{path:['c'], data: {format: 'date'}}]);
		});

		it('can get the definition for a array json schema', function () {
			var definition = stringFormatValidatorFactory.getDefinition(schemas.arrayStringFormatSchema);
			expect(definition).to.eql([
				{path:['b','d'], data: {format: 'date'}},
				{path:['c'], data: {format: 'date'}}]);
		});

		it('can get the definition for a array and nested json schema', function () {
			var definition = stringFormatValidatorFactory.getDefinition(schemas.arrayNestedStringFormatSchema);
			expect(definition).to.eql([
				{path:['a','b','c'], data: {format: 'date'}}
			]);
		});

		it('can get the definition for an array at root level', function () {
			var definition = stringFormatValidatorFactory.getDefinition(schemas.arrayAtRootStringFormatSchema);
			expect(definition).to.eql([
				{path:['a'], data: {format: 'date'}}
			]);
		});
	});

	describe('process', function () {
		var result, document;

		it('will not validate object if empty definition', function () {
			document = { a: '2013-01-00', b: '2013-01-00', c: '2013-01-00', d: '2013-01-00' };
			result = stringFormatValidatorFactory.process(document, []);
			expect(result.errors.length).to.equal(0);
		});

		it('will validate correct simple object', function () {
			document = { a: '2013-01-01', b: '2013-01-01', c: '2013-01-01', d: '2013-01-01' };
			result = stringFormatValidatorFactory.process(document, [
				{path:['b'], data: {format: 'date'}},
				{path:['d'], data: {format: 'date'}}]
			);
			expect(result.valid).to.equal(true);
			expect(result.errors.length).to.equal(0);
		});

		it('will validate invalid simple object', function () {
			document = { a: '2013-01-01', b: '2013-01-00', c: '2013-13-01', d: 'boo', e: '', f: '01-01-2013', g: '01-01-10000' };
			result = stringFormatValidatorFactory.process(document, [
				{path:['a'], data: {format: 'date'}},
				{path:['b'], data: {format: 'date'}},
				{path:['c'], data: {format: 'date'}},
				{path:['d'], data: {format: 'date'}},
				{path:['e'], data: {format: 'date'}},
				{path:['f'], data: {format: 'date'}},
				{path:['g'], data: {format: 'date'}}]
			);
			expect(result.valid).to.equal(false);
			expect(result.errors.length).to.equal(6);
		});

		it('will validate correct simple object with null', function () {
			document = { a: '2013-01-01', b: null, c: '2013-01-01', d: '2013-01-01' };
			result = stringFormatValidatorFactory.process(document, [
				{path:['b'], data: {format: 'date'}},
				{path:['d'], data: {format: 'date'}}]
			);
			expect(result.errors.length).to.equal(0);
		});

		it('will validate simple object with undefined', function () {
			document = { a: '2013-01-01', b: undefined, c: '2013-01-01', d: '2013-01-01' };
			result = stringFormatValidatorFactory.process(document, [
				{path:['b'], data: {format: 'date'}},
				{path:['d'], data: {format: 'date'}}]
			);
			expect(result.errors.length).to.equal(0);
		});

		it('will validate correct nested object', function () {
			document = { a: '2013-01-01', b: { d: '2013-01-01', e: '2013-01-01' }, c: '2013-01-01' };
			result = stringFormatValidatorFactory.process(document,[
				{path:['b','d'], data: {format: 'date'}},
				{path:['c'], data: {format: 'date'}}]);
			expect(result.errors.length).to.equal(0);
		});

		it('will validate invalid nested object', function () {
			document = { a: '2013-01-00', b: { d: '2013-01-00', e: '2013-01-00' }, c: '2013-01-00' };
			result = stringFormatValidatorFactory.process(document,[
				{path:['b','d'], data: {format: 'date'}},
				{path:['c'], data: {format: 'date'}}]);
			expect(result.errors.length).to.equal(2);
		});

		it('will validate correct object in array', function () {
			document =  { a: '2013-01-01', b: [{d: '2013-01-01', e: '2013-01-01'}, {d: '2013-01-01', e: '2013-01-01'}], c: '2013-01-01' };
			result = stringFormatValidatorFactory.process(document, [
				{path:['b','d'], data: {format: 'date'}},
				{path:['c'], data: {format: 'date'}}]);
			expect(result.errors.length).to.equal(0);
		});

		it('will validate invalid object in array', function () {
			document =  { a: '2013-01-00', b: [{d: '2013-01-00', e: '2013-01-00'}, {d: '2013-01-00', e: '2013-01-00'}], c: '2013-01-00' };
			result = stringFormatValidatorFactory.process(document, [
				{path:['b','d'], data: {format: 'date'}},
				{path:['c'], data: {format: 'date'}}]);
			expect(result.errors.length).to.equal(3);
		});
	});
});
