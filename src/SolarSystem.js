'use strict';

var ns = require('ns');
var Utils = require('./Utils');
var definitions = require('./Definitions');
var CelestialBody = require('./CelestialBody');


var bodies = definitions.map(function(def){
	var body = Object.create(CelestialBody);
	Utils.extend(body, def);
	body.init();
	return body;
});

var names = bodies.reduce(function(carry, body){
	carry[body.name] = body;
	return carry;
}, {});

var central = bodies.reduce(function(carry, body){
	carry = carry && carry.mass > body.mass ? carry : body;
	return carry;
}, null);


console.log(bodies);

module.exports = {
	getBody: function(name){
		return names[name] || central;
	},
	getPositions: function(userDate, calculateVelocity){
		var epochTime = ns.getEpochTime(userDate);
		return bodies.map(function(body){
			body.setPositionFromDate(epochTime, calculateVelocity);
			return {
				name: body.name,
				position: body.getPosition(),
				velocity: body.getVelocity()
			};
		});
	}
};