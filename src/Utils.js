/*
	Global vars
*/

'use strict';

var extend = function(){
	if(arguments.length === 1) return arguments[0];
	var source = Array.prototype.splice.call(arguments, 1, 1)[0];
	arguments[0] = Object.keys(source).reduce(function(carry, key){
		carry[key] = source[key];
		return carry;
	}, arguments[0]);
	return extend.apply(null, arguments);
};

module.exports = {
	extend: extend
};
