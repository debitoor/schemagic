module.exports = function parseExampleJson(example){
	if(typeof example !== 'string'){
		throw new Error('Schemagic: Example JSON must be a string');
	}
	const noComments = example.replace(/^(?: )*\/\/.*$/gm, '').replace(/\n/g,' ');
	try {
		const o = new Function('return ' + noComments)();
		if(['string', 'object', 'number'].indexOf(typeof o) === -1){
			throw new Error('(wrong type returned from parsing)');
		}
		return o;
	} catch (ex){
		ex.message = 'Schemagic: Could not parse example JSON. ' + ex.message;
		throw ex;
	}
};
