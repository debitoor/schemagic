var schemas = require("../exampleSchemas");
var maxDecimalHandler = require('./../../source/util/maxDecimalHandler.js');

describe('source/util/maxDecimalHandler', function () {

	describe('getDefinition', function () {

		it('will not fails if no properties of root object', function () {
			var definition = maxDecimalHandler.getDefinition(schemas.schemaRootObjectWithoutPropertiesSchema);
			expect(definition).to.eql([]);
		});

		it('will not fails if no properties of an object', function () {
			var definition = maxDecimalHandler.getDefinition(schemas.schemaObjectWithoutPropertiesSchema);
			expect(definition).to.eql([]);
		});
	});

	describe('getDefinition', function () {

		it('will fail if root schema is not an object', function (done) {
			try {
				maxDecimalHandler.getDefinition(schemas.emptySchema);
				done(new Error('Exception expected'));
			} catch (ex) {
				done();
			}
		});

		it('will get empty definition if no read only fields', function () {
			var definition = maxDecimalHandler.getDefinition(schemas.noDecimalSchema);
			expect(definition).to.eql([]);
		});

		it('can get the definition for a simple json schema', function () {
			var definition = maxDecimalHandler.getDefinition(schemas.simpleDecimalSchema);
			expect(definition).to.eql([
				{path:['b'], data: {maxDecimal: 2}},
				{path:['d'], data: {maxDecimal: 3}}]);
		});

		it('can get the definition for a nested json schema', function () {
			var definition = maxDecimalHandler.getDefinition(schemas.nestedDecimalSchema);
			expect(definition).to.eql([
				{path:['b','d'], data: {maxDecimal: 2}},
				{path:['c'], data: {maxDecimal: 3}}]);
		});

		it('can get the definition for a array json schema', function () {
			var definition = maxDecimalHandler.getDefinition(schemas.arrayDecimalSchema);
			expect(definition).to.eql([
				{path:['b','d'], data: {maxDecimal: 2}},
				{path:['c'], data: {maxDecimal: 3}}]);
		});

		it('can get the definition for a array and nested json schema', function () {
			var definition = maxDecimalHandler.getDefinition(schemas.arrayNestedDecimalSchema);
			expect(definition).to.eql([
				{path:['a','b','c'], data: {maxDecimal: 2}}
			]);
		});

		it('can get the definition for an array at root level', function () {
			var definition = maxDecimalHandler.getDefinition(schemas.arrayAtRootDecimalSchema);
			expect(definition).to.eql([
				{path:['a'], data: {maxDecimal: 2}}
			]);
		});
	});

	describe('process', function () {

		it('will not process object if empty definition', function () {
			var document = { a: 1.2345, b: 1.2345, c: 1.2345, d: 1.2345 };
			maxDecimalHandler.process(document, []);
			expect(document).to.eql({ a: 1.2345, b: 1.2345, c: 1.2345, d: 1.2345 });
		});

		it('will process simple object', function () {
			var document = { a: 1.2345, b: 1.2345, c: 1.2345, d: 1.2345 };
			maxDecimalHandler.process(document, [
				{path:['b'], data: {maxDecimal: 2}},
				{path:['d'], data: {maxDecimal: 3}}]
			);
			expect(document).to.eql({ a: 1.2345, b: 1.23, c: 1.2345, d: 1.234 });
		});

		it('will process simple object with null', function () {
			var document = { a: 1.2345, b: null, c: 1.2345, d: 1.2345 };
			maxDecimalHandler.process(document, [
				{path:['b'], data: {maxDecimal: 2}},
				{path:['d'], data: {maxDecimal: 3}}]
			);
			expect(document).to.eql({ a: 1.2345, b: null, c: 1.2345, d: 1.234 });
		});

		it('will process simple object with undefined', function () {
			var document = { a: 1.2345, b: undefined, c: 1.2345, d: 1.2345 };
			maxDecimalHandler.process(document, [
				{path:['b'], data: {maxDecimal: 2}},
				{path:['d'], data: {maxDecimal: 3}}]
			);
			expect(document).to.eql({ a: 1.2345, b: undefined, c: 1.2345, d: 1.234 });
		});

		it('will process simple object with string', function () {
			var document = { a: 1.2345, b: '20', c: 1.2345, d: 1.2345 };
			maxDecimalHandler.process(document, [
				{path:['b'], data: {maxDecimal: 2}},
				{path:['d'], data: {maxDecimal: 3}}]
			);
			expect(document).to.eql({ a: 1.2345, b: '20', c: 1.2345, d: 1.234 });
		});

		it('will process nested object', function () {
			var document = { a: 1.2345, b: { d: 1.2345, e: 1.2345 }, c: 1.2345 };
			maxDecimalHandler.process(document,[
				{path:['b','d'], data: {maxDecimal: 2}},
				{path:['c'], data: {maxDecimal: 3}}]);
			expect(document).to.eql({ a: 1.2345, b: { d: 1.23, e: 1.2345 }, c: 1.234 });
		});

		it('will process object in array', function () {
			var document =  { a: 1.2345, b: [{d: 1.2345, e: 1.2345}, {d: 1.2345, e: 1.2345}], c: 1.2345 };
			maxDecimalHandler.process(document, [
				{path:['b','d'], data: {maxDecimal: 2}},
				{path:['c'], data: {maxDecimal: 3}}]);
			expect(document).to.eql({ a: 1.2345, b: [{d: 1.23, e: 1.2345}, {d: 1.23, e: 1.2345}], c: 1.234 });
		});

		it('will process object in nested array', function () {
			var document = { a: [{b: {c: 1.2345, d: 1.2345}}, {b: {c: 1.2345, d: 1.2345}}] };
			maxDecimalHandler.process(document, [
				{path:['a','b','c'], data: {maxDecimal: 2}}
			]);
			expect(document).to.eql({ a: [{b: {c: 1.23, d: 1.2345}}, {b: {c: 1.23, d: 1.2345}}]});
		});

		it('will process object in nested array - combined test', function () {
			var document = { a: [{b: {c: 1.2345, d: 1.2345}}, {b: {c: 1.2345, d: 1.2345}}] };
			var processFunction = maxDecimalHandler(schemas.arrayNestedDecimalSchema);
			processFunction(document);
			expect(document).to.eql({ a: [{b: {c: 1.23, d: 1.2345}}, {b: {c: 1.23, d: 1.2345}}]});
		});
	});
});