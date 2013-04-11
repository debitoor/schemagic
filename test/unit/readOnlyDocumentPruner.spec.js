var schemas = require("../exampleSchemas");
var readOnlyDocumentPruner = require('./../../source/util/readOnlyDocumentPruner.js');

describe('source/util/readOnlyDocumentPruner', function () {

	describe('getDefinition', function () {

		it('will fail if root schema is not an object', function (done) {
			try {
				readOnlyDocumentPruner.getDefinition(schemas.emptySchema);
				done(new Error('Exception expected'));
			} catch (ex) {
				done();
			}
		});

		it('will get empty processDefinition if no read only fields', function () {
			var processDefinition = readOnlyDocumentPruner.getDefinition(schemas.noReadOnlySchema);
			expect(processDefinition).to.eql([]);
		});

		it('can get the process definition for a simple json schema', function () {
			var processDefinition = readOnlyDocumentPruner.getDefinition(schemas.simpleSchema);
			expect(processDefinition).to.eql([
				{path:['b'], data: true},
				{path:['d'], data: true}]);
		});

		it('can get the process definition for a nested json schema', function () {
			var processDefinition = readOnlyDocumentPruner.getDefinition(schemas.nestedSchema);
			expect(processDefinition).to.eql([
				{path:['b','d'], data: true},
				{path:['c'], data: true}]);
		});

		it('can get the process definition for a array read only items json schema', function () {
			var processDefinition = readOnlyDocumentPruner.getDefinition(schemas.arrayReadOnlyItemsSchema);
			expect(processDefinition).to.eql([
				{path:['b'], data: true},
				{path:['c'], data: true}]);
		});

		it('can get the process definition for a array json schema', function () {
			var processDefinition = readOnlyDocumentPruner.getDefinition(schemas.arraySchema);
			expect(processDefinition).to.eql([
				{path:['b','d'], data: true},
				{path:['c'], data: true}]);
		});

		it('can get the process definition for a array and nested json schema', function () {
			var processDefinition = readOnlyDocumentPruner.getDefinition(schemas.arrayNestedSchema);
			expect(processDefinition).to.eql([
				{path:['a','b','c'], data: true}]);
		});

		it('can get the process definition for an array at root level', function () {
			var processDefinition = readOnlyDocumentPruner.getDefinition(schemas.arrayAtRootSchema);
			expect(processDefinition).to.eql([
				{path:['id'], data: true}]);
		});
	});

	describe('process', function () {

		it('will not process object if empty processDefinition', function () {
			var document = { a: 1, b: 2, c: 3, d: 4 };
			readOnlyDocumentPruner.process(document, []);
			expect(document).to.eql({ a: 1, b: 2, c: 3, d: 4 });
		});

		it('will process simple object', function () {
			var document = { a: 1, b: 2, c: 3, d: 4 };
			readOnlyDocumentPruner.process(document,[
				{path:['b'], data: true},
				{path:['d'], data: true}]);
			expect(document).to.eql({ a: 1, c: 3 });
		});

		it('will process nested object', function () {
			var document = { a: 1, b: { d: 4, e: 5 }, c: 3 };
			readOnlyDocumentPruner.process(document, [
				{path:['b','d'], data: true},
				{path:['c'], data: true}]);
			expect(document).to.eql({ a: 1, b: { e: 5 } });
		});

		it('will process object with read only array items', function () {
			var document =  { a: 1, b: [{d: 4, e: 5}, {d: 6, e: 7}], c: 3 };
			readOnlyDocumentPruner.process(document, [
				{path:['b'], data: true},
				{path:['c'], data: true}]);
			expect(document).to.eql({ a: 1 });
		});

		it('will process object in array', function () {
			var document = { a: 1, b: [{d: 4, e: 5}, {d: 6, e: 7}], c: 3 };
			readOnlyDocumentPruner.process(document, [
				{path:['b','d'], data: true},
				{path:['c'], data: true}]);
			expect(document).to.eql({ a: 1, b: [{e: 5}, {e: 7}] });
		});

		it('will process object in nested array', function () {
			var document = { a: [{b: {c: 4, d: 5}}, {b: {c: 6, d: 7}}] };
			readOnlyDocumentPruner.process(document, [
				{path:['a','b','c'], data: true}]);
			expect(document).to.eql({ a: [{b: {d: 5}}, {b: {d: 7}}] });
		});

		it('will process object in nested array - combined test', function () {
			var document = { a: [{b: {c: 4, d: 5}}, {b: {c: 6, d: 7}}] };
			var processFunction = readOnlyDocumentPruner(schemas.arrayNestedSchema);
			processFunction(document);
			expect(document).to.eql({ a: [{b: {d: 5}}, {b: {d: 7}}] });
		});
	});
});