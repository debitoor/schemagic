"use strict";

var emptyStringsToNullFactory = require("./../../source/util/emptyStringsToNullFactory.js");
var util = require('util');
var _ = require("underscore");

describe('emptyStringsToNullFactory.js', function() {

	var result, document;

	describe('when call toNull,', function() {

		describe('when simple type,', function () {

			describe('when is empty string,', function() {

				beforeEach(function (done) {
					document = "";
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return null', function() {
					expect(result).to.equal(null);
				});
			});

			describe('when is not empty string,', function() {

				beforeEach(function (done) {
					document = "abc";
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return string', function() {
					expect(result).to.equal("abc");
				});
			});

			describe('when is number,', function() {

				beforeEach(function (done) {
					document = 1;
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return simple type', function() {
					expect(result).to.equal(1);
				});
			});
		});

		describe('when simple object,', function () {

			describe('when is empty,', function() {

				beforeEach(function (done) {
					document = {};
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return empty', function() {
					expect(result).to.eql({});
				});
			});

			describe('when field is 0,', function() {

				beforeEach(function (done) {
					document = {a: 0};
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return empty', function() {
					expect(result).to.eql({a: 0});
				});
			});

			describe('when is with empty strings,', function() {

				beforeEach(function (done) {
					document = {a: 1, b: 'a', c: null, d: "", f: undefined};
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return simple object with nulls', function() {
					expect(result).to.eql({a: 1, b: 'a', c: null, d: null, f: undefined});
				});
			});

			describe('when is Date,', function() {

				beforeEach(function (done) {
					document = new Date('1-1-2010');
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return date', function() {
					expect(result).to.eql(new Date('1-1-2010'));
				});
			});

		});

		describe('when nested object,', function () {

			describe('when without null,', function() {

				beforeEach(function (done) {
					document = {a: 1, b: 'a', c: {a: 1, b: 'a'}};
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return object', function() {
					expect(result).to.eql({a: 1, b: 'a', c: {a: 1, b: 'a'}});
				});
			});

			describe('when with empty string,', function() {

				beforeEach(function (done) {
					document = {a: 1, b: 'a', c: null, d: "", f: undefined, g: {h: 1, i: 'a', j: null, k: "", l: undefined}};
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return object without null', function() {
					expect(result).to.eql({a: 1, b: 'a', c: null, d: null, f: undefined, g: {h: 1, i: 'a', j: null, k: null, l: undefined}});
				});
			});
		});

		describe('when simple array,', function () {

			describe('when is empty,', function() {

				beforeEach(function (done) {
					document = [];
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return empty', function() {
					expect(result).to.eql([]);
				});

			});

			describe('when element is 0,', function() {

				beforeEach(function (done) {
					document = [0];
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return empty', function() {
					expect(result).to.eql([0]);
				});

			});

			describe('when without null,', function() {

				beforeEach(function (done) {
					document = [1, {}, []];
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return array', function() {
					expect(result).to.eql([1, {}, []]);
				});
			});

			describe('when with emptu string,', function() {

				beforeEach(function (done) {
					document = [1, {}, [], null, undefined, ""];
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should remove null values', function() {
					expect(result).to.eql([1, {}, [], null, undefined, null]);
				});
			});
		});

		describe('when nested mixed array and object,', function () {

			describe('when without null,', function() {

				beforeEach(function (done) {
					document = [{a: [1]}, [2, {b: 3}]];
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should return array', function() {
					expect(result).to.eql([{a: [1]}, [2, {b: 3}]]);
				});
			});

			describe('when with null,', function() {

				beforeEach(function (done) {
					document = [{a: [1, undefined], b: ""}, [2, {c: 3, d: undefined}, ""], null];
					done();
				});

				beforeEach(function (done) {
					result = emptyStringsToNullFactory.toNull(document);
					done();
				});

				it('should remove null values', function() {
					expect(result).to.eql([{a: [1, undefined], b: null}, [2, {c: 3, d: undefined}, null], null]);
				});
			});
		});
	});
});