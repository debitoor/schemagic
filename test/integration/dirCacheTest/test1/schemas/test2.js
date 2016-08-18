module.exports = {
	type: 'array',
	items: {
		required: true,
		type: 'object',
		additionalProperties: false,
		properties: {
			id: {
				required: true,
				type: 'string'
			},
			name: {
				required: true,
				type: 'string'
			},
			balance: {
				required: true,
				type: 'number'
			},
			currency: {
				required: true,
				type: 'string'
			}
		}
	}
};
