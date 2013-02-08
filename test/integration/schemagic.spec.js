describe("/source/schemagic with valid example schemas injected", function () {
	var schemagic;

	describe("requiring schemagic here", function () {
		before(function () {
			schemagic = require("../../source/schemagic");
		});

		it("returns a schemagic object", function () {
			expect(schemagic).to.be.a("object");
		});

		it("has all the schemas as properties", function () {
			expect(schemagic).to.have.property("test");
		});

		it("has all the exact number og keys at there are schemas (schemagic.getSchemaFromObject is not enumerable)", function () {
			expect(Object.keys(schemagic)).to.have.property("length").to.equal(1);
		});

		it("has getSchemaFromObject as property", function () {
			expect(schemagic).to.have.property("getSchemaFromObject").to.be.a("function");
		});
	});

	describe("having required schemagic in test1 dir", function () {
		var schemagic1;
		before(function () {
			schemagic1 = require("./dirCacheTest/test1/requireSchemagic");
		});

		it("will have the test1 schema", function () {
			expect(schemagic1).to.have.property("test1");
		});

		it("will have only one schema", function () {
			expect(Object.keys(schemagic1)).to.have.property("length").to.equal(1);
		});

		describe("requiring it again ()", function(){
			var shcmemagic2;
			before(function(){
				//requireSchemagic is not cached in require cache
				shcmemagic2 = require("./dirCacheTest/test1/requireSchemagic");
			});

			it("will be the same instance", function () {
				expect(shcmemagic2).to.equal(schemagic1);
			});

		});
	});
	describe("having required schemagic in test2 dir", function () {
		var schemagic1;
		before(function () {
			schemagic1 = require("./dirCacheTest/test2/requireSchemagic");
		});

		it("will have the test2 schema", function () {
			expect(schemagic1).to.have.property("test2");
		});

		it("will have only one schema", function () {
			expect(Object.keys(schemagic1)).to.have.property("length").to.equal(1);
		});

		describe("requiring it from subdir", function(){
			var shcmemagic2;
			before(function(){
				shcmemagic2 = require("./dirCacheTest/test2/test2subdir/requireSchemagic");
			});

			it("will be the same instance", function () {
				expect(shcmemagic2).to.equal(schemagic1);
			});

		});
	});
});
