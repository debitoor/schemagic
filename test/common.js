global.sinon = require('sinon');
var chai = require('chai');
chai.config.includeStack
global.chai = chai;
global.expect = chai.expect;
chai.use(require('sinon-chai'));
