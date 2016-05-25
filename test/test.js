var assert = require('chai').assert;
var walk = require('../index');
var fs = require('fs-extra');
var path = require('path');
var testDataSrc = path.resolve(__dirname, './data');


beforeEach(function(){
	fs.readdir(testDataSrc, function(err, list){
		if (err) {
			console.log(err);
		 return; 
		}

		if(list[0] == '.DS_Store')
    		list.splice(0,1);

		walk({
			src: path.resolve(__dirname, './data'),
			dest: path.resolve(__dirname, './assets.json')
		});
	});
});

describe('Hash created', function() {
	describe('assets', function () {
		var assets;

		before(function(){
			assets = require('./assets');
		});

		it('should be an object', function () {
		  assert.equal("object", typeof assets);
		});
		
		it('should be a hash of original file', function(){
			 assert.equal("string", typeof assets.test);
		});
	});
});