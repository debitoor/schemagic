function getSchemaFromObject(o, optionalName) {
	const schema = {};
	schema.description = 'TODO: Add description';
	if(optionalName){
		schema.description += ' for: ' + optionalName;
	}
	schema.required = true;
	if (Object.prototype.toString.call(o) === '[object Array]') {
		schema.type = 'array';
		if(o.length>0){
			schema.items = getSchemaFromObject(o[0]);
		}
	} else {
		schema.type = typeof o;
		if (typeof o === 'object') {
			const properties = {};
			let addedProperties;
			for(let propertyName in o) {
				const p = getSchemaFromObject(o[propertyName], propertyName);
				properties[propertyName] = p;
				addedProperties = true;
			}
			if (addedProperties) {
				schema.properties = properties;
			}
		}
	}
	return schema;
}

module.exports = getSchemaFromObject;