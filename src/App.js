
'use strict';
var SolarSystem = require('./SolarSystem');


var global = window.lagrange = window.lagrange || {};

global.planet_positions = module.exports = {
	getPositions: function(userDate){
		return SolarSystem.getPositions(userDate);
	}
};