//Generate example JSONs for schemas
//Examples are strings (so they can contain comments)
var wordWrap = require('word-wrap');
var formats = require('./formats');
var isProperty = require('is-property');

/*** BEGIN output class that encapsulated indentation ***/
var output = {
	addLine: function (line) {
		if (this.value.length > 0) {
			this.value += '\n'; //add linechange
		}
		this.addIndentedText(line);
	},
	indent: function () {
		var array = [];
		for (var i = 0; i < this.indentation; i++) {
			array.push('    ');
		}
		this.value += array.join('');
	},
	addIndentedText: function (text) {
		this.indent();
		this.value += text;
	},
	addText: function (text) {
		this.value += text;
	}
};

function createOutput(indentation) {
	var newOutput = Object.create(output);
	newOutput.indentation = indentation;
	newOutput.value = '';
	return newOutput;
}
/*** END output class that encapsulated indentation ***/

function generateExampleJson(schema, minimal, noReadOnly, output) {
	var type = schema.type;
	if (Array.isArray(type)) {
		if (type.length === 0) {
			throw new Error('type is array with length=0: ' + JSON.stringify(type));
		}
		for (var i = 0; i < type.length; i++) {
			if (type[i] !== 'null') {
				type = type[i];
				break; //exit for
			}
		}

	}
	if (typeof type !== 'string') {
		throw new Error('type is not a string: ' + JSON.stringify(type));
	}

	switch (type) {
		case 'object':
			return generateObjectJson(schema, minimal, noReadOnly, output);
		case 'string':
			if (typeof schema.example === 'string') {
				return output.addText(JSON.stringify(schema.example));
			}
			return output.addText('"value"');
		case 'url':
			if (typeof schema.example === 'string') {
				return output.addText(JSON.stringify(schema.example));
			}
			return output.addText('"http://my-domain.com/my-endpoint"');
		case 'number':
		case 'integer':
			if (typeof schema.example === 'number') {
				return output.addText(schema.example);
			}
			return output.addText('1');
		case 'boolean':
			if (typeof schema.example === 'boolean') {
				return output.addText(schema.example);
			}
			return output.addText('false');
		case 'array':
			return generateArrayJson(schema, minimal, noReadOnly, output);
		default:
			throw new Error('unknown type: ' + JSON.stringify(type));
	}
}

function getAllowsNull(schema) {
	var type = schema.type;
	if (Array.isArray(type)) {
		for (var i = 0; i < type.length; i++) {
			if (type[i] === 'null') {
				return true;
			}
		}
	}
	return false;
}

function addIntro(schema, output) {
	var allowNull = getAllowsNull(schema);
	if (schema.description) {
		var lines = wordWrap(schema.description, {width: 80, indent: '//'}).split('\n');
		lines.forEach(output.addLine.bind(output));
	}
	var doc;
	if (schema.readonly) {
		output.addLine('//Read only. You do not need this on POST, PUT and PATCH. You can leave it in from what you GET, it will simply be ignored.');
	} else {
		if (schema.required) {
			doc = '//Required';
		} else {
			doc = '//Optional';
		}
		if (allowNull) {
			doc += ', can be null';
		}
		output.addLine(doc);
	}
	if (schema.format) {
		doc = '//Format: ' + schema.format;
		if (formats[schema.format] && formats[schema.format].doc) {
			doc += '. ' + formats[schema.format].doc;
		}
		output.addLine(doc);
	}
}

function generateObjectJson(schema, minimal, noReadOnly, output) {
	output.addText('{');
	output.indentation++;

	var comma = '';
	for (var property in schema.properties) {
		if (minimal && !schema.properties[property].required && !schema.properties[property].minimal) {
			continue;
		}
		if (noReadOnly && schema.properties[property].readonly) {
			continue;
		}
		if (schema.properties[property].hidden) {
			continue;
		}
		var propertySchema = schema.properties[property];
		output.addText(comma);
		addIntro(propertySchema, output);
		output.addLine(encodeProperty(property) + ':');
		generateExampleJson(propertySchema, minimal, noReadOnly, output);
		comma = ',';
	}

	output.indentation--;
	output.addLine('}');
}

function encodeProperty(property) {
	return isProperty(property) ? property : JSON.stringify(property);
}

function generateArrayJson(schema, minimal, noReadOnly, output) {
	if (minimal && !schema.required && !schema.minimal) {
		return;
	}
	if (noReadOnly && schema.readonly) {
		return;
	}
	if (minimal && !schema.items.required && !schema.items.minimal) {
		output.addText('[]');
		return;
	}
	output.addText('[');
	output.indentation++;

	var propertySchema = schema.items;
	addIntro(propertySchema, output);
	output.addLine('');
	generateExampleJson(propertySchema, minimal, noReadOnly, output);
	output.addLine('//, ...');
	output.addLine('//Any additional items in this array go here.');
	output.indentation--;
	output.addLine(']');
}

module.exports = function (schema, options) {
	var asArray = options && options.asArray;
	var minimal = options && options.minimal;
	var noReadOnly = options && options.noReadOnly;
	var output = createOutput(0);
	if (asArray) {
		output.addLine('//Array');
		output.addLine('[');
		output.indentation++;
	}
	if (schema.description) {
		var lines = wordWrap(schema.description, {width: 80, indent: '//'}).split('\n');
		var lastLine = lines.pop();
		lines.forEach(output.addLine.bind(output));
		output.addLine(lastLine + '\n'); //we need linebreak because object (top level in schema) does not insert linebreak
		output.indent();
	}
	generateExampleJson(schema, minimal, noReadOnly, output);
	if (asArray) {
		output.addLine('//, ...');
		output.addLine('//Any additional items in this array go here.');
		output.indentation--;
		output.addLine(']');
	}
	return output.value;
};