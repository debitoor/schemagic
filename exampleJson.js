//Generate example JSONs for schemas
//Examples are strings (so they can contain comments)
var formats = require('./formats');


/*** BEGIN output class that encapsulated indentation ***/
var output = {
	addLine:function (line) {
		if (this.value.length > 0) {
			this.value += '\n'; //add linechange
		}
		this.addIndentedText(line);
	},
	indent:function () {
		var array = [];
		for (var i = 0; i < this.indentation; i++) {
			array.push('    ');
		}
		this.value += array.join('');
	},
	addIndentedText:function (text) {
		this.indent();
		this.value += text;
	},
	addText:function (text) {
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

function generateExampleJson(schema, output) {
	var type = schema.type, allowNull = false;
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
			return generateObjectJson(schema, output);
		case 'string':
			if (schema.example) {
				return output.addText(JSON.stringify(schema.example));
			}
			return output.addText('"value"');
		case 'number':
		case 'integer':
			if (schema.example) {
				return output.addText(schema.example);
			}
			return output.addText('1');
		case 'boolean':
			if (schema.example) {
				return output.addText(schema.example);
			}
			return output.addText('false');
		case 'array':
			return generateArrayJson(schema, output);
		default:
			throw new Error('unknown type: ' + JSON.stringify(type));
	}
}

function getAllowsNull(schema) {
	var type = schema.type, allowNull = false;
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
		output.addLine('//' + schema.description);
	}
	var doc;
	if (schema.required) {
		doc = '//Required';
	} else {
		doc = '//Optional';
	}
	if (allowNull) {
		doc += ', can be null';
	}
	if(schema.format && formats[schema.format] && formats[schema.format].doc){
		doc += '. ' + formats[schema.format].doc;
	}
	output.addLine(doc);
	if (schema.readonly) {
		output.addLine('//Read only (will be ignored on POST and PUT)');
	}
}

function generateObjectJson(schema, output) {
	output.addText('{');
	output.indentation++;

	var comma = '';
	for (var property in schema.properties) {
		var propertySchema = schema.properties[property];
		output.addText(comma);
		addIntro(propertySchema, output);
		output.addLine(property + ':');
		generateExampleJson(propertySchema, output);
		comma = ',';
	}

	output.indentation--;
	output.addLine('}');
}

function generateArrayJson(schema, output) {
	output.addText('[');
	output.indentation++;

	var propertySchema = schema.items;
	addIntro(propertySchema, output);
	output.addLine('');
	generateExampleJson(propertySchema, output);

	output.indentation--;
	output.addLine(']');
}

module.exports = function (schema, options) {
	var asArray = options && options.asArray;
	var output = createOutput(0);
	if (asArray) {
		output.addLine('//Array');
		output.addLine('[');
		output.indentation++;
	}
	if (schema.description) {
		output.addLine('//' + schema.description + '\n'); //we need linebreak becaus object (top level in schema) does not insert linebreak
		output.indent();
	}
	generateExampleJson(schema, output);
	if (asArray) {
		output.addLine(', ...');
		output.indentation--;
		output.addLine(']');
	}
	return output.value;
};