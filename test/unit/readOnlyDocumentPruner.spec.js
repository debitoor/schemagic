var schemas = require("../exampleSchemas");
var readOnlyDocumentPruner = require('./../../source/util/readOnlyDocumentPruner.js');

describe('source/util/readOnlyDocumentPruner', function () {

	describe('getPruneDefinition', function () {

		it('will fail if root schema is not an object', function (done) {
			try {
				readOnlyDocumentPruner.getPruneDefinition(schemas.emptySchema);
				done(new Error('Exception expected'));
			} catch (ex) {
				done();
			}
		});

		it('will get empty pruneDefinition if no read only fields', function () {
			var pruneDefinition = readOnlyDocumentPruner.getPruneDefinition(schemas.noReadOnlySchema);
			expect(pruneDefinition).to.eql([]);
		});

		it('can get the prune definition for a simple json schema', function () {
			var pruneDefinition = readOnlyDocumentPruner.getPruneDefinition(schemas.simpleSchema);
			expect(pruneDefinition).to.eql([['b'],['d']]);
		});

		it('can get the prune definition for a nested json schema', function () {
			var pruneDefinition = readOnlyDocumentPruner.getPruneDefinition(schemas.nestedSchema);
			expect(pruneDefinition).to.eql([['b','d'],['c']]);
		});

		it('can get the prune definition for a array read only items json schema', function () {
			var pruneDefinition = readOnlyDocumentPruner.getPruneDefinition(schemas.arrayReadOnlyItemsSchema);
			expect(pruneDefinition).to.eql([['b'],['c']]);
		});

		it('can get the prune definition for a array json schema', function () {
			var pruneDefinition = readOnlyDocumentPruner.getPruneDefinition(schemas.arraySchema);
			expect(pruneDefinition).to.eql([['b','d'],['c']]);
		});

		it('can get the prune definition for a array and nested json schema', function () {
			var pruneDefinition = readOnlyDocumentPruner.getPruneDefinition(schemas.arrayNestedSchema);
			expect(pruneDefinition).to.eql([['a','b','c']]);
		});

		it('can get the prune definition for an array at root level', function () {
			var pruneDefinition = readOnlyDocumentPruner.getPruneDefinition(schemas.arrayAtRootSchema);
			expect(pruneDefinition).to.eql([['id']]);
		});
	});

	describe('prune', function () {

		it('will not prune object if empty pruneDefinition', function () {
			var document = { a: 1, b: 2, c: 3, d: 4 };
			readOnlyDocumentPruner.prune(document, []);
			expect(document).to.eql({ a: 1, b: 2, c: 3, d: 4 });
		});

		it('will prune simple object', function () {
			var document = { a: 1, b: 2, c: 3, d: 4 };
			readOnlyDocumentPruner.prune(document, [['b'],['d']]);
			expect(document).to.eql({ a: 1, c: 3 });
		});

		it('will prune nested object', function () {
			var document = { a: 1, b: { d: 4, e: 5 }, c: 3 };
			readOnlyDocumentPruner.prune(document, [['b','d'],['c']]);
			expect(document).to.eql({ a: 1, b: { e: 5 } });
		});

		it('will prune object with read only array items', function () {
			var document =  { a: 1, b: [{d: 4, e: 5}, {d: 6, e: 7}], c: 3 };
			readOnlyDocumentPruner.prune(document, [['b'],['c']]);
			expect(document).to.eql({ a: 1 });
		});

		it('will prune object in array', function () {
			var document = { a: 1, b: [{d: 4, e: 5}, {d: 6, e: 7}], c: 3 };
			readOnlyDocumentPruner.prune(document, [['b','d'],['c']]);
			expect(document).to.eql({ a: 1, b: [{e: 5}, {e: 7}] });
		});

		it('will prune object in nested array', function () {
			var document = { a: [{b: {c: 4, d: 5}}, {b: {c: 6, d: 7}}] };
			readOnlyDocumentPruner.prune(document, [['a','b','c']]);
			expect(document).to.eql({ a: [{b: {d: 5}}, {b: {d: 7}}] });
		});

		it('will prune object in nested array - combined test', function () {
			var document = { a: [{b: {c: 4, d: 5}}, {b: {c: 6, d: 7}}] };
			var pruneFunction = readOnlyDocumentPruner(schemas.arrayNestedSchema);
			pruneFunction(document);
			expect(document).to.eql({ a: [{b: {d: 5}}, {b: {d: 7}}] });
		});
	});
});