
'use strict';

var OrbitalElements = require('./OrbitalElements');
var ns = require('ns');
var THREE = require('./Three.shim');

var CelestialBody = {

	init : function() {
		this.reset();
		this.movement = new THREE.Vector3();
		this.invMass = 1 / this.mass;

		this.orbitalElements = Object.create(OrbitalElements);
		this.orbitalElements.setName(this.name);
		this.orbitalElements.setDefaultOrbit(this.orbit, this.orbitCalculator);
		//console.log(this.name, this.position, this.velocity);

	},

	reset : function(){
		this.angle = 0;
		this.force = new THREE.Vector3();
		this.movement = new THREE.Vector3();
		this.previousPosition = null;
	},

	//if epoch start is not j2000, get epoch time from j2000 epoch time
	getEpochTime : function(epochTime) {
		if(this.epoch) {
			epochTime = epochTime - ((this.epoch.getTime() - ns.J2000) / 1000);
		}
		return epochTime;
	},

	setPositionFromDate : function(epochTime, calculateVelocity) {

		epochTime = this.getEpochTime(epochTime);
		this.position = this.isCentral ? new THREE.Vector3() : this.orbitalElements.getPositionFromElements(this.orbitalElements.calculateElements(epochTime));
		this.relativePosition = new THREE.Vector3();
		if(calculateVelocity) {
			this.velocity = this.isCentral ? new THREE.Vector3() : this.orbitalElements.calculateVelocity(epochTime, this.relativeTo, this.calculateFromElements);
		}
		this.positionRelativeTo();		
	},
	
	getAngleTo : function(bodyName){
		var ref = require('./SolarSystem').getBody(bodyName);
		if(ref) {
			
			var eclPos = this.position.clone().sub(ref.getPosition()).normalize();
			eclPos.z = 0;
			var angleX = eclPos.angleTo(new THREE.Vector3(1, 0, 0));
			var angleY = eclPos.angleTo(new THREE.Vector3(0, 1, 0));
			//console.log(angleX, angleY);
			var angle = angleX;
			var q = Math.PI / 2;
			if(angleY > q) angle = -angleX;
			return angle;
		}
		return 0;
	},

	positionRelativeTo : function(){
		if(this.relativeTo) {
			var central = require('./SolarSystem').getBody(this.relativeTo);
			if(central && central!==require('./SolarSystem').getBody()/**/) {
				this.position.add(central.position);
				//console.log(this.name+' pos rel to ' + this.relativeTo);
				this.velocity && central.velocity && this.velocity.add(central.velocity);
			}
		}
	},

	calculatePosition : function(t) {
		return this.orbitalElements.calculatePosition(t);
	},

	getPosition : function(){
		return this.position.clone();
	},

	getVelocity : function(){
		return this.velocity && this.velocity.clone();
	},
	//return true/false if this body is orbiting the requested body
	isOrbitAround : function(celestial){
		return celestial.name === this.relativeTo;
	}
};

module.exports = CelestialBody;
