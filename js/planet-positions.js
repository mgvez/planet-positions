(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

'use strict';
var SolarSystem = require('./SolarSystem');


var global = window.lagrange = window.lagrange || {};

global.planet_positions = module.exports = {
	getPositions: function(userDate){
		return SolarSystem.getPositions(userDate);
	}
};
},{"./SolarSystem":8}],2:[function(require,module,exports){

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

},{"./OrbitalElements":7,"./SolarSystem":8,"./Three.shim":9,"ns":6}],3:[function(require,module,exports){
'use strict';
var ns = require('ns');
var MoonRealOrbit = require('./MoonRealOrbit');

module.exports = [
	{
		name: 'sun',
		title : 'The Sun',
		mass : 1.9891e30,
		radius : 6.96342e5,
		k : 0.01720209895 //gravitational constant (μ)
	},
	{
	 	name: 'mercury',
		title : 'Mercury',
		mass : 3.3022e23,
		radius:2439,
		orbit : { 
			base : {a : 0.38709927 * ns.AU ,  e : 0.20563593, i: 7.00497902, l : 252.25032350, lp : 77.45779628, o : 48.33076593},
			cy : {a : 0.00000037 * ns.AU ,  e : 0.00001906, i: -0.00594749, l : 149472.67411175, lp : 0.16047689, o : -0.12534081}
		}
	},
	{
		name: 'venus',
		title : 'Venus',
		mass : 4.868e24,
		radius : 6051,
		orbit : {
			base : {a : 0.72333566 * ns.AU ,  e : 0.00677672, i: 3.39467605, l : 181.97909950, lp : 131.60246718, o : 76.67984255},
			cy : {a : 0.00000390 * ns.AU ,  e : -0.00004107, i: -0.00078890, l : 58517.81538729, lp : 0.00268329, o : -0.27769418}
		}
	},
	{
		name:'earth',
		title : 'The Earth',
		mass : 5.9736e24,
		radius : 3443.9307 * ns.NM_TO_KM,
		sideralDay : ns.SIDERAL_DAY,
		tilt : 23+(26/60)+(21/3600) ,
		orbit : {
			base : {a : 1.00000261 * ns.AU, e : 0.01671123, i : -0.00001531, l : 100.46457166, lp : 102.93768193, o : 0.0},
			cy : {a : 0.00000562 * ns.AU, e : -0.00004392, i : -0.01294668, l : 35999.37244981, lp : 0.32327364, o : 0.0}
		}
	},
	{
		name:'mars',
		title : 'Mars',
		mass : 6.4185e23,
		radius : 3376,
		sideralDay : 1.025957 * ns.DAY,
		orbit : {
			base : {a : 1.52371034 * ns.AU ,  e : 0.09339410, i: 1.84969142, l : -4.55343205, lp : -23.94362959, o : 49.55953891},
			cy : {a : 0.00001847 * ns.AU ,  e : 0.00007882, i: -0.00813131, l : 19140.30268499, lp : 0.44441088, o : -0.29257343}
		}
	},
	{
	 	name:'jupiter',
		title : 'Jupiter',
		mass : 1.8986e27,
		radius : 71492,
		orbit : {
			base : {a : 5.20288700 * ns.AU ,  e : 0.04838624, i: 1.30439695, l : 34.39644051, lp : 14.72847983, o : 100.47390909},
			cy : {a : -0.00011607 * ns.AU ,  e : -0.00013253, i: -0.00183714, l : 3034.74612775, lp : 0.21252668, o : 0.20469106}
		}
	},
	{
		name:'saturn',
		title : 'Saturn',
		mass : 5.6846e26,
		radius : 58232,
		tilt : 26.7,
		orbit : {
			base : {a : 9.53667594 * ns.AU ,  e : 0.05386179, i: 2.48599187, l : 49.95424423, lp : 92.59887831, o : 113.66242448},
			cy : {a : -0.00125060 * ns.AU ,  e : -0.00050991, i: 0.00193609, l : 1222.49362201, lp : -0.41897216, o : -0.28867794}
		}
	},
	{
		name: 'uranus',
		title : 'Uranus',
		mass : 8.6810e25,
		radius : 25559,
		orbit : {
			base : {a : 19.18916464 * ns.AU ,  e : 0.04725744, i: 0.77263783, l : 313.23810451, lp : 170.95427630, o : 74.01692503},
			cy : {a : -0.00196176 * ns.AU ,  e : -0.00004397, i: -0.00242939, l : 428.48202785, lp : 0.40805281, o : 0.04240589}
		}
	},
	{
		name:'neptune',
		title : 'Neptune',
		mass : 1.0243e26,
		radius : 24764,
		orbit : {
			base : {a : 30.06992276  * ns.AU,  e : 0.00859048, i: 1.77004347, l : -55.12002969, lp : 44.96476227, o : 131.78422574},
			cy : {a : 0.00026291  * ns.AU,  e : 0.00005105, i: 0.00035372, l : 218.45945325, lp : -0.32241464, o : -0.00508664}
		}
	},
	{
		name: 'pluto',
		title : 'Pluto',
		mass : 1.305e22+1.52e21,
		radius : 1153,
		orbit : {
			base : {a : 39.48211675 * ns.AU ,  e : 0.24882730, i: 17.14001206, l : 238.92903833, lp : 224.06891629, o : 110.30393684},
			cy : {a : -0.00031596 * ns.AU ,  e : 0.00005170, i: 0.00004818, l : 145.20780515, lp : -0.04062942, o : -0.01183482}
		}
	},
	{
		name: 'halley',
		title : 'Halley\'s Comet',
		mass : 2.2e14,
		radius : 50,
		orbit : {
			base : {a : 17.83414429 * ns.AU ,  e : 0.967142908, i: 162.262691, M : 360 * (438393600 / (75.1 * ns.YEAR * ns.DAY)), w : 111.332485, o : 58.420081},
			day : {a : 0 ,  e : 0, i: 0, M : (360 / (75.1 * 365.25) ), w : 0, o : 0}
		}
	},
	{
		name: 'moon',
		title : 'The Moon',
		mass : 7.3477e22,
		radius : 1738.1,
		sideralDay : (27.3215782 * ns.DAY) ,
		tilt : 1.5424,
		fov : 1,
		relativeTo : 'earth',
		orbitCalculator : MoonRealOrbit,
		orbit: {
			base : {
				a : 384400,
				e : 0.0554,
				w : 318.15,
				M : 135.27,
				i : 5.16,
				o : 125.08
			},
			day : {
				a : 0,
				e : 0,
				i : 0,
				M : 13.176358,//360 / 27.321582,
				w : (360 / 5.997) / 365.25,
				o : (360 / 18.600) / 365.25
			}	
		}
	}
];

},{"./MoonRealOrbit":5,"ns":6}],4:[function(require,module,exports){
'use strict';
module.exports = {
	sinh : function(a) {
		return (Math.exp(a) - Math.exp(-a)) / 2;
	},

	cosh : function(a) {
		return (Math.pow(Math.E, a) + Math.pow(Math.E, -a)) / 2;
	},

	sign : function(a) {
		return (a >= 0.0) ? 1 : -1;
	}
};
},{}],5:[function(require,module,exports){
'use strict';

var ns = require('ns');

var DEG_TO_RAD = ns.DEG_TO_RAD;
var RAD_TO_DEG = ns.RAD_TO_DEG;

module.exports = function(t){

	var t2 = t * t;
	var t3 = t * t2;
	var t4 = t * t3;
	var t5 = t * t4;

	var t2e4 = t2 * 1e-4;
	var t3e6 = t3 * 1e-6;
	var t4e8 = t4 * 1e-8;

	//% semimajor axis

	var sa = 3400.4 * Math.cos(DEG_TO_RAD * (235.7004 + 890534.2230 * t - 32.601 * t2e4 
	+ 3.664 * t3e6 - 1.769 * t4e8)) 
	- 635.6 * Math.cos(DEG_TO_RAD * (100.7370 + 413335.3554 * t - 122.571 * t2e4 
	- 10.684 * t3e6 + 5.028 * t4e8)) 
	- 235.6 * Math.cos(DEG_TO_RAD * (134.9634 + 477198.8676 * t + 89.970 * t2e4 
	+ 14.348 * t3e6 - 6.797 * t4e8)) 
	+ 218.1 * Math.cos(DEG_TO_RAD * (238.1713 +  854535.1727 * t - 31.065 * t2e4 
	+ 3.623 * t3e6  - 1.769 * t4e8)) 
	+ 181.0 * Math.cos(DEG_TO_RAD * (10.6638 + 1367733.0907 * t + 57.370 * t2e4 
	+ 18.011 * t3e6 - 8.566 * t4e8)) 
	- 39.9 * Math.cos(DEG_TO_RAD * (103.2079 + 377336.3051 * t - 121.035 * t2e4 
	- 10.724 * t3e6 + 5.028 * t4e8)) 
	- 38.4 * Math.cos(DEG_TO_RAD * (233.2295 + 926533.2733 * t - 34.136 * t2e4 
	+ 3.705 * t3e6 - 1.769 * t4e8)) 
	+ 33.8 * Math.cos(DEG_TO_RAD * (336.4374 + 1303869.5784 * t - 155.171 * t2e4 
	- 7.020 * t3e6 + 3.259 * t4e8)) 
	+ 28.8 * Math.cos(DEG_TO_RAD * (111.4008 + 1781068.4461 * t - 65.201 * t2e4 
	+ 7.328 * t3e6 - 3.538 * t4e8)) 
	+ 12.6 * Math.cos(DEG_TO_RAD * (13.1347 + 1331734.0404 * t + 58.906 * t2e4 
	+ 17.971 * t3e6 - 8.566 * t4e8)) 
	+ 11.4 * Math.cos(DEG_TO_RAD * (186.5442 + 966404.0351 * t - 68.058 * t2e4 
	- 0.567 * t3e6 + 0.232 * t4e8)) 
	- 11.1 * Math.cos(DEG_TO_RAD * (222.5657 - 441199.8173 * t - 91.506 * t2e4 
	- 14.307 * t3e6 + 6.797 * t4e8)) 
	- 10.2 * Math.cos(DEG_TO_RAD * (269.9268 + 954397.7353 * t + 179.941 * t2e4 
	+ 28.695 * t3e6 - 13.594 * t4e8)) 
	+ 9.7 * Math.cos(DEG_TO_RAD * (145.6272 + 1844931.9583 * t + 147.340 * t2e4 
	+ 32.359 * t3e6 - 15.363 * t4e8)) 
	+ 9.6 * Math.cos(DEG_TO_RAD * (240.6422 + 818536.1225 * t - 29.529 * t2e4 
	+ 3.582 * t3e6 - 1.769 * t4e8)) 
	+ 8.0 * Math.cos(DEG_TO_RAD * (297.8502 + 445267.1115 * t - 16.300 * t2e4 
	+ 1.832 * t3e6 - 0.884 * t4e8)) 
	- 6.2 * Math.cos(DEG_TO_RAD * (132.4925 + 513197.9179 * t + 88.434 * t2e4 
	+ 14.388 * t3e6 - 6.797 * t4e8)) 
	+ 6.0 * Math.cos(DEG_TO_RAD * (173.5506 + 1335801.3346 * t - 48.901 * t2e4 
	+ 5.496 * t3e6 - 2.653 * t4e8)) 
	+ 3.7 * Math.cos(DEG_TO_RAD * (113.8717 + 1745069.3958 * t - 63.665 * t2e4 
	+ 7.287 * t3e6 - 3.538 * t4e8)) 
	+ 3.6 * Math.cos(DEG_TO_RAD * (338.9083 + 1267870.5281 * t - 153.636 * t2e4 
	- 7.061 * t3e6 + 3.259 * t4e8)) 
	+ 3.2 * Math.cos(DEG_TO_RAD * (246.3642 + 2258267.3137 * t + 24.769 * t2e4 
	+ 21.675 * t3e6 - 10.335 * t4e8)) 
	- 3.0 * Math.cos(DEG_TO_RAD * (8.1929 + 1403732.1410 * t + 55.834 * t2e4 
	+ 18.052 * t3e6 - 8.566 * t4e8)) 
	+ 2.3 * Math.cos(DEG_TO_RAD * (98.2661 + 449334.4057 * t - 124.107 * t2e4 
	- 10.643 * t3e6 + 5.028 * t4e8)) 
	- 2.2 * Math.cos(DEG_TO_RAD * (357.5291 + 35999.0503 * t - 1.536 * t2e4 
	+ 0.041 * t3e6 + 0.000 * t4e8)) 
	- 2.0 * Math.cos(DEG_TO_RAD * (38.5872 + 858602.4669 * t - 138.871 * t2e4 
	- 8.852 * t3e6 + 4.144 * t4e8)) 
	- 1.8 * Math.cos(DEG_TO_RAD * (105.6788 + 341337.2548 * t - 119.499 * t2e4 
	- 10.765 * t3e6 + 5.028 * t4e8)) 
	- 1.7 * Math.cos(DEG_TO_RAD * (201.4740 + 826670.7108 * t - 245.142 * t2e4 
	- 21.367 * t3e6 + 10.057 * t4e8)) 
	+ 1.6 * Math.cos(DEG_TO_RAD * (184.1196 + 401329.0556 * t + 125.428 * t2e4 
	+ 18.579 * t3e6 - 8.798 * t4e8)) 
	- 1.4 * Math.cos(DEG_TO_RAD * (308.4192 - 489205.1674 * t + 158.029 * t2e4 
	+ 14.915 * t3e6 - 7.029 * t4e8)) 
	+ 1.3 * Math.cos(DEG_TO_RAD * (325.7736 - 63863.5122 * t - 212.541 * t2e4 
	- 25.031 * t3e6 + 11.826 * t4e8));

	var sapp = - 0.55 * Math.cos(DEG_TO_RAD * (238.2 + 854535.2 * t)) 
		+ 0.10 * Math.cos(DEG_TO_RAD * (103.2 + 377336.3 * t)) 
		+ 0.10 * Math.cos(DEG_TO_RAD * (233.2 + 926533.3 * t));

	var sma = 383397.6 + sa + sapp * t;

	//% orbital eccentricity

	var se = 0.014217 * Math.cos(DEG_TO_RAD * (100.7370 + 413335.3554 * t - 122.571 * t2e4 
	- 10.684 * t3e6 + 5.028 * t4e8)) 
	+ 0.008551 * Math.cos(DEG_TO_RAD * (325.7736 - 63863.5122 * t - 212.541 * t2e4 
	- 25.031 * t3e6 + 11.826 * t4e8)) 
	- 0.001383 * Math.cos(DEG_TO_RAD * (134.9634 + 477198.8676 * t + 89.970 * t2e4 
	+ 14.348 * t3e6 - 6.797 * t4e8)) 
	+ 0.001353 * Math.cos(DEG_TO_RAD * (10.6638 + 1367733.0907 * t + 57.370 * t2e4 
	+ 18.011 * t3e6 - 8.566 * t4e8)) 
	- 0.001146 * Math.cos(DEG_TO_RAD * (66.5106 + 349471.8432 * t - 335.112 * t2e4 
	- 35.715 * t3e6 + 16.854 * t4e8)) 
	- 0.000915 * Math.cos(DEG_TO_RAD * (201.4740 + 826670.7108 * t - 245.142 * t2e4 
	- 21.367 * t3e6 + 10.057 * t4e8)) 
	+ 0.000869 * Math.cos(DEG_TO_RAD * (103.2079 + 377336.3051 * t - 121.035 * t2e4 
	- 10.724 * t3e6 + 5.028 * t4e8)) 
	- 0.000628 * Math.cos(DEG_TO_RAD * (235.7004 + 890534.2230 * t - 32.601 * t2e4 
	+ 3.664 * t3e6  - 1.769 * t4e8)) 
	- 0.000393 * Math.cos(DEG_TO_RAD * (291.5472 - 127727.0245 * t - 425.082 * t2e4 
	- 50.062 * t3e6 + 23.651 * t4e8)) 
	+ 0.000284 * Math.cos(DEG_TO_RAD * (328.2445 - 99862.5625 * t - 211.005 * t2e4 
	- 25.072 * t3e6 + 11.826 * t4e8)) 
	- 0.000278 * Math.cos(DEG_TO_RAD * (162.8868 - 31931.7561 * t - 106.271 * t2e4 
	- 12.516 * t3e6 + 5.913 * t4e8)) 
	- 0.000240 * Math.cos(DEG_TO_RAD * (269.9268 + 954397.7353 * t + 179.941 * t2e4 
	+ 28.695 * t3e6 - 13.594 * t4e8)) 
	+ 0.000230 * Math.cos(DEG_TO_RAD * (111.4008 + 1781068.4461 * t - 65.201 * t2e4 
	+ 7.328 * t3e6  - 3.538 * t4e8)) 
	+ 0.000229 * Math.cos(DEG_TO_RAD * (167.2476 + 762807.1986 * t - 457.683 * t2e4 
	- 46.398 * t3e6 + 21.882 * t4e8)) 
	- 0.000202 * Math.cos(DEG_TO_RAD * ( 83.3826 - 12006.2998 * t + 247.999 * t2e4 
	+ 29.262 * t3e6 - 13.826 * t4e8)) 
	+ 0.000190 * Math.cos(DEG_TO_RAD * (190.8102 - 541062.3799 * t - 302.511 * t2e4 
	- 39.379 * t3e6 + 18.623 * t4e8)) 
	+ 0.000177 * Math.cos(DEG_TO_RAD * (357.5291 + 35999.0503 * t - 1.536 * t2e4 
	+ 0.041 * t3e6 + 0.000 * t4e8)) 
	+ 0.000153 * Math.cos(DEG_TO_RAD * (32.2842 + 285608.3309 * t - 547.653 * t2e4 
	- 60.746 * t3e6 + 28.679 * t4e8)) 
	- 0.000137 * Math.cos(DEG_TO_RAD * (44.8902 + 1431596.6029 * t + 269.911 * t2e4 
	+ 43.043 * t3e6 - 20.392 * t4e8)) 
	+ 0.000122 * Math.cos(DEG_TO_RAD * (145.6272 + 1844931.9583 * t + 147.340 * t2e4 
	+ 32.359 * t3e6 - 15.363 * t4e8)) 
	+ 0.000116 * Math.cos(DEG_TO_RAD * (302.2110 + 1240006.0662 * t - 367.713 * t2e4 
	- 32.051 * t3e6 + 15.085 * t4e8)) 
	- 0.000111 * Math.cos(DEG_TO_RAD * (203.9449 + 790671.6605 * t - 243.606 * t2e4 
	- 21.408 * t3e6 + 10.057 * t4e8)) 
	- 0.000108 * Math.cos(DEG_TO_RAD * (68.9815 + 313472.7929 * t - 333.576 * t2e4 
	- 35.756 * t3e6 + 16.854 * t4e8)) 
	+ 0.000096 * Math.cos(DEG_TO_RAD * (336.4374 + 1303869.5784 * t - 155.171 * t2e4 
	- 7.020 * t3e6 + 3.259 * t4e8)) 
	- 0.000090 * Math.cos(DEG_TO_RAD * (98.2661 + 449334.4057 * t - 124.107 * t2e4 
	- 10.643 * t3e6 + 5.028 * t4e8)) 
	+ 0.000090 * Math.cos(DEG_TO_RAD * (13.1347 + 1331734.0404 * t + 58.906 * t2e4 
	+ 17.971 * t3e6 - 8.566 * t4e8)) 
	+ 0.000056 * Math.cos(DEG_TO_RAD * (55.8468 - 1018261.2475 * t - 392.482 * t2e4 
	- 53.726 * t3e6 + 25.420 * t4e8)) 
	- 0.000056 * Math.cos(DEG_TO_RAD * (238.1713 + 854535.1727 * t - 31.065 * t2e4 
	+ 3.623 * t3e6 - 1.769 * t4e8)) 
	+ 0.000052 * Math.cos(DEG_TO_RAD * (308.4192 - 489205.1674 * t + 158.029 * t2e4 
	+ 14.915 * t3e6 - 7.029 * t4e8)) 
	- 0.000050 * Math.cos(DEG_TO_RAD * (133.0212 + 698943.6863 * t - 670.224 * t2e4 
	- 71.429 * t3e6 + 33.708 * t4e8)) 
	- 0.000049 * Math.cos(DEG_TO_RAD * (267.9846 + 1176142.5540 * t - 580.254 * t2e4 
	- 57.082 * t3e6 + 26.911 * t4e8)) 
	- 0.000049 * Math.cos(DEG_TO_RAD * (184.1196 + 401329.0556 * t + 125.428 * t2e4 
	+ 18.579 * t3e6 - 8.798 * t4e8)) 
	- 0.000045 * Math.cos(DEG_TO_RAD * (49.1562 - 75869.8120 * t + 35.458 * t2e4 
	+ 4.231 * t3e6 - 2.001 * t4e8)) 
	+ 0.000044 * Math.cos(DEG_TO_RAD * (257.3208 - 191590.5367 * t - 637.623 * t2e4 
	- 75.093 * t3e6 + 35.477 * t4e8)) 
	+ 0.000042 * Math.cos(DEG_TO_RAD * (105.6788 + 341337.2548 * t - 119.499 * t2e4 
	- 10.765 * t3e6 + 5.028 * t4e8)) 
	+ 0.000042 * Math.cos(DEG_TO_RAD * (160.4159 + 4067.2942 * t - 107.806 * t2e4 
	- 12.475 * t3e6 + 5.913 * t4e8)) 
	+ 0.000040 * Math.cos(DEG_TO_RAD * (246.3642 + 2258267.3137 * t + 24.769 * t2e4 
	+ 21.675 * t3e6 - 10.335 * t4e8)) 
	- 0.000040 * Math.cos(DEG_TO_RAD * (156.5838 - 604925.8921 * t - 515.053 * t2e4 
	- 64.410 * t3e6 + 30.448 * t4e8)) 
	+ 0.000036 * Math.cos(DEG_TO_RAD * (169.7185 + 726808.1483 * t - 456.147 * t2e4 
	- 46.439 * t3e6 + 21.882 * t4e8)) 
	+ 0.000029 * Math.cos(DEG_TO_RAD * (113.8717 + 1745069.3958 * t - 63.665 * t2e4 
	+ 7.287 * t3e6 - 3.538 * t4e8)) 
	- 0.000029 * Math.cos(DEG_TO_RAD * (297.8502 + 445267.1115 * t - 16.300 * t2e4 
	+ 1.832 * t3e6 - 0.884 * t4e8)) 
	- 0.000028 * Math.cos(DEG_TO_RAD * (294.0181 - 163726.0747 * t - 423.546 * t2e4 
	- 50.103 * t3e6 + 23.651 * t4e8)) 
	+ 0.000027 * Math.cos(DEG_TO_RAD * (263.6238 + 381403.5993 * t - 228.841 * t2e4 
	- 23.199 * t3e6 + 10.941 * t4e8)) 
	- 0.000026 * Math.cos(DEG_TO_RAD * (358.0578 + 221744.8187 * t - 760.194 * t2e4 
	- 85.777 * t3e6 + 40.505 * t4e8)) 
	- 0.000026 * Math.cos(DEG_TO_RAD * (8.1929 + 1403732.1410 * t + 55.834 * t2e4 
	+ 18.052 * t3e6 - 8.566 * t4e8));

	var sedp = -0.0022 * Math.cos(DEG_TO_RAD * (103.2 + 377336.3 * t));

	var ecc = 0.055544 + se + 1e-3 * t * sedp;

	//% sine of half the inclination

var sg = 0.0011776 * Math.cos(DEG_TO_RAD * (49.1562 - 75869.8120 * t + 35.458 * t2e4 
	+ 4.231 * t3e6 - 2.001 * t4e8)) 
	- 0.0000971 * Math.cos(DEG_TO_RAD * (235.7004 + 890534.2230 * t - 32.601 * t2e4 
	+ 3.664 * t3e6 - 1.769 * t4e8)) 
	+ 0.0000908 * Math.cos(DEG_TO_RAD * (186.5442 + 966404.0351 * t - 68.058 * t2e4 
	- 0.567 * t3e6 + 0.232 * t4e8)) 
	+ 0.0000623 * Math.cos(DEG_TO_RAD * (83.3826 - 12006.2998 * t + 247.999 * t2e4 
	+ 29.262 * t3e6 - 13.826 * t4e8)) 
	+ 0.0000483 * Math.cos(DEG_TO_RAD * (51.6271 - 111868.8623 * t + 36.994 * t2e4 
	+ 4.190 * t3e6 - 2.001 * t4e8)) 
	+ 0.0000348 * Math.cos(DEG_TO_RAD * (100.7370 + 413335.3554 * t - 122.571 * t2e4 
	- 10.684 * t3e6 + 5.028 * t4e8)) 
	- 0.0000316 * Math.cos(DEG_TO_RAD * (308.4192 - 489205.1674 * t + 158.029 * t2e4 
	+ 14.915 * t3e6 - 7.029 * t4e8)) 
	- 0.0000253 * Math.cos(DEG_TO_RAD * (46.6853 - 39870.7617 * t + 33.922 * t2e4 
	+ 4.272 * t3e6 - 2.001 * t4e8)) 
	- 0.0000141 * Math.cos(DEG_TO_RAD * (274.1928 - 553068.6797 * t - 54.513 * t2e4 
	- 10.116 * t3e6 + 4.797 * t4e8)) 
	+ 0.0000127 * Math.cos(DEG_TO_RAD * (325.7736 - 63863.5122 * t - 212.541 * t2e4 
	- 25.031 * t3e6 + 11.826 * t4e8)) 
	+ 0.0000117 * Math.cos(DEG_TO_RAD * (184.1196 + 401329.0556 * t + 125.428 * t2e4 
	+ 18.579 * t3e6 - 8.798 * t4e8)) 
	- 0.0000078 * Math.cos(DEG_TO_RAD * (98.3124 - 151739.6240 * t + 70.916 * t2e4 
	+ 8.462 * t3e6 - 4.001 * t4e8)) 
	- 0.0000063 * Math.cos(DEG_TO_RAD * (238.1713 + 854535.1727 * t - 31.065 * t2e4 
	+ 3.623 * t3e6 - 1.769 * t4e8)) 
	+ 0.0000063 * Math.cos(DEG_TO_RAD * (134.9634 + 477198.8676 * t + 89.970 * t2e4 
	+ 14.348 * t3e6 - 6.797 * t4e8)) 
	+ 0.0000036 * Math.cos(DEG_TO_RAD * (321.5076 + 1443602.9027 * t + 21.912 * t2e4 
	+ 13.780 * t3e6 - 6.566 * t4e8)) 
	- 0.0000035 * Math.cos(DEG_TO_RAD * (10.6638 + 1367733.0907 * t + 57.370 * t2e4 
	+ 18.011 * t3e6 - 8.566 * t4e8)) 
	+ 0.0000024 * Math.cos(DEG_TO_RAD * (149.8932 + 337465.5434 * t - 87.113 * t2e4 
	- 6.453 * t3e6 + 3.028 * t4e8)) 
	+ 0.0000024 * Math.cos(DEG_TO_RAD * (170.9849 - 930404.9848 * t + 66.523 * t2e4 
	+ 0.608 * t3e6 - 0.232 * t4e8));

	var sgp = - 0.0203 * Math.cos(DEG_TO_RAD * (125.0 - 1934.1 * t)) 
		+ 0.0034 * Math.cos(DEG_TO_RAD * (220.2 - 1935.5 * t));

	var gamma = 0.0449858 + sg + 1e-3 * sgp;

	//% longitude of perigee

	var sp = - 15.448 * Math.sin(DEG_TO_RAD * (100.7370 + 413335.3554 * t - 122.571 * t2e4 
	- 10.684 * t3e6 + 5.028 * t4e8))
	- 9.642 * Math.sin(DEG_TO_RAD * (325.7736 - 63863.5122 * t - 212.541 * t2e4 
	- 25.031 * t3e6 + 11.826 * t4e8)) 
	- 2.721 * Math.sin(DEG_TO_RAD * (134.9634 + 477198.8676 * t + 89.970 * t2e4 
	+ 14.348 * t3e6 - 6.797 * t4e8)) 
	+ 2.607 * Math.sin(DEG_TO_RAD * (66.5106 + 349471.8432 * t - 335.112 * t2e4 
	- 35.715 * t3e6 + 16.854 * t4e8)) 
	+ 2.085 * Math.sin(DEG_TO_RAD * (201.4740 + 826670.7108 * t - 245.142 * t2e4 
	- 21.367 * t3e6 + 10.057 * t4e8)) 
	+ 1.477 * Math.sin(DEG_TO_RAD * (10.6638 + 1367733.0907 * t + 57.370 * t2e4 
	+ 18.011 * t3e6 - 8.566 * t4e8)) 
	+ 0.968 * Math.sin(DEG_TO_RAD * (291.5472 - 127727.0245 * t - 425.082 * t2e4 
	- 50.062 * t3e6 + 23.651 * t4e8)) 
	- 0.949 * Math.sin(DEG_TO_RAD * (103.2079 + 377336.3051 * t - 121.035 * t2e4 
	- 10.724 * t3e6 + 5.028 * t4e8)) 
	- 0.703 * Math.sin(DEG_TO_RAD * (167.2476 + 762807.1986 * t - 457.683 * t2e4 
	- 46.398 * t3e6 + 21.882 * t4e8)) 
	- 0.660 * Math.sin(DEG_TO_RAD * (235.7004 + 890534.2230 * t - 32.601 * t2e4 
	+ 3.664 * t3e6 - 1.769 * t4e8)) 
	- 0.577 * Math.sin(DEG_TO_RAD * (190.8102 - 541062.3799 * t - 302.511 * t2e4 
	- 39.379 * t3e6 + 18.623 * t4e8)) 
	- 0.524 * Math.sin(DEG_TO_RAD * (269.9268 + 954397.7353 * t + 179.941 * t2e4 
	+ 28.695 * t3e6 - 13.594 * t4e8)) 
	- 0.482 * Math.sin(DEG_TO_RAD * (32.2842 + 285608.3309 * t - 547.653 * t2e4 
	- 60.746 * t3e6 + 28.679 * t4e8)) 
	+ 0.452 * Math.sin(DEG_TO_RAD * (357.5291 + 35999.0503 * t - 1.536 * t2e4 
	+ 0.041 * t3e6 + 0.000 * t4e8)) 
	- 0.381 * Math.sin(DEG_TO_RAD * (302.2110 + 1240006.0662 * t - 367.713 * t2e4 
	- 32.051 * t3e6 + 15.085 * t4e8)) 
	- 0.342 * Math.sin(DEG_TO_RAD * (328.2445 - 99862.5625 * t - 211.005 * t2e4 
	- 25.072 * t3e6 + 11.826 * t4e8)) 
	- 0.312 * Math.sin(DEG_TO_RAD * (44.8902 + 1431596.6029 * t + 269.911 * t2e4 
	+ 43.043 * t3e6 - 20.392 * t4e8)) 
	+ 0.282 * Math.sin(DEG_TO_RAD * (162.8868 - 31931.7561 * t - 106.271 * t2e4 
	- 12.516 * t3e6 + 5.913 * t4e8)) 
	+ 0.255 * Math.sin(DEG_TO_RAD * (203.9449 + 790671.6605 * t - 243.606 * t2e4 
	- 21.408 * t3e6 + 10.057 * t4e8)) 
	+ 0.252 * Math.sin(DEG_TO_RAD * (68.9815 + 313472.7929 * t - 333.576 * t2e4 
	- 35.756 * t3e6 + 16.854 * t4e8)) 
	- 0.211 * Math.sin(DEG_TO_RAD * (83.3826 - 12006.2998 * t + 247.999 * t2e4 
	+ 29.262 * t3e6 - 13.826 * t4e8)) 
	+ 0.193 * Math.sin(DEG_TO_RAD * (267.9846 + 1176142.5540 * t - 580.254 * t2e4 
	- 57.082 * t3e6 + 26.911 * t4e8)) 
	+ 0.191 * Math.sin(DEG_TO_RAD * (133.0212 + 698943.6863 * t - 670.224 * t2e4 
	- 71.429 * t3e6 + 33.708 * t4e8)) 
	- 0.184 * Math.sin(DEG_TO_RAD * (55.8468 - 1018261.2475 * t - 392.482 * t2e4 
	- 53.726 * t3e6 + 25.420 * t4e8)) 
	+ 0.182 * Math.sin(DEG_TO_RAD * (145.6272 + 1844931.9583 * t + 147.340 * t2e4 
	+ 32.359 * t3e6 - 15.363 * t4e8)) 
	- 0.158 * Math.sin(DEG_TO_RAD * (257.3208 - 191590.5367 * t - 637.623 * t2e4 
	- 75.093 * t3e6 + 35.477 * t4e8)) 
	+ 0.148 * Math.sin(DEG_TO_RAD * (156.5838 - 604925.8921 * t - 515.053 * t2e4 
	- 64.410 * t3e6 + 30.448 * t4e8)) 
	- 0.111 * Math.sin(DEG_TO_RAD * (169.7185 + 726808.1483 * t - 456.147 * t2e4 
	- 46.439 * t3e6 + 21.882 * t4e8)) 
	+ 0.101 * Math.sin(DEG_TO_RAD * (13.1347 + 1331734.0404 * t + 58.906 * t2e4 
	+ 17.971 * t3e6 - 8.566 * t4e8)) 
	+ 0.100 * Math.sin(DEG_TO_RAD * (358.0578 + 221744.8187 * t - 760.194 * t2e4 
	- 85.777 * t3e6 + 40.505 * t4e8)) 
	+ 0.087 * Math.sin(DEG_TO_RAD * (98.2661 + 449334.4057 * t - 124.107 * t2e4 
	- 10.643 * t3e6 + 5.028 * t4e8)) 
	+ 0.080 * Math.sin(DEG_TO_RAD * (42.9480 + 1653341.4216 * t - 490.283 * t2e4 
	- 42.734 * t3e6 + 20.113 * t4e8)) 
	+ 0.080 * Math.sin(DEG_TO_RAD * (222.5657 - 441199.8173 * t - 91.506 * t2e4 
	- 14.307 * t3e6 + 6.797 * t4e8)) 
	+ 0.077 * Math.sin(DEG_TO_RAD * (294.0181 - 163726.0747 * t - 423.546 * t2e4 
	- 50.103 * t3e6 + 23.651 * t4e8)) 
	- 0.073 * Math.sin(DEG_TO_RAD * (280.8834 - 1495460.1151 * t - 482.452 * t2e4 
	- 68.074 * t3e6 + 32.217 * t4e8)) 
	- 0.071 * Math.sin(DEG_TO_RAD * (304.6819 + 1204007.0159 * t - 366.177 * t2e4 
	- 32.092 * t3e6 + 15.085 * t4e8)) 
	- 0.069 * Math.sin(DEG_TO_RAD * (233.7582 + 1112279.0417 * t - 792.795 * t2e4 
	- 82.113 * t3e6 + 38.736 * t4e8)) 
	- 0.067 * Math.sin(DEG_TO_RAD * (34.7551 + 249609.2807 * t - 546.117 * t2e4 
	- 60.787 * t3e6 + 28.679 * t4e8)) 
	- 0.067 * Math.sin(DEG_TO_RAD * (263.6238 + 381403.5993 * t - 228.841 * t2e4 
	- 23.199 * t3e6 + 10.941 * t4e8)) 
	+ 0.055 * Math.sin(DEG_TO_RAD * (21.6203 - 1082124.7597 * t - 605.023 * t2e4 
	- 78.757 * t3e6 + 37.246 * t4e8)) 
	+ 0.055 * Math.sin(DEG_TO_RAD * (308.4192 - 489205.1674 * t + 158.029 * t2e4 
	+ 14.915 * t3e6 -7.029 * t4e8)) 
	- 0.054 * Math.sin(DEG_TO_RAD * (8.7216 + 1589477.9094 * t - 702.824 * t2e4 
	- 67.766 * t3e6 + 31.939 * t4e8)) 
	- 0.052 * Math.sin(DEG_TO_RAD * (179.8536 + 1908795.4705 * t + 359.881 * t2e4 
	+ 57.390 * t3e6 - 27.189 * t4e8)) 
	- 0.050 * Math.sin(DEG_TO_RAD * (98.7948 + 635080.1741 * t - 882.765 * t2e4 
	- 96.461 * t3e6 + 45.533 * t4e8)) 
	- 0.049 * Math.sin(DEG_TO_RAD * (128.6604 - 95795.2683 * t - 318.812 * t2e4 
	- 37.547 * t3e6 + 17.738 * t4e8)) 
	- 0.047 * Math.sin(DEG_TO_RAD * (17.3544 + 425341.6552 * t - 370.570 * t2e4 
	- 39.946 * t3e6 + 18.854 * t4e8)) 
	- 0.044 * Math.sin(DEG_TO_RAD * (160.4159 + 4067.2942 * t - 107.806 * t2e4 
	- 12.475 * t3e6 + 5.913 * t4e8)) 
	- 0.043 * Math.sin(DEG_TO_RAD * (238.1713 + 854535.1727 * t - 31.065 * t2e4 
	+ 3.623 * t3e6 - 1.769 * t4e8)) 
	+ 0.042 * Math.sin(DEG_TO_RAD * (270.4555 + 1140143.5037 * t - 578.718 * t2e4 
	- 57.123 * t3e6 + 26.911 * t4e8)) 
	- 0.042 * Math.sin(DEG_TO_RAD * (132.4925 + 513197.9179 * t + 88.434 * t2e4 
	+ 14.388 * t3e6 - 6.797 * t4e8)) 
	- 0.041 * Math.sin(DEG_TO_RAD * (122.3573 - 668789.4043 * t - 727.594 * t2e4 
	- 89.441 * t3e6 + 42.274 * t4e8)) 
	- 0.040 * Math.sin(DEG_TO_RAD * (105.6788 + 341337.2548 * t - 119.499 * t2e4 
	- 10.765 * t3e6 + 5.028 * t4e8)) 
	+ 0.038 * Math.sin(DEG_TO_RAD * (135.4921 + 662944.6361 * t - 668.688 * t2e4 
	- 71.470 * t3e6 + 33.708 * t4e8)) 
	- 0.037 * Math.sin(DEG_TO_RAD * (242.3910 - 51857.2124 * t - 460.540 * t2e4 
	- 54.293 * t3e6 + 25.652 * t4e8)) 
	+ 0.036 * Math.sin(DEG_TO_RAD * (336.4374 +  1303869.5784 * t - 155.171 * t2e4 
	- 7.020 * t3e6 + 3.259 * t4e8)) 
	+ 0.035 * Math.sin(DEG_TO_RAD * (223.0943 - 255454.0489 * t - 850.164 * t2e4 
	- 100.124 * t3e6 + 47.302 * t4e8)) 
	- 0.034 * Math.sin(DEG_TO_RAD * (193.2811 - 577061.4302 * t - 300.976 * t2e4 
	- 39.419 * t3e6 + 18.623 * t4e8)) 
	+ 0.031 * Math.sin(DEG_TO_RAD * (87.6023 - 918398.6850 * t - 181.476 * t2e4 
	- 28.654 * t3e6 + 13.594 * t4e8));

	var spp = 2.4 * Math.sin(DEG_TO_RAD * (103.2 + 377336.3 * t));

	var lp = 83.353 + 4069.0137 * t - 103.238 * t2e4 
	- 12.492 * t3e6 + 5.263 * t4e8 + sp + 1e-3 * t * spp;

	//% longitude of the ascending node

	var sr = - 1.4979 * Math.sin(DEG_TO_RAD * (49.1562 - 75869.8120 * t + 35.458 * t2e4 
	+ 4.231 * t3e6 - 2.001 * t4e8)) 
	- 0.1500 * Math.sin(DEG_TO_RAD * (357.5291 + 35999.0503 * t - 1.536 * t2e4 
	+ 0.041 * t3e6 + 0.000 * t4e8)) 
	- 0.1226 * Math.sin(DEG_TO_RAD * (235.7004 + 890534.2230 * t - 32.601 * t2e4 
	+ 3.664 * t3e6 - 1.769 * t4e8)) 
	+ 0.1176 * Math.sin(DEG_TO_RAD * (186.5442 + 966404.0351 * t - 68.058 * t2e4 
	- 0.567 * t3e6 + 0.232 * t4e8)) 
	- 0.0801 * Math.sin(DEG_TO_RAD * (83.3826 - 12006.2998 * t + 247.999 * t2e4 
	+ 29.262 * t3e6 - 13.826 * t4e8)) 
	- 0.0616 * Math.sin(DEG_TO_RAD * (51.6271 - 111868.8623 * t + 36.994 * t2e4 
	+ 4.190 * t3e6 - 2.001 * t4e8)) 
	+ 0.0490 * Math.sin(DEG_TO_RAD * (100.7370 + 413335.3554 * t - 122.571 * t2e4 
	- 10.684 * t3e6 + 5.028 * t4e8)) 
	+ 0.0409 * Math.sin(DEG_TO_RAD * (308.4192 - 489205.1674 * t + 158.029 * t2e4 
	+ 14.915 * t3e6 - 7.029 * t4e8)) 
	+ 0.0327 * Math.sin(DEG_TO_RAD * (134.9634 + 477198.8676 * t + 89.970 * t2e4 
	+ 14.348 * t3e6 - 6.797 * t4e8)) 
	+ 0.0324 * Math.sin(DEG_TO_RAD * (46.6853 - 39870.7617 * t + 33.922 * t2e4 
	+ 4.272 * t3e6 - 2.001 * t4e8)) 
	+ 0.0196 * Math.sin(DEG_TO_RAD * (98.3124 - 151739.6240 * t + 70.916 * t2e4 
	+ 8.462 * t3e6 - 4.001 * t4e8)) 
	+ 0.0180 * Math.sin(DEG_TO_RAD * (274.1928 - 553068.6797 * t - 54.513 * t2e4 
	- 10.116 * t3e6 + 4.797 * t4e8)) 
	+ 0.0150 * Math.sin(DEG_TO_RAD * (325.7736 - 63863.5122 * t - 212.541 * t2e4 
	- 25.031 * t3e6 + 11.826 * t4e8)) 
	- 0.0150 * Math.sin(DEG_TO_RAD * (184.1196 + 401329.0556 * t + 125.428 * t2e4 
	+ 18.579 * t3e6 - 8.798 * t4e8)) 
	- 0.0078 * Math.sin(DEG_TO_RAD * (238.1713 + 854535.1727 * t - 31.065 * t2e4 
	+ 3.623 * t3e6 - 1.769 * t4e8)) 
	- 0.0045 * Math.sin(DEG_TO_RAD * (10.6638 + 1367733.0907 * t + 57.370 * t2e4 
	+ 18.011 * t3e6 - 8.566 * t4e8)) 
	+ 0.0044 * Math.sin(DEG_TO_RAD * (321.5076 + 1443602.9027 * t + 21.912 * t2e4 
	+ 13.780 * t3e6 - 6.566 * t4e8)) 
	- 0.0042 * Math.sin(DEG_TO_RAD * (162.8868 - 31931.7561 * t - 106.271 * t2e4 
	- 12.516 * t3e6 + 5.913 * t4e8)) 
	- 0.0031 * Math.sin(DEG_TO_RAD * (170.9849 - 930404.9848 * t + 66.523 * t2e4 
	+ 0.608 * t3e6 - 0.232 * t4e8)) 
	+ 0.0031 * Math.sin(DEG_TO_RAD * (103.2079 + 377336.3051 * t - 121.035 * t2e4 
	- 10.724 * t3e6 + 5.028 * t4e8)) 
	+ 0.0029 * Math.sin(DEG_TO_RAD * (222.6120 - 1042273.8471 * t + 103.516 * t2e4 
	+ 4.798 * t3e6 - 2.232 * t4e8)) 
	+ 0.0028 * Math.sin(DEG_TO_RAD * (184.0733 + 1002403.0853 * t - 69.594 * t2e4 
	- 0.526 * t3e6 + 0.232 * t4e8));

	var srp = 25.9 * Math.sin(DEG_TO_RAD * (125.0 - 1934.1 * t)) 
		- 4.3 * Math.sin(DEG_TO_RAD * (220.2 - 1935.5 * t));

	var srpp = 0.38 * Math.sin(DEG_TO_RAD * (357.5 + 35999.1 * t));

	var raan = 125.0446 - 1934.13618 * t + 20.762 * t2e4 
		+ 2.139 * t3e6 - 1.650 * t4e8 + sr 
		+ 1e-3 * (srp + srpp * t);

	//% mean longitude

	var sl = - 0.92581 * Math.sin(DEG_TO_RAD * (235.7004 + 890534.2230 * t - 32.601 * t2e4 
	+ 3.664 * t3e6 - 1.769 * t4e8)) 
	+ 0.33262 * Math.sin(DEG_TO_RAD * (100.7370 + 413335.3554 * t - 122.571 * t2e4 
	- 10.684 * t3e6 + 5.028 * t4e8)) 
	- 0.18402 * Math.sin(DEG_TO_RAD * (357.5291 + 35999.0503 * t - 1.536 * t2e4 
	+ 0.041 * t3e6 + 0.000 * t4e8)) 
	+ 0.11007 * Math.sin(DEG_TO_RAD * (134.9634 + 477198.8676 * t + 89.970 * t2e4 
	+ 14.348 * t3e6 - 6.797 * t4e8)) 
	- 0.06055 * Math.sin(DEG_TO_RAD * (238.1713 + 854535.1727 * t - 31.065 * t2e4 
	+ 3.623 * t3e6 - 1.769 * t4e8)) 
	+ 0.04741 * Math.sin(DEG_TO_RAD * (325.7736 - 63863.5122 * t - 212.541 * t2e4 
	- 25.031 * t3e6 + 11.826 * t4e8)) 
	- 0.03086 * Math.sin(DEG_TO_RAD * (10.6638 + 1367733.0907 * t + 57.370 * t2e4 
	+ 18.011 * t3e6 - 8.566 * t4e8)) 
	+ 0.02184 * Math.sin(DEG_TO_RAD * (103.2079 + 377336.3051 * t - 121.035 * t2e4 
	- 10.724 * t3e6 + 5.028 * t4e8)) 
	+ 0.01645 * Math.sin(DEG_TO_RAD * (49.1562 - 75869.8120 * t + 35.458 * t2e4 
	+ 4.231 * t3e6 - 2.001 * t4e8)) 
	+ 0.01022 * Math.sin(DEG_TO_RAD * (233.2295 + 926533.2733 * t - 34.136 * t2e4 
	+ 3.705 * t3e6 - 1.769 * t4e8)) 
	- 0.00756 * Math.sin(DEG_TO_RAD * (336.4374 + 1303869.5784 * t - 155.171 * t2e4 
	- 7.020 * t3e6 + 3.259 * t4e8)) 
	- 0.00530 * Math.sin(DEG_TO_RAD * (222.5657 - 441199.8173 * t - 91.506 * t2e4 
	- 14.307 * t3e6 + 6.797 * t4e8)) 
	- 0.00496 * Math.sin(DEG_TO_RAD * (162.8868 - 31931.7561 * t - 106.271 * t2e4 
	- 12.516 * t3e6 + 5.913 * t4e8)) 
	- 0.00472 * Math.sin(DEG_TO_RAD * (297.8502 + 445267.1115 * t - 16.300 * t2e4 
	+ 1.832 * t3e6 - 0.884 * t4e8)) 
	- 0.00271 * Math.sin(DEG_TO_RAD * (240.6422 + 818536.1225 * t - 29.529 * t2e4 
	+ 3.582 * t3e6 - 1.769 * t4e8)) 
	+ 0.00264 * Math.sin(DEG_TO_RAD * (132.4925 + 513197.9179 * t + 88.434 * t2e4 
	+ 14.388 * t3e6 - 6.797 * t4e8)) 
	- 0.00254 * Math.sin(DEG_TO_RAD * (186.5442 + 966404.0351 * t - 68.058 * t2e4 
	- 0.567 * t3e6 + 0.232 * t4e8)) 
	+ 0.00234 * Math.sin(DEG_TO_RAD * (269.9268 + 954397.7353 * t + 179.941 * t2e4 
	+ 28.695 * t3e6 - 13.594 * t4e8)) 
	- 0.00220 * Math.sin(DEG_TO_RAD * (13.1347 + 1331734.0404 * t + 58.906 * t2e4 
	+ 17.971 * t3e6 - 8.566 * t4e8)) 
	- 0.00202 * Math.sin(DEG_TO_RAD * (355.0582 + 71998.1006 * t - 3.072 * t2e4 
	+ 0.082 * t3e6 + 0.000 * t4e8)) 
	+ 0.00167 * Math.sin(DEG_TO_RAD * (328.2445 - 99862.5625 * t - 211.005 * t2e4 
	- 25.072 * t3e6 + 11.826 * t4e8)) 
	- 0.00143 * Math.sin(DEG_TO_RAD * (173.5506 + 1335801.3346 * t - 48.901 * t2e4 
	+ 5.496 * t3e6 - 2.653 * t4e8)) 
	- 0.00121 * Math.sin(DEG_TO_RAD * (98.2661 + 449334.4057 * t - 124.107 * t2e4 
	- 10.643 * t3e6 + 5.028 * t4e8)) 
	- 0.00116 * Math.sin(DEG_TO_RAD * (145.6272 + 1844931.9583 * t + 147.340 * t2e4 
	+ 32.359 * t3e6 - 15.363 * t4e8)) 
	+ 0.00102 * Math.sin(DEG_TO_RAD * (105.6788 + 341337.2548 * t - 119.499 * t2e4 
	- 10.765 * t3e6 + 5.028 * t4e8)) 
	- 0.00090 * Math.sin(DEG_TO_RAD * (184.1196 + 401329.0556 * t + 125.428 * t2e4 
	+ 18.579 * t3e6 - 8.798 * t4e8)) 
	- 0.00086 * Math.sin(DEG_TO_RAD * (338.9083 + 1267870.5281 * t - 153.636 * t2e4 
	- 7.061 * t3e6 + 3.259 * t4e8)) 
	- 0.00078 * Math.sin(DEG_TO_RAD * (111.4008 + 1781068.4461 * t - 65.201 * t2e4 
	+ 7.328 * t3e6 - 3.538 * t4e8)) 
	+ 0.00069 * Math.sin(DEG_TO_RAD * (323.3027 - 27864.4619 * t - 214.077 * t2e4 
	- 24.990 * t3e6 + 11.826 * t4e8)) 
	+ 0.00066 * Math.sin(DEG_TO_RAD * (51.6271 - 111868.8623 * t + 36.994 * t2e4 
	+ 4.190 * t3e6 - 2.001 * t4e8)) 
	+ 0.00065 * Math.sin(DEG_TO_RAD * (38.5872 + 858602.4669 * t - 138.871 * t2e4 
	- 8.852 * t3e6 + 4.144 * t4e8)) 
	- 0.00060 * Math.sin(DEG_TO_RAD * (83.3826 - 12006.2998 * t + 247.999 * t2e4 
	+ 29.262 * t3e6 - 13.826 * t4e8)) 
	+ 0.00054 * Math.sin(DEG_TO_RAD * (201.4740 + 826670.7108 * t - 245.142 * t2e4 
	- 21.367 * t3e6 + 10.057 * t4e8)) 
	- 0.00052 * Math.sin(DEG_TO_RAD * (308.4192 - 489205.1674 * t + 158.029 * t2e4 
	+ 14.915 * t3e6 - 7.029 * t4e8)) 
	+ 0.00048 * Math.sin(DEG_TO_RAD * (8.1929 + 1403732.1410 * t + 55.834 * t2e4 
	+ 18.052 * t3e6 - 8.566 * t4e8)) 
	- 0.00041 * Math.sin(DEG_TO_RAD * (46.6853 - 39870.7617 * t + 33.922 * t2e4 
	+ 4.272 * t3e6 - 2.001 * t4e8)) 
	- 0.00033 * Math.sin(DEG_TO_RAD * (274.1928 - 553068.6797 * t - 54.513 * t2e4 
	- 10.116 * t3e6 + 4.797 * t4e8)) 
	+ 0.00030 * Math.sin(DEG_TO_RAD * (160.4159 + 4067.2942 * t - 107.806 * t2e4 
	- 12.475 * t3e6 + 5.913 * t4e8));

	var slp = 3.96 * Math.sin(DEG_TO_RAD * (119.7 + 131.8 * t)) 
		+ 1.96 * Math.sin(DEG_TO_RAD * (125.0 - 1934.1 * t));

	var slpp = 0.463 * Math.sin(DEG_TO_RAD * (357.5 + 35999.1 * t)) 
		+ 0.152 * Math.sin(DEG_TO_RAD * (238.2 + 854535.2 * t)) 
		- 0.071 * Math.sin(DEG_TO_RAD * (27.8 + 131.8 * t)) 
		- 0.055 * Math.sin(DEG_TO_RAD * (103.2 + 377336.3 * t)) 
		- 0.026 * Math.sin(DEG_TO_RAD * (233.2 + 926533.3 * t));

	var slppp = 14 * Math.sin(DEG_TO_RAD * (357.5 + 35999.1 * t)) 
		+ 5 * Math.sin(DEG_TO_RAD * (238.2 + 854535.2 * t));

	var lambda = 218.31665 + 481267.88134 * t - 13.268 * t2e4 
		+ 1.856 * t3e6 - 1.534 * t4e8 + sl 
		+ 1e-3 * (slp + slpp * t + slppp * t2e4);

	var computed = {
		a : sma * 1000,
		e : ecc,
		i : 2.0 * Math.asin(gamma) * RAD_TO_DEG,
		w : ( (lp - raan)) % 360,
		o : ( raan) % 360,
		M : ( (lambda - lp)) %  360
	};
	
	return computed;


};

},{"ns":6}],6:[function(require,module,exports){
/*
	Global vars
*/

'use strict';
module.exports = {
	//gravitational constant to measure the force with masses in kg and radii in meters N(m/kg)^2
	G : 6.6742e-11,
	//astronomical unit in km
	AU : 149597870,
	CIRCLE : 2 * Math.PI,
	KM : 1000,
	DEG_TO_RAD : Math.PI/180,
	RAD_TO_DEG : 180/Math.PI,
	NM_TO_KM : 1.852,
	LB_TO_KG : 0.453592,
	LBF_TO_NEWTON : 4.44822162,
	FT_TO_M : 0.3048,
	//duration in seconds
	DAY : 60 * 60 * 24,
	//duration in days
	YEAR : 365.25,
	//duration in days
	CENTURY : 100 * 365.25,
	SIDERAL_DAY : 3600 * 23.9344696,
	J2000 : new Date('2000-01-01T12:00:00-00:00'),
	getEpochTime : function(userDate) {
		userDate = userDate || new Date();
		return ((userDate - this.J2000) / 1000) ;
	}
};

},{}],7:[function(require,module,exports){

'use strict';

var ns = require('ns');
var Utils = require('./Utils');
var THREE = require('./Three.shim');
var CMath = require('./Math');

var maxIterationsForEccentricAnomaly = 10;
var maxDE = 1e-15;

var solveEccentricAnomaly = function(f, x0, maxIter) {
		
	var x = 0;
	var x2 = x0;
	
	for (var i = 0; i < maxIter; i++) {
		x = x2;
		x2 = f(x);
	}
	
	return x2;
}

var solveKepler = function(e, M) {
	return function(x) {
		return x + (M + e * Math.sin(x) - x) / (1 - e * Math.cos(x));
	};
};

var solveKeplerLaguerreConway = function(e, M) {
	return function(x) {
		var s = e * Math.sin(x);
		var c = e * Math.cos(x);
		var f = x - s - M;
		var f1 = 1 - c;
		var f2 = s;

		x += -5 * f / (f1 + CMath.sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2)));
		return x;
	};
};

var solveKeplerLaguerreConwayHyp = function(e, M) {
	return function(x) {
		var s = e * CMath.sinh(x);
		var c = e * CMath.cosh(x);
		var f = x - s - M;
		var f1 = c - 1;
		var f2 = s;

		x += -5 * f / (f1 + CMath.sign(f1) * Math.sqrt(Math.abs(16 * f1 * f1 - 20 * f * f2)));
		return x;
	};
};

module.exports = {
	setDefaultOrbit : function(orbitalElements, calculator) {
		this.orbitalElements = orbitalElements;
		if(orbitalElements && orbitalElements.epoch) {
			this.epochCorrection = ns.getEpochTime(orbitalElements.epoch);
		}
		this.calculator = calculator;
	},

	setName : function(name){
		this.name = name;
	},

	calculateVelocity : function(timeEpoch, relativeTo, isFromDelta) {
		if(!this.orbitalElements) return new THREE.Vector3(0,0,0);

		var eclipticVelocity;
		
		if ( isFromDelta ) {
			var pos1 = this.calculatePosition(timeEpoch);
			var pos2 = this.calculatePosition(timeEpoch + 60);
			eclipticVelocity = pos2.sub(pos1).multiplyScalar(1/60);
		} else {
			//vis viva to calculate speed (not velocity, i.e not a vector)
			var el = this.calculateElements(timeEpoch);
			var speed = Math.sqrt(ns.G * require('./SolarSystem').getBody(relativeTo).mass * ((2 / (el.r)) - (1 / (el.a))));

			//now calculate velocity orientation, that is, a vector tangent to the orbital ellipse
			var k = el.r / el.a;
			var o = ((2 - (2 * el.e * el.e)) / (k * (2-k)))-1;
			//floating point imprecision
			o = o > 1 ? 1 : o;
			var alpha = Math.PI - Math.acos(o);
			alpha = el.v < 0 ? (2 * Math.PI) - alpha  : alpha;
			var velocityAngle = el.v + (alpha / 2);
			//velocity vector in the plane of the orbit
			var orbitalVelocity = new THREE.Vector3(Math.cos(velocityAngle), Math.sin(velocityAngle)).setLength(speed);
			var velocityEls = Utils.extend({}, el, {pos:orbitalVelocity, v:null, r:null});
			eclipticVelocity = this.getPositionFromElements(velocityEls);
		}

		//var diff = eclipticVelocityFromDelta.sub(eclipticVelocity);console.log(diff.length());
		return eclipticVelocity;
		
	},

	calculatePosition : function(timeEpoch) {
		if(!this.orbitalElements) return new THREE.Vector3(0,0,0);
		var computed = this.calculateElements(timeEpoch);
		var pos =  this.getPositionFromElements(computed);
		return pos;
	},

	solveEccentricAnomaly : function(e, M){
		if (e == 0.0) {
			return M;
		}  else if (e < 0.9) {
			var sol = solveEccentricAnomaly(solveKepler(e, M), M, 6);
			return sol;
		} else if (e < 1.0) {
			var E = M + 0.85 * e * ((Math.sin(M) >= 0.0) ? 1 : -1);
			var sol = solveEccentricAnomaly(solveKeplerLaguerreConway(e, M), E, 8);
			return sol;
		} else if (e == 1.0) {
			return M;
		} else {
			var E = Math.log(2 * M / e + 1.85);
			var sol = solveEccentricAnomaly(solveKeplerLaguerreConwayHyp(e, M), E, 30);
			return sol;
		}
	},

	calculateElements : function(timeEpoch, forcedOrbitalElements) {
		if(!forcedOrbitalElements && !this.orbitalElements) return null;

		var orbitalElements = forcedOrbitalElements || this.orbitalElements;

		/*

		Epoch : J2000

		a 	Semi-major axis
	    e 	Eccentricity
	    i 	Inclination
	    o 	Longitude of Ascending Node (Ω)
	    w 	Argument of periapsis (ω)
		E 	Eccentric Anomaly
	    T 	Time at perihelion
	    M	Mean anomaly
	    l 	Mean Longitude
	    lp	longitude of periapsis
	    r	distance du centre
	    v	true anomaly

	    P	Sidereal period (mean value)
		Pw	Argument of periapsis precession period (mean value)
		Pn	Longitude of the ascending node precession period (mean value)

	    */
	    if (this.epochCorrection) {
	    	timeEpoch -= this.epochCorrection;
	    }
		var tDays = timeEpoch / ns.DAY;
		var T = tDays / ns.CENTURY ;
		//console.log(T);
		var computed = {
			t : timeEpoch
		};

		if(this.calculator && !forcedOrbitalElements) {
			var realorbit = this.calculator(T);
			Utils.extend(computed, realorbit);
		} else {

			if (orbitalElements.base) {
				var variation;
				for(var el in orbitalElements.base) {
					//cy : variation by century.
					//day : variation by day.
					variation = orbitalElements.cy ? orbitalElements.cy[el] : (orbitalElements.day[el] * ns.CENTURY);
					variation = variation || 0;
					computed[el] = orbitalElements.base[el] + (variation * T);
				}
			} else {
				computed = Utils.extend({}, orbitalElements);
			}

			if (undefined === computed.w) {
				computed.w = computed.lp - computed.o;
			}

			if (undefined === computed.M) {
				computed.M = computed.l - computed.lp;
			}

			computed.a = computed.a * ns.KM;//was in km, set it in m
		}


		computed.i = ns.DEG_TO_RAD * computed.i;
		computed.o = ns.DEG_TO_RAD * computed.o;
		computed.w = ns.DEG_TO_RAD * computed.w;
		computed.M = ns.DEG_TO_RAD * computed.M;

		computed.E = this.solveEccentricAnomaly(computed.e, computed.M);

		computed.E = computed.E % ns.CIRCLE;
		computed.i = computed.i % ns.CIRCLE;
		computed.o = computed.o % ns.CIRCLE;
		computed.w = computed.w % ns.CIRCLE;
		computed.M = computed.M % ns.CIRCLE;

		//in the plane of the orbit
		computed.pos = new THREE.Vector3(computed.a * (Math.cos(computed.E) - computed.e), computed.a * (Math.sqrt(1 - (computed.e*computed.e))) * Math.sin(computed.E));

		computed.r = computed.pos.length();
		computed.v = Math.atan2(computed.pos.y, computed.pos.x);
		if(orbitalElements.relativeTo) {
			var relativeTo = require('./SolarSystem').getBody(orbitalElements.relativeTo);
			if(relativeTo.tilt) {
				computed.tilt = -relativeTo.tilt * ns.DEG_TO_RAD;
			}
		};
		return computed;
	},

	getPositionFromElements : function(computed) {

		if(!computed) return new THREE.Vector3(0,0,0);

		var a1 = new THREE.Euler(computed.tilt || 0, 0, computed.o, 'XYZ');
		var q1 = new THREE.Quaternion().setFromEuler(a1);
		var a2 = new THREE.Euler(computed.i, 0, computed.w, 'XYZ');
		var q2 = new THREE.Quaternion().setFromEuler(a2);

		var planeQuat = new THREE.Quaternion().multiplyQuaternions(q1, q2);
		computed.pos.applyQuaternion(planeQuat);
		return computed.pos;
	},

	calculatePeriod : function(elements, relativeTo) {
		var period;
		if(this.orbitalElements && this.orbitalElements.day && this.orbitalElements.day.M) {
			period = 360 / this.orbitalElements.day.M ;
		}else if(require('./SolarSystem').getBody(relativeTo) && require('./SolarSystem').getBody(relativeTo).k && elements) {
			period = 2 * Math.PI * Math.sqrt(Math.pow(elements.a/(ns.AU*1000), 3)) / require('./SolarSystem').getBody(relativeTo).k;
		}
		period *= ns.DAY;//in seconds
		return period;
	}
};

},{"./Math":4,"./SolarSystem":8,"./Three.shim":9,"./Utils":10,"ns":6}],8:[function(require,module,exports){
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
},{"./CelestialBody":2,"./Definitions":3,"./Utils":10,"ns":6}],9:[function(require,module,exports){
(function (global){

'use strict';

var THREE = global.THREE = {};

require('../vendor/three/math/Vector3');
require('../vendor/three/math/Quaternion');
require('../vendor/three/math/Euler');

module.exports = THREE;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../vendor/three/math/Euler":11,"../vendor/three/math/Quaternion":12,"../vendor/three/math/Vector3":13}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */

THREE.Euler = function ( x, y, z, order ) {

	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._order = order || THREE.Euler.DefaultOrder;

};

THREE.Euler.RotationOrders = [ 'XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX' ];

THREE.Euler.DefaultOrder = 'XYZ';

THREE.Euler.prototype = {

	constructor: THREE.Euler,

	_x: 0, _y: 0, _z: 0, _order: THREE.Euler.DefaultOrder,

	get x () {

		return this._x;

	},

	set x ( value ) {

		this._x = value;
		this.onChangeCallback();

	},

	get y () {

		return this._y;

	},

	set y ( value ) {

		this._y = value;
		this.onChangeCallback();

	},

	get z () {

		return this._z;

	},

	set z ( value ) {

		this._z = value;
		this.onChangeCallback();

	},

	get order () {

		return this._order;

	},

	set order ( value ) {

		this._order = value;
		this.onChangeCallback();

	},

	set: function ( x, y, z, order ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._order = order || this._order;

		this.onChangeCallback();

		return this;

	},

	copy: function ( euler ) {

		this._x = euler._x;
		this._y = euler._y;
		this._z = euler._z;
		this._order = euler._order;

		this.onChangeCallback();

		return this;

	},

	setFromRotationMatrix: function ( m, order, update ) {

		var clamp = THREE.Math.clamp;

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		var te = m.elements;
		var m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ];
		var m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ];
		var m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ];

		order = order || this._order;

		if ( order === 'XYZ' ) {

			this._y = Math.asin( clamp( m13, - 1, 1 ) );

			if ( Math.abs( m13 ) < 0.99999 ) {

				this._x = Math.atan2( - m23, m33 );
				this._z = Math.atan2( - m12, m11 );

			} else {

				this._x = Math.atan2( m32, m22 );
				this._z = 0;

			}

		} else if ( order === 'YXZ' ) {

			this._x = Math.asin( - clamp( m23, - 1, 1 ) );

			if ( Math.abs( m23 ) < 0.99999 ) {

				this._y = Math.atan2( m13, m33 );
				this._z = Math.atan2( m21, m22 );

			} else {

				this._y = Math.atan2( - m31, m11 );
				this._z = 0;

			}

		} else if ( order === 'ZXY' ) {

			this._x = Math.asin( clamp( m32, - 1, 1 ) );

			if ( Math.abs( m32 ) < 0.99999 ) {

				this._y = Math.atan2( - m31, m33 );
				this._z = Math.atan2( - m12, m22 );

			} else {

				this._y = 0;
				this._z = Math.atan2( m21, m11 );

			}

		} else if ( order === 'ZYX' ) {

			this._y = Math.asin( - clamp( m31, - 1, 1 ) );

			if ( Math.abs( m31 ) < 0.99999 ) {

				this._x = Math.atan2( m32, m33 );
				this._z = Math.atan2( m21, m11 );

			} else {

				this._x = 0;
				this._z = Math.atan2( - m12, m22 );

			}

		} else if ( order === 'YZX' ) {

			this._z = Math.asin( clamp( m21, - 1, 1 ) );

			if ( Math.abs( m21 ) < 0.99999 ) {

				this._x = Math.atan2( - m23, m22 );
				this._y = Math.atan2( - m31, m11 );

			} else {

				this._x = 0;
				this._y = Math.atan2( m13, m33 );

			}

		} else if ( order === 'XZY' ) {

			this._z = Math.asin( - clamp( m12, - 1, 1 ) );

			if ( Math.abs( m12 ) < 0.99999 ) {

				this._x = Math.atan2( m32, m22 );
				this._y = Math.atan2( m13, m11 );

			} else {

				this._x = Math.atan2( - m23, m33 );
				this._y = 0;

			}

		} else {

			THREE.warn( 'THREE.Euler: .setFromRotationMatrix() given unsupported order: ' + order )

		}

		this._order = order;

		if ( update !== false ) this.onChangeCallback();

		return this;

	},

	setFromQuaternion: function () {

		var matrix;

		return function ( q, order, update ) {

			if ( matrix === undefined ) matrix = new THREE.Matrix4();
			matrix.makeRotationFromQuaternion( q );
			this.setFromRotationMatrix( matrix, order, update );

			return this;

		};

	}(),

	setFromVector3: function ( v, order ) {

		return this.set( v.x, v.y, v.z, order || this._order );

	},

	reorder: function () {

		// WARNING: this discards revolution information -bhouston

		var q = new THREE.Quaternion();

		return function ( newOrder ) {

			q.setFromEuler( this );
			this.setFromQuaternion( q, newOrder );

		};

	}(),

	equals: function ( euler ) {

		return ( euler._x === this._x ) && ( euler._y === this._y ) && ( euler._z === this._z ) && ( euler._order === this._order );

	},

	fromArray: function ( array ) {

		this._x = array[ 0 ];
		this._y = array[ 1 ];
		this._z = array[ 2 ];
		if ( array[ 3 ] !== undefined ) this._order = array[ 3 ];

		this.onChangeCallback();

		return this;

	},

	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._order;

		return array;
	},

	toVector3: function ( optionalResult ) {

		if ( optionalResult ) {

			return optionalResult.set( this._x, this._y, this._z );

		} else {

			return new THREE.Vector3( this._x, this._y, this._z );

		}

	},

	onChange: function ( callback ) {

		this.onChangeCallback = callback;

		return this;

	},

	onChangeCallback: function () {},

	clone: function () {

		return new THREE.Euler( this._x, this._y, this._z, this._order );

	}

};

},{}],12:[function(require,module,exports){
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://exocortex.com
 */

THREE.Quaternion = function ( x, y, z, w ) {

	this._x = x || 0;
	this._y = y || 0;
	this._z = z || 0;
	this._w = ( w !== undefined ) ? w : 1;

};

THREE.Quaternion.prototype = {

	constructor: THREE.Quaternion,

	_x: 0,_y: 0, _z: 0, _w: 0,

	get x () {

		return this._x;

	},

	set x ( value ) {

		this._x = value;
		this.onChangeCallback();

	},

	get y () {

		return this._y;

	},

	set y ( value ) {

		this._y = value;
		this.onChangeCallback();

	},

	get z () {

		return this._z;

	},

	set z ( value ) {

		this._z = value;
		this.onChangeCallback();

	},

	get w () {

		return this._w;

	},

	set w ( value ) {

		this._w = value;
		this.onChangeCallback();

	},

	set: function ( x, y, z, w ) {

		this._x = x;
		this._y = y;
		this._z = z;
		this._w = w;

		this.onChangeCallback();

		return this;

	},

	copy: function ( quaternion ) {

		this._x = quaternion.x;
		this._y = quaternion.y;
		this._z = quaternion.z;
		this._w = quaternion.w;

		this.onChangeCallback();

		return this;

	},

	setFromEuler: function ( euler, update ) {

		if ( euler instanceof THREE.Euler === false ) {

			throw new Error( 'THREE.Quaternion: .setFromEuler() now expects a Euler rotation rather than a Vector3 and order.' );
		}

		// http://www.mathworks.com/matlabcentral/fileexchange/
		// 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
		//	content/SpinCalc.m

		var c1 = Math.cos( euler._x / 2 );
		var c2 = Math.cos( euler._y / 2 );
		var c3 = Math.cos( euler._z / 2 );
		var s1 = Math.sin( euler._x / 2 );
		var s2 = Math.sin( euler._y / 2 );
		var s3 = Math.sin( euler._z / 2 );

		if ( euler.order === 'XYZ' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'YXZ' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		} else if ( euler.order === 'ZXY' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'ZYX' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		} else if ( euler.order === 'YZX' ) {

			this._x = s1 * c2 * c3 + c1 * s2 * s3;
			this._y = c1 * s2 * c3 + s1 * c2 * s3;
			this._z = c1 * c2 * s3 - s1 * s2 * c3;
			this._w = c1 * c2 * c3 - s1 * s2 * s3;

		} else if ( euler.order === 'XZY' ) {

			this._x = s1 * c2 * c3 - c1 * s2 * s3;
			this._y = c1 * s2 * c3 - s1 * c2 * s3;
			this._z = c1 * c2 * s3 + s1 * s2 * c3;
			this._w = c1 * c2 * c3 + s1 * s2 * s3;

		}

		if ( update !== false ) this.onChangeCallback();

		return this;

	},

	setFromAxisAngle: function ( axis, angle ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

		// assumes axis is normalized

		var halfAngle = angle / 2, s = Math.sin( halfAngle );

		this._x = axis.x * s;
		this._y = axis.y * s;
		this._z = axis.z * s;
		this._w = Math.cos( halfAngle );

		this.onChangeCallback();

		return this;

	},

	setFromRotationMatrix: function ( m ) {

		// http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

		// assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

		var te = m.elements,

			m11 = te[ 0 ], m12 = te[ 4 ], m13 = te[ 8 ],
			m21 = te[ 1 ], m22 = te[ 5 ], m23 = te[ 9 ],
			m31 = te[ 2 ], m32 = te[ 6 ], m33 = te[ 10 ],

			trace = m11 + m22 + m33,
			s;

		if ( trace > 0 ) {

			s = 0.5 / Math.sqrt( trace + 1.0 );

			this._w = 0.25 / s;
			this._x = ( m32 - m23 ) * s;
			this._y = ( m13 - m31 ) * s;
			this._z = ( m21 - m12 ) * s;

		} else if ( m11 > m22 && m11 > m33 ) {

			s = 2.0 * Math.sqrt( 1.0 + m11 - m22 - m33 );

			this._w = ( m32 - m23 ) / s;
			this._x = 0.25 * s;
			this._y = ( m12 + m21 ) / s;
			this._z = ( m13 + m31 ) / s;

		} else if ( m22 > m33 ) {

			s = 2.0 * Math.sqrt( 1.0 + m22 - m11 - m33 );

			this._w = ( m13 - m31 ) / s;
			this._x = ( m12 + m21 ) / s;
			this._y = 0.25 * s;
			this._z = ( m23 + m32 ) / s;

		} else {

			s = 2.0 * Math.sqrt( 1.0 + m33 - m11 - m22 );

			this._w = ( m21 - m12 ) / s;
			this._x = ( m13 + m31 ) / s;
			this._y = ( m23 + m32 ) / s;
			this._z = 0.25 * s;

		}

		this.onChangeCallback();

		return this;

	},

	setFromUnitVectors: function () {

		// http://lolengine.net/blog/2014/02/24/quaternion-from-two-vectors-final

		// assumes direction vectors vFrom and vTo are normalized

		var v1, r;

		var EPS = 0.000001;

		return function ( vFrom, vTo ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			r = vFrom.dot( vTo ) + 1;

			if ( r < EPS ) {

				r = 0;

				if ( Math.abs( vFrom.x ) > Math.abs( vFrom.z ) ) {

					v1.set( - vFrom.y, vFrom.x, 0 );

				} else {

					v1.set( 0, - vFrom.z, vFrom.y );

				}

			} else {

				v1.crossVectors( vFrom, vTo );

			}

			this._x = v1.x;
			this._y = v1.y;
			this._z = v1.z;
			this._w = r;

			this.normalize();

			return this;

		}

	}(),

	inverse: function () {

		this.conjugate().normalize();

		return this;

	},

	conjugate: function () {

		this._x *= - 1;
		this._y *= - 1;
		this._z *= - 1;

		this.onChangeCallback();

		return this;

	},

	dot: function ( v ) {

		return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;

	},

	lengthSq: function () {

		return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;

	},

	length: function () {

		return Math.sqrt( this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w );

	},

	normalize: function () {

		var l = this.length();

		if ( l === 0 ) {

			this._x = 0;
			this._y = 0;
			this._z = 0;
			this._w = 1;

		} else {

			l = 1 / l;

			this._x = this._x * l;
			this._y = this._y * l;
			this._z = this._z * l;
			this._w = this._w * l;

		}

		this.onChangeCallback();

		return this;

	},

	multiply: function ( q, p ) {

		if ( p !== undefined ) {

			THREE.warn( 'THREE.Quaternion: .multiply() now only accepts one argument. Use .multiplyQuaternions( a, b ) instead.' );
			return this.multiplyQuaternions( q, p );

		}

		return this.multiplyQuaternions( this, q );

	},

	multiplyQuaternions: function ( a, b ) {

		// from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

		var qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
		var qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

		this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
		this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
		this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
		this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

		this.onChangeCallback();

		return this;

	},

	multiplyVector3: function ( vector ) {

		THREE.warn( 'THREE.Quaternion: .multiplyVector3() has been removed. Use is now vector.applyQuaternion( quaternion ) instead.' );
		return vector.applyQuaternion( this );

	},

	slerp: function ( qb, t ) {

		if ( t === 0 ) return this;
		if ( t === 1 ) return this.copy( qb );

		var x = this._x, y = this._y, z = this._z, w = this._w;

		// http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

		var cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

		if ( cosHalfTheta < 0 ) {

			this._w = - qb._w;
			this._x = - qb._x;
			this._y = - qb._y;
			this._z = - qb._z;

			cosHalfTheta = - cosHalfTheta;

		} else {

			this.copy( qb );

		}

		if ( cosHalfTheta >= 1.0 ) {

			this._w = w;
			this._x = x;
			this._y = y;
			this._z = z;

			return this;

		}

		var halfTheta = Math.acos( cosHalfTheta );
		var sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

		if ( Math.abs( sinHalfTheta ) < 0.001 ) {

			this._w = 0.5 * ( w + this._w );
			this._x = 0.5 * ( x + this._x );
			this._y = 0.5 * ( y + this._y );
			this._z = 0.5 * ( z + this._z );

			return this;

		}

		var ratioA = Math.sin( ( 1 - t ) * halfTheta ) / sinHalfTheta,
		ratioB = Math.sin( t * halfTheta ) / sinHalfTheta;

		this._w = ( w * ratioA + this._w * ratioB );
		this._x = ( x * ratioA + this._x * ratioB );
		this._y = ( y * ratioA + this._y * ratioB );
		this._z = ( z * ratioA + this._z * ratioB );

		this.onChangeCallback();

		return this;

	},

	equals: function ( quaternion ) {

		return ( quaternion._x === this._x ) && ( quaternion._y === this._y ) && ( quaternion._z === this._z ) && ( quaternion._w === this._w );

	},

	fromArray: function ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this._x = array[ offset ];
		this._y = array[ offset + 1 ];
		this._z = array[ offset + 2 ];
		this._w = array[ offset + 3 ];

		this.onChangeCallback();

		return this;

	},

	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this._x;
		array[ offset + 1 ] = this._y;
		array[ offset + 2 ] = this._z;
		array[ offset + 3 ] = this._w;

		return array;

	},

	onChange: function ( callback ) {

		this.onChangeCallback = callback;

		return this;

	},

	onChangeCallback: function () {},

	clone: function () {

		return new THREE.Quaternion( this._x, this._y, this._z, this._w );

	}

};

THREE.Quaternion.slerp = function ( qa, qb, qm, t ) {

	return qm.copy( qa ).slerp( qb, t );

}

},{}],13:[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 * @author *kile / http://kile.stravaganza.org/
 * @author philogb / http://blog.thejit.org/
 * @author mikael emtinger / http://gomo.se/
 * @author egraether / http://egraether.com/
 * @author WestLangley / http://github.com/WestLangley
 */

THREE.Vector3 = function ( x, y, z ) {

	this.x = x || 0;
	this.y = y || 0;
	this.z = z || 0;

};

THREE.Vector3.prototype = {

	constructor: THREE.Vector3,

	set: function ( x, y, z ) {

		this.x = x;
		this.y = y;
		this.z = z;

		return this;

	},

	setX: function ( x ) {

		this.x = x;

		return this;

	},

	setY: function ( y ) {

		this.y = y;

		return this;

	},

	setZ: function ( z ) {

		this.z = z;

		return this;

	},

	setComponent: function ( index, value ) {

		switch ( index ) {

			case 0: this.x = value; break;
			case 1: this.y = value; break;
			case 2: this.z = value; break;
			default: throw new Error( 'index is out of range: ' + index );

		}

	},

	getComponent: function ( index ) {

		switch ( index ) {

			case 0: return this.x;
			case 1: return this.y;
			case 2: return this.z;
			default: throw new Error( 'index is out of range: ' + index );

		}

	},

	copy: function ( v ) {

		this.x = v.x;
		this.y = v.y;
		this.z = v.z;

		return this;

	},

	add: function ( v, w ) {

		if ( w !== undefined ) {

			THREE.warn( 'THREE.Vector3: .add() now only accepts one argument. Use .addVectors( a, b ) instead.' );
			return this.addVectors( v, w );

		}

		this.x += v.x;
		this.y += v.y;
		this.z += v.z;

		return this;

	},

	addScalar: function ( s ) {

		this.x += s;
		this.y += s;
		this.z += s;

		return this;

	},

	addVectors: function ( a, b ) {

		this.x = a.x + b.x;
		this.y = a.y + b.y;
		this.z = a.z + b.z;

		return this;

	},

	sub: function ( v, w ) {

		if ( w !== undefined ) {

			THREE.warn( 'THREE.Vector3: .sub() now only accepts one argument. Use .subVectors( a, b ) instead.' );
			return this.subVectors( v, w );

		}

		this.x -= v.x;
		this.y -= v.y;
		this.z -= v.z;

		return this;

	},
	
	subScalar: function ( s ) {

		this.x -= s;
		this.y -= s;
		this.z -= s;

		return this;

	},

	subVectors: function ( a, b ) {

		this.x = a.x - b.x;
		this.y = a.y - b.y;
		this.z = a.z - b.z;

		return this;

	},

	multiply: function ( v, w ) {

		if ( w !== undefined ) {

			THREE.warn( 'THREE.Vector3: .multiply() now only accepts one argument. Use .multiplyVectors( a, b ) instead.' );
			return this.multiplyVectors( v, w );

		}

		this.x *= v.x;
		this.y *= v.y;
		this.z *= v.z;

		return this;

	},

	multiplyScalar: function ( scalar ) {

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;

	},

	multiplyVectors: function ( a, b ) {

		this.x = a.x * b.x;
		this.y = a.y * b.y;
		this.z = a.z * b.z;

		return this;

	},

	applyEuler: function () {

		var quaternion;

		return function ( euler ) {

			if ( euler instanceof THREE.Euler === false ) {

				THREE.error( 'THREE.Vector3: .applyEuler() now expects a Euler rotation rather than a Vector3 and order.' );

			}

			if ( quaternion === undefined ) quaternion = new THREE.Quaternion();

			this.applyQuaternion( quaternion.setFromEuler( euler ) );

			return this;

		};

	}(),

	applyAxisAngle: function () {

		var quaternion;

		return function ( axis, angle ) {

			if ( quaternion === undefined ) quaternion = new THREE.Quaternion();

			this.applyQuaternion( quaternion.setFromAxisAngle( axis, angle ) );

			return this;

		};

	}(),

	applyMatrix3: function ( m ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 3 ] * y + e[ 6 ] * z;
		this.y = e[ 1 ] * x + e[ 4 ] * y + e[ 7 ] * z;
		this.z = e[ 2 ] * x + e[ 5 ] * y + e[ 8 ] * z;

		return this;

	},

	applyMatrix4: function ( m ) {

		// input: THREE.Matrix4 affine matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ];
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ];
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ];

		return this;

	},

	applyProjection: function ( m ) {

		// input: THREE.Matrix4 projection matrix

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;
		var d = 1 / ( e[ 3 ] * x + e[ 7 ] * y + e[ 11 ] * z + e[ 15 ] ); // perspective divide

		this.x = ( e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z + e[ 12 ] ) * d;
		this.y = ( e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z + e[ 13 ] ) * d;
		this.z = ( e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z + e[ 14 ] ) * d;

		return this;

	},

	applyQuaternion: function ( q ) {

		var x = this.x;
		var y = this.y;
		var z = this.z;

		var qx = q.x;
		var qy = q.y;
		var qz = q.z;
		var qw = q.w;

		// calculate quat * vector

		var ix =  qw * x + qy * z - qz * y;
		var iy =  qw * y + qz * x - qx * z;
		var iz =  qw * z + qx * y - qy * x;
		var iw = - qx * x - qy * y - qz * z;

		// calculate result * inverse quat

		this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
		this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
		this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

		return this;

	},

	project: function () {

		var matrix;

		return function ( camera ) {

			if ( matrix === undefined ) matrix = new THREE.Matrix4();

			matrix.multiplyMatrices( camera.projectionMatrix, matrix.getInverse( camera.matrixWorld ) );
			return this.applyProjection( matrix );

		};

	}(),

	unproject: function () {

		var matrix;

		return function ( camera ) {

			if ( matrix === undefined ) matrix = new THREE.Matrix4();

			matrix.multiplyMatrices( camera.matrixWorld, matrix.getInverse( camera.projectionMatrix ) );
			return this.applyProjection( matrix );

		};

	}(),

	transformDirection: function ( m ) {

		// input: THREE.Matrix4 affine matrix
		// vector interpreted as a direction

		var x = this.x, y = this.y, z = this.z;

		var e = m.elements;

		this.x = e[ 0 ] * x + e[ 4 ] * y + e[ 8 ]  * z;
		this.y = e[ 1 ] * x + e[ 5 ] * y + e[ 9 ]  * z;
		this.z = e[ 2 ] * x + e[ 6 ] * y + e[ 10 ] * z;

		this.normalize();

		return this;

	},

	divide: function ( v ) {

		this.x /= v.x;
		this.y /= v.y;
		this.z /= v.z;

		return this;

	},

	divideScalar: function ( scalar ) {

		if ( scalar !== 0 ) {

			var invScalar = 1 / scalar;

			this.x *= invScalar;
			this.y *= invScalar;
			this.z *= invScalar;

		} else {

			this.x = 0;
			this.y = 0;
			this.z = 0;

		}

		return this;

	},

	min: function ( v ) {

		if ( this.x > v.x ) {

			this.x = v.x;

		}

		if ( this.y > v.y ) {

			this.y = v.y;

		}

		if ( this.z > v.z ) {

			this.z = v.z;

		}

		return this;

	},

	max: function ( v ) {

		if ( this.x < v.x ) {

			this.x = v.x;

		}

		if ( this.y < v.y ) {

			this.y = v.y;

		}

		if ( this.z < v.z ) {

			this.z = v.z;

		}

		return this;

	},

	clamp: function ( min, max ) {

		// This function assumes min < max, if this assumption isn't true it will not operate correctly

		if ( this.x < min.x ) {

			this.x = min.x;

		} else if ( this.x > max.x ) {

			this.x = max.x;

		}

		if ( this.y < min.y ) {

			this.y = min.y;

		} else if ( this.y > max.y ) {

			this.y = max.y;

		}

		if ( this.z < min.z ) {

			this.z = min.z;

		} else if ( this.z > max.z ) {

			this.z = max.z;

		}

		return this;

	},

	clampScalar: ( function () {

		var min, max;

		return function ( minVal, maxVal ) {

			if ( min === undefined ) {

				min = new THREE.Vector3();
				max = new THREE.Vector3();

			}

			min.set( minVal, minVal, minVal );
			max.set( maxVal, maxVal, maxVal );

			return this.clamp( min, max );

		};

	} )(),

	floor: function () {

		this.x = Math.floor( this.x );
		this.y = Math.floor( this.y );
		this.z = Math.floor( this.z );

		return this;

	},

	ceil: function () {

		this.x = Math.ceil( this.x );
		this.y = Math.ceil( this.y );
		this.z = Math.ceil( this.z );

		return this;

	},

	round: function () {

		this.x = Math.round( this.x );
		this.y = Math.round( this.y );
		this.z = Math.round( this.z );

		return this;

	},

	roundToZero: function () {

		this.x = ( this.x < 0 ) ? Math.ceil( this.x ) : Math.floor( this.x );
		this.y = ( this.y < 0 ) ? Math.ceil( this.y ) : Math.floor( this.y );
		this.z = ( this.z < 0 ) ? Math.ceil( this.z ) : Math.floor( this.z );

		return this;

	},

	negate: function () {

		this.x = - this.x;
		this.y = - this.y;
		this.z = - this.z;

		return this;

	},

	dot: function ( v ) {

		return this.x * v.x + this.y * v.y + this.z * v.z;

	},

	lengthSq: function () {

		return this.x * this.x + this.y * this.y + this.z * this.z;

	},

	length: function () {

		return Math.sqrt( this.x * this.x + this.y * this.y + this.z * this.z );

	},

	lengthManhattan: function () {

		return Math.abs( this.x ) + Math.abs( this.y ) + Math.abs( this.z );

	},

	normalize: function () {

		return this.divideScalar( this.length() );

	},

	setLength: function ( l ) {

		var oldLength = this.length();

		if ( oldLength !== 0 && l !== oldLength  ) {

			this.multiplyScalar( l / oldLength );
		}

		return this;

	},

	lerp: function ( v, alpha ) {

		this.x += ( v.x - this.x ) * alpha;
		this.y += ( v.y - this.y ) * alpha;
		this.z += ( v.z - this.z ) * alpha;

		return this;

	},

	lerpVectors: function ( v1, v2, alpha ) {

		this.subVectors( v2, v1 ).multiplyScalar( alpha ).add( v1 );

		return this;

	},

	cross: function ( v, w ) {

		if ( w !== undefined ) {

			THREE.warn( 'THREE.Vector3: .cross() now only accepts one argument. Use .crossVectors( a, b ) instead.' );
			return this.crossVectors( v, w );

		}

		var x = this.x, y = this.y, z = this.z;

		this.x = y * v.z - z * v.y;
		this.y = z * v.x - x * v.z;
		this.z = x * v.y - y * v.x;

		return this;

	},

	crossVectors: function ( a, b ) {

		var ax = a.x, ay = a.y, az = a.z;
		var bx = b.x, by = b.y, bz = b.z;

		this.x = ay * bz - az * by;
		this.y = az * bx - ax * bz;
		this.z = ax * by - ay * bx;

		return this;

	},

	projectOnVector: function () {

		var v1, dot;

		return function ( vector ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			v1.copy( vector ).normalize();

			dot = this.dot( v1 );

			return this.copy( v1 ).multiplyScalar( dot );

		};

	}(),

	projectOnPlane: function () {

		var v1;

		return function ( planeNormal ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			v1.copy( this ).projectOnVector( planeNormal );

			return this.sub( v1 );

		}

	}(),

	reflect: function () {

		// reflect incident vector off plane orthogonal to normal
		// normal is assumed to have unit length

		var v1;

		return function ( normal ) {

			if ( v1 === undefined ) v1 = new THREE.Vector3();

			return this.sub( v1.copy( normal ).multiplyScalar( 2 * this.dot( normal ) ) );

		}

	}(),

	angleTo: function ( v ) {

		var theta = this.dot( v ) / ( this.length() * v.length() );

		// clamp, to handle numerical problems

		return Math.acos( THREE.Math.clamp( theta, - 1, 1 ) );

	},

	distanceTo: function ( v ) {

		return Math.sqrt( this.distanceToSquared( v ) );

	},

	distanceToSquared: function ( v ) {

		var dx = this.x - v.x;
		var dy = this.y - v.y;
		var dz = this.z - v.z;

		return dx * dx + dy * dy + dz * dz;

	},

	setEulerFromRotationMatrix: function ( m, order ) {

		THREE.error( 'THREE.Vector3: .setEulerFromRotationMatrix() has been removed. Use Euler.setFromRotationMatrix() instead.' );

	},

	setEulerFromQuaternion: function ( q, order ) {

		THREE.error( 'THREE.Vector3: .setEulerFromQuaternion() has been removed. Use Euler.setFromQuaternion() instead.' );

	},

	getPositionFromMatrix: function ( m ) {

		THREE.warn( 'THREE.Vector3: .getPositionFromMatrix() has been renamed to .setFromMatrixPosition().' );

		return this.setFromMatrixPosition( m );

	},

	getScaleFromMatrix: function ( m ) {

		THREE.warn( 'THREE.Vector3: .getScaleFromMatrix() has been renamed to .setFromMatrixScale().' );

		return this.setFromMatrixScale( m );
	},

	getColumnFromMatrix: function ( index, matrix ) {

		THREE.warn( 'THREE.Vector3: .getColumnFromMatrix() has been renamed to .setFromMatrixColumn().' );

		return this.setFromMatrixColumn( index, matrix );

	},

	setFromMatrixPosition: function ( m ) {

		this.x = m.elements[ 12 ];
		this.y = m.elements[ 13 ];
		this.z = m.elements[ 14 ];

		return this;

	},

	setFromMatrixScale: function ( m ) {

		var sx = this.set( m.elements[ 0 ], m.elements[ 1 ], m.elements[  2 ] ).length();
		var sy = this.set( m.elements[ 4 ], m.elements[ 5 ], m.elements[  6 ] ).length();
		var sz = this.set( m.elements[ 8 ], m.elements[ 9 ], m.elements[ 10 ] ).length();

		this.x = sx;
		this.y = sy;
		this.z = sz;

		return this;
	},

	setFromMatrixColumn: function ( index, matrix ) {
		
		var offset = index * 4;

		var me = matrix.elements;

		this.x = me[ offset ];
		this.y = me[ offset + 1 ];
		this.z = me[ offset + 2 ];

		return this;

	},

	equals: function ( v ) {

		return ( ( v.x === this.x ) && ( v.y === this.y ) && ( v.z === this.z ) );

	},

	fromArray: function ( array, offset ) {

		if ( offset === undefined ) offset = 0;

		this.x = array[ offset ];
		this.y = array[ offset + 1 ];
		this.z = array[ offset + 2 ];

		return this;

	},

	toArray: function ( array, offset ) {

		if ( array === undefined ) array = [];
		if ( offset === undefined ) offset = 0;

		array[ offset ] = this.x;
		array[ offset + 1 ] = this.y;
		array[ offset + 2 ] = this.z;

		return array;

	},

	fromAttribute: function ( attribute, index, offset ) {

		if ( offset === undefined ) offset = 0;

		index = index * attribute.itemSize + offset;

		this.x = attribute.array[ index ];
		this.y = attribute.array[ index + 1 ];
		this.z = attribute.array[ index + 2 ];

		return this;

	},

	clone: function () {

		return new THREE.Vector3( this.x, this.y, this.z );

	}

};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQXBwLmpzIiwic3JjL0NlbGVzdGlhbEJvZHkuanMiLCJzcmMvRGVmaW5pdGlvbnMuanMiLCJzcmMvTWF0aC5qcyIsInNyYy9Nb29uUmVhbE9yYml0LmpzIiwic3JjL05hbWVTcGFjZS5qcyIsInNyYy9PcmJpdGFsRWxlbWVudHMuanMiLCJzcmMvU29sYXJTeXN0ZW0uanMiLCJzcmMvVGhyZWUuc2hpbS5qcyIsInNyYy9VdGlscy5qcyIsInZlbmRvci90aHJlZS9tYXRoL0V1bGVyLmpzIiwidmVuZG9yL3RocmVlL21hdGgvUXVhdGVybmlvbi5qcyIsInZlbmRvci90aHJlZS9tYXRoL1ZlY3RvcjMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlxuJ3VzZSBzdHJpY3QnO1xudmFyIFNvbGFyU3lzdGVtID0gcmVxdWlyZSgnLi9Tb2xhclN5c3RlbScpO1xuXG5cbnZhciBnbG9iYWwgPSB3aW5kb3cubGFncmFuZ2UgPSB3aW5kb3cubGFncmFuZ2UgfHwge307XG5cbmdsb2JhbC5wbGFuZXRfcG9zaXRpb25zID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cdGdldFBvc2l0aW9uczogZnVuY3Rpb24odXNlckRhdGUpe1xuXHRcdHJldHVybiBTb2xhclN5c3RlbS5nZXRQb3NpdGlvbnModXNlckRhdGUpO1xuXHR9XG59OyIsIlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgT3JiaXRhbEVsZW1lbnRzID0gcmVxdWlyZSgnLi9PcmJpdGFsRWxlbWVudHMnKTtcclxudmFyIG5zID0gcmVxdWlyZSgnbnMnKTtcclxudmFyIFRIUkVFID0gcmVxdWlyZSgnLi9UaHJlZS5zaGltJyk7XHJcblxyXG52YXIgQ2VsZXN0aWFsQm9keSA9IHtcclxuXHJcblx0aW5pdCA6IGZ1bmN0aW9uKCkge1xyXG5cdFx0dGhpcy5yZXNldCgpO1xyXG5cdFx0dGhpcy5tb3ZlbWVudCA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XHJcblx0XHR0aGlzLmludk1hc3MgPSAxIC8gdGhpcy5tYXNzO1xyXG5cclxuXHRcdHRoaXMub3JiaXRhbEVsZW1lbnRzID0gT2JqZWN0LmNyZWF0ZShPcmJpdGFsRWxlbWVudHMpO1xyXG5cdFx0dGhpcy5vcmJpdGFsRWxlbWVudHMuc2V0TmFtZSh0aGlzLm5hbWUpO1xyXG5cdFx0dGhpcy5vcmJpdGFsRWxlbWVudHMuc2V0RGVmYXVsdE9yYml0KHRoaXMub3JiaXQsIHRoaXMub3JiaXRDYWxjdWxhdG9yKTtcclxuXHRcdC8vY29uc29sZS5sb2codGhpcy5uYW1lLCB0aGlzLnBvc2l0aW9uLCB0aGlzLnZlbG9jaXR5KTtcclxuXHJcblx0fSxcclxuXHJcblx0cmVzZXQgOiBmdW5jdGlvbigpe1xyXG5cdFx0dGhpcy5hbmdsZSA9IDA7XHJcblx0XHR0aGlzLmZvcmNlID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuXHRcdHRoaXMubW92ZW1lbnQgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xyXG5cdFx0dGhpcy5wcmV2aW91c1Bvc2l0aW9uID0gbnVsbDtcclxuXHR9LFxyXG5cclxuXHQvL2lmIGVwb2NoIHN0YXJ0IGlzIG5vdCBqMjAwMCwgZ2V0IGVwb2NoIHRpbWUgZnJvbSBqMjAwMCBlcG9jaCB0aW1lXHJcblx0Z2V0RXBvY2hUaW1lIDogZnVuY3Rpb24oZXBvY2hUaW1lKSB7XHJcblx0XHRpZih0aGlzLmVwb2NoKSB7XHJcblx0XHRcdGVwb2NoVGltZSA9IGVwb2NoVGltZSAtICgodGhpcy5lcG9jaC5nZXRUaW1lKCkgLSBucy5KMjAwMCkgLyAxMDAwKTtcclxuXHRcdH1cclxuXHRcdHJldHVybiBlcG9jaFRpbWU7XHJcblx0fSxcclxuXHJcblx0c2V0UG9zaXRpb25Gcm9tRGF0ZSA6IGZ1bmN0aW9uKGVwb2NoVGltZSwgY2FsY3VsYXRlVmVsb2NpdHkpIHtcclxuXHJcblx0XHRlcG9jaFRpbWUgPSB0aGlzLmdldEVwb2NoVGltZShlcG9jaFRpbWUpO1xyXG5cdFx0dGhpcy5wb3NpdGlvbiA9IHRoaXMuaXNDZW50cmFsID8gbmV3IFRIUkVFLlZlY3RvcjMoKSA6IHRoaXMub3JiaXRhbEVsZW1lbnRzLmdldFBvc2l0aW9uRnJvbUVsZW1lbnRzKHRoaXMub3JiaXRhbEVsZW1lbnRzLmNhbGN1bGF0ZUVsZW1lbnRzKGVwb2NoVGltZSkpO1xyXG5cdFx0dGhpcy5yZWxhdGl2ZVBvc2l0aW9uID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcclxuXHRcdGlmKGNhbGN1bGF0ZVZlbG9jaXR5KSB7XHJcblx0XHRcdHRoaXMudmVsb2NpdHkgPSB0aGlzLmlzQ2VudHJhbCA/IG5ldyBUSFJFRS5WZWN0b3IzKCkgOiB0aGlzLm9yYml0YWxFbGVtZW50cy5jYWxjdWxhdGVWZWxvY2l0eShlcG9jaFRpbWUsIHRoaXMucmVsYXRpdmVUbywgdGhpcy5jYWxjdWxhdGVGcm9tRWxlbWVudHMpO1xyXG5cdFx0fVxyXG5cdFx0dGhpcy5wb3NpdGlvblJlbGF0aXZlVG8oKTtcdFx0XHJcblx0fSxcclxuXHRcclxuXHRnZXRBbmdsZVRvIDogZnVuY3Rpb24oYm9keU5hbWUpe1xyXG5cdFx0dmFyIHJlZiA9IHJlcXVpcmUoJy4vU29sYXJTeXN0ZW0nKS5nZXRCb2R5KGJvZHlOYW1lKTtcclxuXHRcdGlmKHJlZikge1xyXG5cdFx0XHRcclxuXHRcdFx0dmFyIGVjbFBvcyA9IHRoaXMucG9zaXRpb24uY2xvbmUoKS5zdWIocmVmLmdldFBvc2l0aW9uKCkpLm5vcm1hbGl6ZSgpO1xyXG5cdFx0XHRlY2xQb3MueiA9IDA7XHJcblx0XHRcdHZhciBhbmdsZVggPSBlY2xQb3MuYW5nbGVUbyhuZXcgVEhSRUUuVmVjdG9yMygxLCAwLCAwKSk7XHJcblx0XHRcdHZhciBhbmdsZVkgPSBlY2xQb3MuYW5nbGVUbyhuZXcgVEhSRUUuVmVjdG9yMygwLCAxLCAwKSk7XHJcblx0XHRcdC8vY29uc29sZS5sb2coYW5nbGVYLCBhbmdsZVkpO1xyXG5cdFx0XHR2YXIgYW5nbGUgPSBhbmdsZVg7XHJcblx0XHRcdHZhciBxID0gTWF0aC5QSSAvIDI7XHJcblx0XHRcdGlmKGFuZ2xlWSA+IHEpIGFuZ2xlID0gLWFuZ2xlWDtcclxuXHRcdFx0cmV0dXJuIGFuZ2xlO1xyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIDA7XHJcblx0fSxcclxuXHJcblx0cG9zaXRpb25SZWxhdGl2ZVRvIDogZnVuY3Rpb24oKXtcclxuXHRcdGlmKHRoaXMucmVsYXRpdmVUbykge1xyXG5cdFx0XHR2YXIgY2VudHJhbCA9IHJlcXVpcmUoJy4vU29sYXJTeXN0ZW0nKS5nZXRCb2R5KHRoaXMucmVsYXRpdmVUbyk7XHJcblx0XHRcdGlmKGNlbnRyYWwgJiYgY2VudHJhbCE9PXJlcXVpcmUoJy4vU29sYXJTeXN0ZW0nKS5nZXRCb2R5KCkvKiovKSB7XHJcblx0XHRcdFx0dGhpcy5wb3NpdGlvbi5hZGQoY2VudHJhbC5wb3NpdGlvbik7XHJcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyh0aGlzLm5hbWUrJyBwb3MgcmVsIHRvICcgKyB0aGlzLnJlbGF0aXZlVG8pO1xyXG5cdFx0XHRcdHRoaXMudmVsb2NpdHkgJiYgY2VudHJhbC52ZWxvY2l0eSAmJiB0aGlzLnZlbG9jaXR5LmFkZChjZW50cmFsLnZlbG9jaXR5KTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdH0sXHJcblxyXG5cdGNhbGN1bGF0ZVBvc2l0aW9uIDogZnVuY3Rpb24odCkge1xyXG5cdFx0cmV0dXJuIHRoaXMub3JiaXRhbEVsZW1lbnRzLmNhbGN1bGF0ZVBvc2l0aW9uKHQpO1xyXG5cdH0sXHJcblxyXG5cdGdldFBvc2l0aW9uIDogZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB0aGlzLnBvc2l0aW9uLmNsb25lKCk7XHJcblx0fSxcclxuXHJcblx0Z2V0VmVsb2NpdHkgOiBmdW5jdGlvbigpe1xyXG5cdFx0cmV0dXJuIHRoaXMudmVsb2NpdHkgJiYgdGhpcy52ZWxvY2l0eS5jbG9uZSgpO1xyXG5cdH0sXHJcblx0Ly9yZXR1cm4gdHJ1ZS9mYWxzZSBpZiB0aGlzIGJvZHkgaXMgb3JiaXRpbmcgdGhlIHJlcXVlc3RlZCBib2R5XHJcblx0aXNPcmJpdEFyb3VuZCA6IGZ1bmN0aW9uKGNlbGVzdGlhbCl7XHJcblx0XHRyZXR1cm4gY2VsZXN0aWFsLm5hbWUgPT09IHRoaXMucmVsYXRpdmVUbztcclxuXHR9XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENlbGVzdGlhbEJvZHk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxudmFyIG5zID0gcmVxdWlyZSgnbnMnKTtcclxudmFyIE1vb25SZWFsT3JiaXQgPSByZXF1aXJlKCcuL01vb25SZWFsT3JiaXQnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gW1xyXG5cdHtcclxuXHRcdG5hbWU6ICdzdW4nLFxyXG5cdFx0dGl0bGUgOiAnVGhlIFN1bicsXHJcblx0XHRtYXNzIDogMS45ODkxZTMwLFxyXG5cdFx0cmFkaXVzIDogNi45NjM0MmU1LFxyXG5cdFx0ayA6IDAuMDE3MjAyMDk4OTUgLy9ncmF2aXRhdGlvbmFsIGNvbnN0YW50ICjOvClcclxuXHR9LFxyXG5cdHtcclxuXHQgXHRuYW1lOiAnbWVyY3VyeScsXHJcblx0XHR0aXRsZSA6ICdNZXJjdXJ5JyxcclxuXHRcdG1hc3MgOiAzLjMwMjJlMjMsXHJcblx0XHRyYWRpdXM6MjQzOSxcclxuXHRcdG9yYml0IDogeyBcclxuXHRcdFx0YmFzZSA6IHthIDogMC4zODcwOTkyNyAqIG5zLkFVICwgIGUgOiAwLjIwNTYzNTkzLCBpOiA3LjAwNDk3OTAyLCBsIDogMjUyLjI1MDMyMzUwLCBscCA6IDc3LjQ1Nzc5NjI4LCBvIDogNDguMzMwNzY1OTN9LFxyXG5cdFx0XHRjeSA6IHthIDogMC4wMDAwMDAzNyAqIG5zLkFVICwgIGUgOiAwLjAwMDAxOTA2LCBpOiAtMC4wMDU5NDc0OSwgbCA6IDE0OTQ3Mi42NzQxMTE3NSwgbHAgOiAwLjE2MDQ3Njg5LCBvIDogLTAuMTI1MzQwODF9XHJcblx0XHR9XHJcblx0fSxcclxuXHR7XHJcblx0XHRuYW1lOiAndmVudXMnLFxyXG5cdFx0dGl0bGUgOiAnVmVudXMnLFxyXG5cdFx0bWFzcyA6IDQuODY4ZTI0LFxyXG5cdFx0cmFkaXVzIDogNjA1MSxcclxuXHRcdG9yYml0IDoge1xyXG5cdFx0XHRiYXNlIDoge2EgOiAwLjcyMzMzNTY2ICogbnMuQVUgLCAgZSA6IDAuMDA2Nzc2NzIsIGk6IDMuMzk0Njc2MDUsIGwgOiAxODEuOTc5MDk5NTAsIGxwIDogMTMxLjYwMjQ2NzE4LCBvIDogNzYuNjc5ODQyNTV9LFxyXG5cdFx0XHRjeSA6IHthIDogMC4wMDAwMDM5MCAqIG5zLkFVICwgIGUgOiAtMC4wMDAwNDEwNywgaTogLTAuMDAwNzg4OTAsIGwgOiA1ODUxNy44MTUzODcyOSwgbHAgOiAwLjAwMjY4MzI5LCBvIDogLTAuMjc3Njk0MTh9XHJcblx0XHR9XHJcblx0fSxcclxuXHR7XHJcblx0XHRuYW1lOidlYXJ0aCcsXHJcblx0XHR0aXRsZSA6ICdUaGUgRWFydGgnLFxyXG5cdFx0bWFzcyA6IDUuOTczNmUyNCxcclxuXHRcdHJhZGl1cyA6IDM0NDMuOTMwNyAqIG5zLk5NX1RPX0tNLFxyXG5cdFx0c2lkZXJhbERheSA6IG5zLlNJREVSQUxfREFZLFxyXG5cdFx0dGlsdCA6IDIzKygyNi82MCkrKDIxLzM2MDApICxcclxuXHRcdG9yYml0IDoge1xyXG5cdFx0XHRiYXNlIDoge2EgOiAxLjAwMDAwMjYxICogbnMuQVUsIGUgOiAwLjAxNjcxMTIzLCBpIDogLTAuMDAwMDE1MzEsIGwgOiAxMDAuNDY0NTcxNjYsIGxwIDogMTAyLjkzNzY4MTkzLCBvIDogMC4wfSxcclxuXHRcdFx0Y3kgOiB7YSA6IDAuMDAwMDA1NjIgKiBucy5BVSwgZSA6IC0wLjAwMDA0MzkyLCBpIDogLTAuMDEyOTQ2NjgsIGwgOiAzNTk5OS4zNzI0NDk4MSwgbHAgOiAwLjMyMzI3MzY0LCBvIDogMC4wfVxyXG5cdFx0fVxyXG5cdH0sXHJcblx0e1xyXG5cdFx0bmFtZTonbWFycycsXHJcblx0XHR0aXRsZSA6ICdNYXJzJyxcclxuXHRcdG1hc3MgOiA2LjQxODVlMjMsXHJcblx0XHRyYWRpdXMgOiAzMzc2LFxyXG5cdFx0c2lkZXJhbERheSA6IDEuMDI1OTU3ICogbnMuREFZLFxyXG5cdFx0b3JiaXQgOiB7XHJcblx0XHRcdGJhc2UgOiB7YSA6IDEuNTIzNzEwMzQgKiBucy5BVSAsICBlIDogMC4wOTMzOTQxMCwgaTogMS44NDk2OTE0MiwgbCA6IC00LjU1MzQzMjA1LCBscCA6IC0yMy45NDM2Mjk1OSwgbyA6IDQ5LjU1OTUzODkxfSxcclxuXHRcdFx0Y3kgOiB7YSA6IDAuMDAwMDE4NDcgKiBucy5BVSAsICBlIDogMC4wMDAwNzg4MiwgaTogLTAuMDA4MTMxMzEsIGwgOiAxOTE0MC4zMDI2ODQ5OSwgbHAgOiAwLjQ0NDQxMDg4LCBvIDogLTAuMjkyNTczNDN9XHJcblx0XHR9XHJcblx0fSxcclxuXHR7XHJcblx0IFx0bmFtZTonanVwaXRlcicsXHJcblx0XHR0aXRsZSA6ICdKdXBpdGVyJyxcclxuXHRcdG1hc3MgOiAxLjg5ODZlMjcsXHJcblx0XHRyYWRpdXMgOiA3MTQ5MixcclxuXHRcdG9yYml0IDoge1xyXG5cdFx0XHRiYXNlIDoge2EgOiA1LjIwMjg4NzAwICogbnMuQVUgLCAgZSA6IDAuMDQ4Mzg2MjQsIGk6IDEuMzA0Mzk2OTUsIGwgOiAzNC4zOTY0NDA1MSwgbHAgOiAxNC43Mjg0Nzk4MywgbyA6IDEwMC40NzM5MDkwOX0sXHJcblx0XHRcdGN5IDoge2EgOiAtMC4wMDAxMTYwNyAqIG5zLkFVICwgIGUgOiAtMC4wMDAxMzI1MywgaTogLTAuMDAxODM3MTQsIGwgOiAzMDM0Ljc0NjEyNzc1LCBscCA6IDAuMjEyNTI2NjgsIG8gOiAwLjIwNDY5MTA2fVxyXG5cdFx0fVxyXG5cdH0sXHJcblx0e1xyXG5cdFx0bmFtZTonc2F0dXJuJyxcclxuXHRcdHRpdGxlIDogJ1NhdHVybicsXHJcblx0XHRtYXNzIDogNS42ODQ2ZTI2LFxyXG5cdFx0cmFkaXVzIDogNTgyMzIsXHJcblx0XHR0aWx0IDogMjYuNyxcclxuXHRcdG9yYml0IDoge1xyXG5cdFx0XHRiYXNlIDoge2EgOiA5LjUzNjY3NTk0ICogbnMuQVUgLCAgZSA6IDAuMDUzODYxNzksIGk6IDIuNDg1OTkxODcsIGwgOiA0OS45NTQyNDQyMywgbHAgOiA5Mi41OTg4NzgzMSwgbyA6IDExMy42NjI0MjQ0OH0sXHJcblx0XHRcdGN5IDoge2EgOiAtMC4wMDEyNTA2MCAqIG5zLkFVICwgIGUgOiAtMC4wMDA1MDk5MSwgaTogMC4wMDE5MzYwOSwgbCA6IDEyMjIuNDkzNjIyMDEsIGxwIDogLTAuNDE4OTcyMTYsIG8gOiAtMC4yODg2Nzc5NH1cclxuXHRcdH1cclxuXHR9LFxyXG5cdHtcclxuXHRcdG5hbWU6ICd1cmFudXMnLFxyXG5cdFx0dGl0bGUgOiAnVXJhbnVzJyxcclxuXHRcdG1hc3MgOiA4LjY4MTBlMjUsXHJcblx0XHRyYWRpdXMgOiAyNTU1OSxcclxuXHRcdG9yYml0IDoge1xyXG5cdFx0XHRiYXNlIDoge2EgOiAxOS4xODkxNjQ2NCAqIG5zLkFVICwgIGUgOiAwLjA0NzI1NzQ0LCBpOiAwLjc3MjYzNzgzLCBsIDogMzEzLjIzODEwNDUxLCBscCA6IDE3MC45NTQyNzYzMCwgbyA6IDc0LjAxNjkyNTAzfSxcclxuXHRcdFx0Y3kgOiB7YSA6IC0wLjAwMTk2MTc2ICogbnMuQVUgLCAgZSA6IC0wLjAwMDA0Mzk3LCBpOiAtMC4wMDI0MjkzOSwgbCA6IDQyOC40ODIwMjc4NSwgbHAgOiAwLjQwODA1MjgxLCBvIDogMC4wNDI0MDU4OX1cclxuXHRcdH1cclxuXHR9LFxyXG5cdHtcclxuXHRcdG5hbWU6J25lcHR1bmUnLFxyXG5cdFx0dGl0bGUgOiAnTmVwdHVuZScsXHJcblx0XHRtYXNzIDogMS4wMjQzZTI2LFxyXG5cdFx0cmFkaXVzIDogMjQ3NjQsXHJcblx0XHRvcmJpdCA6IHtcclxuXHRcdFx0YmFzZSA6IHthIDogMzAuMDY5OTIyNzYgICogbnMuQVUsICBlIDogMC4wMDg1OTA0OCwgaTogMS43NzAwNDM0NywgbCA6IC01NS4xMjAwMjk2OSwgbHAgOiA0NC45NjQ3NjIyNywgbyA6IDEzMS43ODQyMjU3NH0sXHJcblx0XHRcdGN5IDoge2EgOiAwLjAwMDI2MjkxICAqIG5zLkFVLCAgZSA6IDAuMDAwMDUxMDUsIGk6IDAuMDAwMzUzNzIsIGwgOiAyMTguNDU5NDUzMjUsIGxwIDogLTAuMzIyNDE0NjQsIG8gOiAtMC4wMDUwODY2NH1cclxuXHRcdH1cclxuXHR9LFxyXG5cdHtcclxuXHRcdG5hbWU6ICdwbHV0bycsXHJcblx0XHR0aXRsZSA6ICdQbHV0bycsXHJcblx0XHRtYXNzIDogMS4zMDVlMjIrMS41MmUyMSxcclxuXHRcdHJhZGl1cyA6IDExNTMsXHJcblx0XHRvcmJpdCA6IHtcclxuXHRcdFx0YmFzZSA6IHthIDogMzkuNDgyMTE2NzUgKiBucy5BVSAsICBlIDogMC4yNDg4MjczMCwgaTogMTcuMTQwMDEyMDYsIGwgOiAyMzguOTI5MDM4MzMsIGxwIDogMjI0LjA2ODkxNjI5LCBvIDogMTEwLjMwMzkzNjg0fSxcclxuXHRcdFx0Y3kgOiB7YSA6IC0wLjAwMDMxNTk2ICogbnMuQVUgLCAgZSA6IDAuMDAwMDUxNzAsIGk6IDAuMDAwMDQ4MTgsIGwgOiAxNDUuMjA3ODA1MTUsIGxwIDogLTAuMDQwNjI5NDIsIG8gOiAtMC4wMTE4MzQ4Mn1cclxuXHRcdH1cclxuXHR9LFxyXG5cdHtcclxuXHRcdG5hbWU6ICdoYWxsZXknLFxyXG5cdFx0dGl0bGUgOiAnSGFsbGV5XFwncyBDb21ldCcsXHJcblx0XHRtYXNzIDogMi4yZTE0LFxyXG5cdFx0cmFkaXVzIDogNTAsXHJcblx0XHRvcmJpdCA6IHtcclxuXHRcdFx0YmFzZSA6IHthIDogMTcuODM0MTQ0MjkgKiBucy5BVSAsICBlIDogMC45NjcxNDI5MDgsIGk6IDE2Mi4yNjI2OTEsIE0gOiAzNjAgKiAoNDM4MzkzNjAwIC8gKDc1LjEgKiBucy5ZRUFSICogbnMuREFZKSksIHcgOiAxMTEuMzMyNDg1LCBvIDogNTguNDIwMDgxfSxcclxuXHRcdFx0ZGF5IDoge2EgOiAwICwgIGUgOiAwLCBpOiAwLCBNIDogKDM2MCAvICg3NS4xICogMzY1LjI1KSApLCB3IDogMCwgbyA6IDB9XHJcblx0XHR9XHJcblx0fSxcclxuXHR7XHJcblx0XHRuYW1lOiAnbW9vbicsXHJcblx0XHR0aXRsZSA6ICdUaGUgTW9vbicsXHJcblx0XHRtYXNzIDogNy4zNDc3ZTIyLFxyXG5cdFx0cmFkaXVzIDogMTczOC4xLFxyXG5cdFx0c2lkZXJhbERheSA6ICgyNy4zMjE1NzgyICogbnMuREFZKSAsXHJcblx0XHR0aWx0IDogMS41NDI0LFxyXG5cdFx0Zm92IDogMSxcclxuXHRcdHJlbGF0aXZlVG8gOiAnZWFydGgnLFxyXG5cdFx0b3JiaXRDYWxjdWxhdG9yIDogTW9vblJlYWxPcmJpdCxcclxuXHRcdG9yYml0OiB7XHJcblx0XHRcdGJhc2UgOiB7XHJcblx0XHRcdFx0YSA6IDM4NDQwMCxcclxuXHRcdFx0XHRlIDogMC4wNTU0LFxyXG5cdFx0XHRcdHcgOiAzMTguMTUsXHJcblx0XHRcdFx0TSA6IDEzNS4yNyxcclxuXHRcdFx0XHRpIDogNS4xNixcclxuXHRcdFx0XHRvIDogMTI1LjA4XHJcblx0XHRcdH0sXHJcblx0XHRcdGRheSA6IHtcclxuXHRcdFx0XHRhIDogMCxcclxuXHRcdFx0XHRlIDogMCxcclxuXHRcdFx0XHRpIDogMCxcclxuXHRcdFx0XHRNIDogMTMuMTc2MzU4LC8vMzYwIC8gMjcuMzIxNTgyLFxyXG5cdFx0XHRcdHcgOiAoMzYwIC8gNS45OTcpIC8gMzY1LjI1LFxyXG5cdFx0XHRcdG8gOiAoMzYwIC8gMTguNjAwKSAvIDM2NS4yNVxyXG5cdFx0XHR9XHRcclxuXHRcdH1cclxuXHR9XHJcbl07XHJcbiIsIid1c2Ugc3RyaWN0JztcclxubW9kdWxlLmV4cG9ydHMgPSB7XHJcblx0c2luaCA6IGZ1bmN0aW9uKGEpIHtcclxuXHRcdHJldHVybiAoTWF0aC5leHAoYSkgLSBNYXRoLmV4cCgtYSkpIC8gMjtcclxuXHR9LFxyXG5cclxuXHRjb3NoIDogZnVuY3Rpb24oYSkge1xyXG5cdFx0cmV0dXJuIChNYXRoLnBvdyhNYXRoLkUsIGEpICsgTWF0aC5wb3coTWF0aC5FLCAtYSkpIC8gMjtcclxuXHR9LFxyXG5cclxuXHRzaWduIDogZnVuY3Rpb24oYSkge1xyXG5cdFx0cmV0dXJuIChhID49IDAuMCkgPyAxIDogLTE7XHJcblx0fVxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBucyA9IHJlcXVpcmUoJ25zJyk7XHJcblxyXG52YXIgREVHX1RPX1JBRCA9IG5zLkRFR19UT19SQUQ7XHJcbnZhciBSQURfVE9fREVHID0gbnMuUkFEX1RPX0RFRztcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odCl7XHJcblxyXG5cdHZhciB0MiA9IHQgKiB0O1xyXG5cdHZhciB0MyA9IHQgKiB0MjtcclxuXHR2YXIgdDQgPSB0ICogdDM7XHJcblx0dmFyIHQ1ID0gdCAqIHQ0O1xyXG5cclxuXHR2YXIgdDJlNCA9IHQyICogMWUtNDtcclxuXHR2YXIgdDNlNiA9IHQzICogMWUtNjtcclxuXHR2YXIgdDRlOCA9IHQ0ICogMWUtODtcclxuXHJcblx0Ly8lIHNlbWltYWpvciBheGlzXHJcblxyXG5cdHZhciBzYSA9IDM0MDAuNCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMjM1LjcwMDQgKyA4OTA1MzQuMjIzMCAqIHQgLSAzMi42MDEgKiB0MmU0IFxyXG5cdCsgMy42NjQgKiB0M2U2IC0gMS43NjkgKiB0NGU4KSkgXHJcblx0LSA2MzUuNiAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTAwLjczNzAgKyA0MTMzMzUuMzU1NCAqIHQgLSAxMjIuNTcxICogdDJlNCBcclxuXHQtIDEwLjY4NCAqIHQzZTYgKyA1LjAyOCAqIHQ0ZTgpKSBcclxuXHQtIDIzNS42ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMzQuOTYzNCArIDQ3NzE5OC44Njc2ICogdCArIDg5Ljk3MCAqIHQyZTQgXHJcblx0KyAxNC4zNDggKiB0M2U2IC0gNi43OTcgKiB0NGU4KSkgXHJcblx0KyAyMTguMSAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMjM4LjE3MTMgKyAgODU0NTM1LjE3MjcgKiB0IC0gMzEuMDY1ICogdDJlNCBcclxuXHQrIDMuNjIzICogdDNlNiAgLSAxLjc2OSAqIHQ0ZTgpKSBcclxuXHQrIDE4MS4wICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMC42NjM4ICsgMTM2NzczMy4wOTA3ICogdCArIDU3LjM3MCAqIHQyZTQgXHJcblx0KyAxOC4wMTEgKiB0M2U2IC0gOC41NjYgKiB0NGU4KSkgXHJcblx0LSAzOS45ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMDMuMjA3OSArIDM3NzMzNi4zMDUxICogdCAtIDEyMS4wMzUgKiB0MmU0IFxyXG5cdC0gMTAuNzI0ICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdC0gMzguNCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMjMzLjIyOTUgKyA5MjY1MzMuMjczMyAqIHQgLSAzNC4xMzYgKiB0MmU0IFxyXG5cdCsgMy43MDUgKiB0M2U2IC0gMS43NjkgKiB0NGU4KSkgXHJcblx0KyAzMy44ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgzMzYuNDM3NCArIDEzMDM4NjkuNTc4NCAqIHQgLSAxNTUuMTcxICogdDJlNCBcclxuXHQtIDcuMDIwICogdDNlNiArIDMuMjU5ICogdDRlOCkpIFxyXG5cdCsgMjguOCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTExLjQwMDggKyAxNzgxMDY4LjQ0NjEgKiB0IC0gNjUuMjAxICogdDJlNCBcclxuXHQrIDcuMzI4ICogdDNlNiAtIDMuNTM4ICogdDRlOCkpIFxyXG5cdCsgMTIuNiAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTMuMTM0NyArIDEzMzE3MzQuMDQwNCAqIHQgKyA1OC45MDYgKiB0MmU0IFxyXG5cdCsgMTcuOTcxICogdDNlNiAtIDguNTY2ICogdDRlOCkpIFxyXG5cdCsgMTEuNCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTg2LjU0NDIgKyA5NjY0MDQuMDM1MSAqIHQgLSA2OC4wNTggKiB0MmU0IFxyXG5cdC0gMC41NjcgKiB0M2U2ICsgMC4yMzIgKiB0NGU4KSkgXHJcblx0LSAxMS4xICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyMjIuNTY1NyAtIDQ0MTE5OS44MTczICogdCAtIDkxLjUwNiAqIHQyZTQgXHJcblx0LSAxNC4zMDcgKiB0M2U2ICsgNi43OTcgKiB0NGU4KSkgXHJcblx0LSAxMC4yICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyNjkuOTI2OCArIDk1NDM5Ny43MzUzICogdCArIDE3OS45NDEgKiB0MmU0IFxyXG5cdCsgMjguNjk1ICogdDNlNiAtIDEzLjU5NCAqIHQ0ZTgpKSBcclxuXHQrIDkuNyAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTQ1LjYyNzIgKyAxODQ0OTMxLjk1ODMgKiB0ICsgMTQ3LjM0MCAqIHQyZTQgXHJcblx0KyAzMi4zNTkgKiB0M2U2IC0gMTUuMzYzICogdDRlOCkpIFxyXG5cdCsgOS42ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyNDAuNjQyMiArIDgxODUzNi4xMjI1ICogdCAtIDI5LjUyOSAqIHQyZTQgXHJcblx0KyAzLjU4MiAqIHQzZTYgLSAxLjc2OSAqIHQ0ZTgpKSBcclxuXHQrIDguMCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMjk3Ljg1MDIgKyA0NDUyNjcuMTExNSAqIHQgLSAxNi4zMDAgKiB0MmU0IFxyXG5cdCsgMS44MzIgKiB0M2U2IC0gMC44ODQgKiB0NGU4KSkgXHJcblx0LSA2LjIgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDEzMi40OTI1ICsgNTEzMTk3LjkxNzkgKiB0ICsgODguNDM0ICogdDJlNCBcclxuXHQrIDE0LjM4OCAqIHQzZTYgLSA2Ljc5NyAqIHQ0ZTgpKSBcclxuXHQrIDYuMCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTczLjU1MDYgKyAxMzM1ODAxLjMzNDYgKiB0IC0gNDguOTAxICogdDJlNCBcclxuXHQrIDUuNDk2ICogdDNlNiAtIDIuNjUzICogdDRlOCkpIFxyXG5cdCsgMy43ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMTMuODcxNyArIDE3NDUwNjkuMzk1OCAqIHQgLSA2My42NjUgKiB0MmU0IFxyXG5cdCsgNy4yODcgKiB0M2U2IC0gMy41MzggKiB0NGU4KSkgXHJcblx0KyAzLjYgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDMzOC45MDgzICsgMTI2Nzg3MC41MjgxICogdCAtIDE1My42MzYgKiB0MmU0IFxyXG5cdC0gNy4wNjEgKiB0M2U2ICsgMy4yNTkgKiB0NGU4KSkgXHJcblx0KyAzLjIgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDI0Ni4zNjQyICsgMjI1ODI2Ny4zMTM3ICogdCArIDI0Ljc2OSAqIHQyZTQgXHJcblx0KyAyMS42NzUgKiB0M2U2IC0gMTAuMzM1ICogdDRlOCkpIFxyXG5cdC0gMy4wICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICg4LjE5MjkgKyAxNDAzNzMyLjE0MTAgKiB0ICsgNTUuODM0ICogdDJlNCBcclxuXHQrIDE4LjA1MiAqIHQzZTYgLSA4LjU2NiAqIHQ0ZTgpKSBcclxuXHQrIDIuMyAqIE1hdGguY29zKERFR19UT19SQUQgKiAoOTguMjY2MSArIDQ0OTMzNC40MDU3ICogdCAtIDEyNC4xMDcgKiB0MmU0IFxyXG5cdC0gMTAuNjQzICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdC0gMi4yICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgzNTcuNTI5MSArIDM1OTk5LjA1MDMgKiB0IC0gMS41MzYgKiB0MmU0IFxyXG5cdCsgMC4wNDEgKiB0M2U2ICsgMC4wMDAgKiB0NGU4KSkgXHJcblx0LSAyLjAgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDM4LjU4NzIgKyA4NTg2MDIuNDY2OSAqIHQgLSAxMzguODcxICogdDJlNCBcclxuXHQtIDguODUyICogdDNlNiArIDQuMTQ0ICogdDRlOCkpIFxyXG5cdC0gMS44ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMDUuNjc4OCArIDM0MTMzNy4yNTQ4ICogdCAtIDExOS40OTkgKiB0MmU0IFxyXG5cdC0gMTAuNzY1ICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdC0gMS43ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyMDEuNDc0MCArIDgyNjY3MC43MTA4ICogdCAtIDI0NS4xNDIgKiB0MmU0IFxyXG5cdC0gMjEuMzY3ICogdDNlNiArIDEwLjA1NyAqIHQ0ZTgpKSBcclxuXHQrIDEuNiAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTg0LjExOTYgKyA0MDEzMjkuMDU1NiAqIHQgKyAxMjUuNDI4ICogdDJlNCBcclxuXHQrIDE4LjU3OSAqIHQzZTYgLSA4Ljc5OCAqIHQ0ZTgpKSBcclxuXHQtIDEuNCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMzA4LjQxOTIgLSA0ODkyMDUuMTY3NCAqIHQgKyAxNTguMDI5ICogdDJlNCBcclxuXHQrIDE0LjkxNSAqIHQzZTYgLSA3LjAyOSAqIHQ0ZTgpKSBcclxuXHQrIDEuMyAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMzI1Ljc3MzYgLSA2Mzg2My41MTIyICogdCAtIDIxMi41NDEgKiB0MmU0IFxyXG5cdC0gMjUuMDMxICogdDNlNiArIDExLjgyNiAqIHQ0ZTgpKTtcclxuXHJcblx0dmFyIHNhcHAgPSAtIDAuNTUgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDIzOC4yICsgODU0NTM1LjIgKiB0KSkgXHJcblx0XHQrIDAuMTAgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDEwMy4yICsgMzc3MzM2LjMgKiB0KSkgXHJcblx0XHQrIDAuMTAgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDIzMy4yICsgOTI2NTMzLjMgKiB0KSk7XHJcblxyXG5cdHZhciBzbWEgPSAzODMzOTcuNiArIHNhICsgc2FwcCAqIHQ7XHJcblxyXG5cdC8vJSBvcmJpdGFsIGVjY2VudHJpY2l0eVxyXG5cclxuXHR2YXIgc2UgPSAwLjAxNDIxNyAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTAwLjczNzAgKyA0MTMzMzUuMzU1NCAqIHQgLSAxMjIuNTcxICogdDJlNCBcclxuXHQtIDEwLjY4NCAqIHQzZTYgKyA1LjAyOCAqIHQ0ZTgpKSBcclxuXHQrIDAuMDA4NTUxICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgzMjUuNzczNiAtIDYzODYzLjUxMjIgKiB0IC0gMjEyLjU0MSAqIHQyZTQgXHJcblx0LSAyNS4wMzEgKiB0M2U2ICsgMTEuODI2ICogdDRlOCkpIFxyXG5cdC0gMC4wMDEzODMgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDEzNC45NjM0ICsgNDc3MTk4Ljg2NzYgKiB0ICsgODkuOTcwICogdDJlNCBcclxuXHQrIDE0LjM0OCAqIHQzZTYgLSA2Ljc5NyAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAxMzUzICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMC42NjM4ICsgMTM2NzczMy4wOTA3ICogdCArIDU3LjM3MCAqIHQyZTQgXHJcblx0KyAxOC4wMTEgKiB0M2U2IC0gOC41NjYgKiB0NGU4KSkgXHJcblx0LSAwLjAwMTE0NiAqIE1hdGguY29zKERFR19UT19SQUQgKiAoNjYuNTEwNiArIDM0OTQ3MS44NDMyICogdCAtIDMzNS4xMTIgKiB0MmU0IFxyXG5cdC0gMzUuNzE1ICogdDNlNiArIDE2Ljg1NCAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwOTE1ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyMDEuNDc0MCArIDgyNjY3MC43MTA4ICogdCAtIDI0NS4xNDIgKiB0MmU0IFxyXG5cdC0gMjEuMzY3ICogdDNlNiArIDEwLjA1NyAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwODY5ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMDMuMjA3OSArIDM3NzMzNi4zMDUxICogdCAtIDEyMS4wMzUgKiB0MmU0IFxyXG5cdC0gMTAuNzI0ICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdC0gMC4wMDA2MjggKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDIzNS43MDA0ICsgODkwNTM0LjIyMzAgKiB0IC0gMzIuNjAxICogdDJlNCBcclxuXHQrIDMuNjY0ICogdDNlNiAgLSAxLjc2OSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMzkzICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyOTEuNTQ3MiAtIDEyNzcyNy4wMjQ1ICogdCAtIDQyNS4wODIgKiB0MmU0IFxyXG5cdC0gNTAuMDYyICogdDNlNiArIDIzLjY1MSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMjg0ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgzMjguMjQ0NSAtIDk5ODYyLjU2MjUgKiB0IC0gMjExLjAwNSAqIHQyZTQgXHJcblx0LSAyNS4wNzIgKiB0M2U2ICsgMTEuODI2ICogdDRlOCkpIFxyXG5cdC0gMC4wMDAyNzggKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDE2Mi44ODY4IC0gMzE5MzEuNzU2MSAqIHQgLSAxMDYuMjcxICogdDJlNCBcclxuXHQtIDEyLjUxNiAqIHQzZTYgKyA1LjkxMyAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMjQwICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyNjkuOTI2OCArIDk1NDM5Ny43MzUzICogdCArIDE3OS45NDEgKiB0MmU0IFxyXG5cdCsgMjguNjk1ICogdDNlNiAtIDEzLjU5NCAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMjMwICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMTEuNDAwOCArIDE3ODEwNjguNDQ2MSAqIHQgLSA2NS4yMDEgKiB0MmU0IFxyXG5cdCsgNy4zMjggKiB0M2U2ICAtIDMuNTM4ICogdDRlOCkpIFxyXG5cdCsgMC4wMDAyMjkgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDE2Ny4yNDc2ICsgNzYyODA3LjE5ODYgKiB0IC0gNDU3LjY4MyAqIHQyZTQgXHJcblx0LSA0Ni4zOTggKiB0M2U2ICsgMjEuODgyICogdDRlOCkpIFxyXG5cdC0gMC4wMDAyMDIgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKCA4My4zODI2IC0gMTIwMDYuMjk5OCAqIHQgKyAyNDcuOTk5ICogdDJlNCBcclxuXHQrIDI5LjI2MiAqIHQzZTYgLSAxMy44MjYgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDE5MCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTkwLjgxMDIgLSA1NDEwNjIuMzc5OSAqIHQgLSAzMDIuNTExICogdDJlNCBcclxuXHQtIDM5LjM3OSAqIHQzZTYgKyAxOC42MjMgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDE3NyAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMzU3LjUyOTEgKyAzNTk5OS4wNTAzICogdCAtIDEuNTM2ICogdDJlNCBcclxuXHQrIDAuMDQxICogdDNlNiArIDAuMDAwICogdDRlOCkpIFxyXG5cdCsgMC4wMDAxNTMgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDMyLjI4NDIgKyAyODU2MDguMzMwOSAqIHQgLSA1NDcuNjUzICogdDJlNCBcclxuXHQtIDYwLjc0NiAqIHQzZTYgKyAyOC42NzkgKiB0NGU4KSkgXHJcblx0LSAwLjAwMDEzNyAqIE1hdGguY29zKERFR19UT19SQUQgKiAoNDQuODkwMiArIDE0MzE1OTYuNjAyOSAqIHQgKyAyNjkuOTExICogdDJlNCBcclxuXHQrIDQzLjA0MyAqIHQzZTYgLSAyMC4zOTIgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDEyMiAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTQ1LjYyNzIgKyAxODQ0OTMxLjk1ODMgKiB0ICsgMTQ3LjM0MCAqIHQyZTQgXHJcblx0KyAzMi4zNTkgKiB0M2U2IC0gMTUuMzYzICogdDRlOCkpIFxyXG5cdCsgMC4wMDAxMTYgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDMwMi4yMTEwICsgMTI0MDAwNi4wNjYyICogdCAtIDM2Ny43MTMgKiB0MmU0IFxyXG5cdC0gMzIuMDUxICogdDNlNiArIDE1LjA4NSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMTExICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyMDMuOTQ0OSArIDc5MDY3MS42NjA1ICogdCAtIDI0My42MDYgKiB0MmU0IFxyXG5cdC0gMjEuNDA4ICogdDNlNiArIDEwLjA1NyAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMTA4ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICg2OC45ODE1ICsgMzEzNDcyLjc5MjkgKiB0IC0gMzMzLjU3NiAqIHQyZTQgXHJcblx0LSAzNS43NTYgKiB0M2U2ICsgMTYuODU0ICogdDRlOCkpIFxyXG5cdCsgMC4wMDAwOTYgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDMzNi40Mzc0ICsgMTMwMzg2OS41Nzg0ICogdCAtIDE1NS4xNzEgKiB0MmU0IFxyXG5cdC0gNy4wMjAgKiB0M2U2ICsgMy4yNTkgKiB0NGU4KSkgXHJcblx0LSAwLjAwMDA5MCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoOTguMjY2MSArIDQ0OTMzNC40MDU3ICogdCAtIDEyNC4xMDcgKiB0MmU0IFxyXG5cdC0gMTAuNjQzICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdCsgMC4wMDAwOTAgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDEzLjEzNDcgKyAxMzMxNzM0LjA0MDQgKiB0ICsgNTguOTA2ICogdDJlNCBcclxuXHQrIDE3Ljk3MSAqIHQzZTYgLSA4LjU2NiAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDU2ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICg1NS44NDY4IC0gMTAxODI2MS4yNDc1ICogdCAtIDM5Mi40ODIgKiB0MmU0IFxyXG5cdC0gNTMuNzI2ICogdDNlNiArIDI1LjQyMCAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMDU2ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyMzguMTcxMyArIDg1NDUzNS4xNzI3ICogdCAtIDMxLjA2NSAqIHQyZTQgXHJcblx0KyAzLjYyMyAqIHQzZTYgLSAxLjc2OSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDUyICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgzMDguNDE5MiAtIDQ4OTIwNS4xNjc0ICogdCArIDE1OC4wMjkgKiB0MmU0IFxyXG5cdCsgMTQuOTE1ICogdDNlNiAtIDcuMDI5ICogdDRlOCkpIFxyXG5cdC0gMC4wMDAwNTAgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDEzMy4wMjEyICsgNjk4OTQzLjY4NjMgKiB0IC0gNjcwLjIyNCAqIHQyZTQgXHJcblx0LSA3MS40MjkgKiB0M2U2ICsgMzMuNzA4ICogdDRlOCkpIFxyXG5cdC0gMC4wMDAwNDkgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDI2Ny45ODQ2ICsgMTE3NjE0Mi41NTQwICogdCAtIDU4MC4yNTQgKiB0MmU0IFxyXG5cdC0gNTcuMDgyICogdDNlNiArIDI2LjkxMSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMDQ5ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxODQuMTE5NiArIDQwMTMyOS4wNTU2ICogdCArIDEyNS40MjggKiB0MmU0IFxyXG5cdCsgMTguNTc5ICogdDNlNiAtIDguNzk4ICogdDRlOCkpIFxyXG5cdC0gMC4wMDAwNDUgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDQ5LjE1NjIgLSA3NTg2OS44MTIwICogdCArIDM1LjQ1OCAqIHQyZTQgXHJcblx0KyA0LjIzMSAqIHQzZTYgLSAyLjAwMSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDQ0ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyNTcuMzIwOCAtIDE5MTU5MC41MzY3ICogdCAtIDYzNy42MjMgKiB0MmU0IFxyXG5cdC0gNzUuMDkzICogdDNlNiArIDM1LjQ3NyAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDQyICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMDUuNjc4OCArIDM0MTMzNy4yNTQ4ICogdCAtIDExOS40OTkgKiB0MmU0IFxyXG5cdC0gMTAuNzY1ICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdCsgMC4wMDAwNDIgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDE2MC40MTU5ICsgNDA2Ny4yOTQyICogdCAtIDEwNy44MDYgKiB0MmU0IFxyXG5cdC0gMTIuNDc1ICogdDNlNiArIDUuOTEzICogdDRlOCkpIFxyXG5cdCsgMC4wMDAwNDAgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDI0Ni4zNjQyICsgMjI1ODI2Ny4zMTM3ICogdCArIDI0Ljc2OSAqIHQyZTQgXHJcblx0KyAyMS42NzUgKiB0M2U2IC0gMTAuMzM1ICogdDRlOCkpIFxyXG5cdC0gMC4wMDAwNDAgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDE1Ni41ODM4IC0gNjA0OTI1Ljg5MjEgKiB0IC0gNTE1LjA1MyAqIHQyZTQgXHJcblx0LSA2NC40MTAgKiB0M2U2ICsgMzAuNDQ4ICogdDRlOCkpIFxyXG5cdCsgMC4wMDAwMzYgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDE2OS43MTg1ICsgNzI2ODA4LjE0ODMgKiB0IC0gNDU2LjE0NyAqIHQyZTQgXHJcblx0LSA0Ni40MzkgKiB0M2U2ICsgMjEuODgyICogdDRlOCkpIFxyXG5cdCsgMC4wMDAwMjkgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDExMy44NzE3ICsgMTc0NTA2OS4zOTU4ICogdCAtIDYzLjY2NSAqIHQyZTQgXHJcblx0KyA3LjI4NyAqIHQzZTYgLSAzLjUzOCAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMDI5ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyOTcuODUwMiArIDQ0NTI2Ny4xMTE1ICogdCAtIDE2LjMwMCAqIHQyZTQgXHJcblx0KyAxLjgzMiAqIHQzZTYgLSAwLjg4NCAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMDI4ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyOTQuMDE4MSAtIDE2MzcyNi4wNzQ3ICogdCAtIDQyMy41NDYgKiB0MmU0IFxyXG5cdC0gNTAuMTAzICogdDNlNiArIDIzLjY1MSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDI3ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyNjMuNjIzOCArIDM4MTQwMy41OTkzICogdCAtIDIyOC44NDEgKiB0MmU0IFxyXG5cdC0gMjMuMTk5ICogdDNlNiArIDEwLjk0MSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMDI2ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgzNTguMDU3OCArIDIyMTc0NC44MTg3ICogdCAtIDc2MC4xOTQgKiB0MmU0IFxyXG5cdC0gODUuNzc3ICogdDNlNiArIDQwLjUwNSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMDI2ICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICg4LjE5MjkgKyAxNDAzNzMyLjE0MTAgKiB0ICsgNTUuODM0ICogdDJlNCBcclxuXHQrIDE4LjA1MiAqIHQzZTYgLSA4LjU2NiAqIHQ0ZTgpKTtcclxuXHJcblx0dmFyIHNlZHAgPSAtMC4wMDIyICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMDMuMiArIDM3NzMzNi4zICogdCkpO1xyXG5cclxuXHR2YXIgZWNjID0gMC4wNTU1NDQgKyBzZSArIDFlLTMgKiB0ICogc2VkcDtcclxuXHJcblx0Ly8lIHNpbmUgb2YgaGFsZiB0aGUgaW5jbGluYXRpb25cclxuXHJcbnZhciBzZyA9IDAuMDAxMTc3NiAqIE1hdGguY29zKERFR19UT19SQUQgKiAoNDkuMTU2MiAtIDc1ODY5LjgxMjAgKiB0ICsgMzUuNDU4ICogdDJlNCBcclxuXHQrIDQuMjMxICogdDNlNiAtIDIuMDAxICogdDRlOCkpIFxyXG5cdC0gMC4wMDAwOTcxICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyMzUuNzAwNCArIDg5MDUzNC4yMjMwICogdCAtIDMyLjYwMSAqIHQyZTQgXHJcblx0KyAzLjY2NCAqIHQzZTYgLSAxLjc2OSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDkwOCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTg2LjU0NDIgKyA5NjY0MDQuMDM1MSAqIHQgLSA2OC4wNTggKiB0MmU0IFxyXG5cdC0gMC41NjcgKiB0M2U2ICsgMC4yMzIgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDA2MjMgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDgzLjM4MjYgLSAxMjAwNi4yOTk4ICogdCArIDI0Ny45OTkgKiB0MmU0IFxyXG5cdCsgMjkuMjYyICogdDNlNiAtIDEzLjgyNiAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDQ4MyAqIE1hdGguY29zKERFR19UT19SQUQgKiAoNTEuNjI3MSAtIDExMTg2OC44NjIzICogdCArIDM2Ljk5NCAqIHQyZTQgXHJcblx0KyA0LjE5MCAqIHQzZTYgLSAyLjAwMSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDM0OCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTAwLjczNzAgKyA0MTMzMzUuMzU1NCAqIHQgLSAxMjIuNTcxICogdDJlNCBcclxuXHQtIDEwLjY4NCAqIHQzZTYgKyA1LjAyOCAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMDMxNiAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMzA4LjQxOTIgLSA0ODkyMDUuMTY3NCAqIHQgKyAxNTguMDI5ICogdDJlNCBcclxuXHQrIDE0LjkxNSAqIHQzZTYgLSA3LjAyOSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMDI1MyAqIE1hdGguY29zKERFR19UT19SQUQgKiAoNDYuNjg1MyAtIDM5ODcwLjc2MTcgKiB0ICsgMzMuOTIyICogdDJlNCBcclxuXHQrIDQuMjcyICogdDNlNiAtIDIuMDAxICogdDRlOCkpIFxyXG5cdC0gMC4wMDAwMTQxICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgyNzQuMTkyOCAtIDU1MzA2OC42Nzk3ICogdCAtIDU0LjUxMyAqIHQyZTQgXHJcblx0LSAxMC4xMTYgKiB0M2U2ICsgNC43OTcgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDAxMjcgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDMyNS43NzM2IC0gNjM4NjMuNTEyMiAqIHQgLSAyMTIuNTQxICogdDJlNCBcclxuXHQtIDI1LjAzMSAqIHQzZTYgKyAxMS44MjYgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDAxMTcgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDE4NC4xMTk2ICsgNDAxMzI5LjA1NTYgKiB0ICsgMTI1LjQyOCAqIHQyZTQgXHJcblx0KyAxOC41NzkgKiB0M2U2IC0gOC43OTggKiB0NGU4KSkgXHJcblx0LSAwLjAwMDAwNzggKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDk4LjMxMjQgLSAxNTE3MzkuNjI0MCAqIHQgKyA3MC45MTYgKiB0MmU0IFxyXG5cdCsgOC40NjIgKiB0M2U2IC0gNC4wMDEgKiB0NGU4KSkgXHJcblx0LSAwLjAwMDAwNjMgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDIzOC4xNzEzICsgODU0NTM1LjE3MjcgKiB0IC0gMzEuMDY1ICogdDJlNCBcclxuXHQrIDMuNjIzICogdDNlNiAtIDEuNzY5ICogdDRlOCkpIFxyXG5cdCsgMC4wMDAwMDYzICogTWF0aC5jb3MoREVHX1RPX1JBRCAqICgxMzQuOTYzNCArIDQ3NzE5OC44Njc2ICogdCArIDg5Ljk3MCAqIHQyZTQgXHJcblx0KyAxNC4zNDggKiB0M2U2IC0gNi43OTcgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDAwMzYgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDMyMS41MDc2ICsgMTQ0MzYwMi45MDI3ICogdCArIDIxLjkxMiAqIHQyZTQgXHJcblx0KyAxMy43ODAgKiB0M2U2IC0gNi41NjYgKiB0NGU4KSkgXHJcblx0LSAwLjAwMDAwMzUgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDEwLjY2MzggKyAxMzY3NzMzLjA5MDcgKiB0ICsgNTcuMzcwICogdDJlNCBcclxuXHQrIDE4LjAxMSAqIHQzZTYgLSA4LjU2NiAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMDAyNCAqIE1hdGguY29zKERFR19UT19SQUQgKiAoMTQ5Ljg5MzIgKyAzMzc0NjUuNTQzNCAqIHQgLSA4Ny4xMTMgKiB0MmU0IFxyXG5cdC0gNi40NTMgKiB0M2U2ICsgMy4wMjggKiB0NGU4KSkgXHJcblx0KyAwLjAwMDAwMjQgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDE3MC45ODQ5IC0gOTMwNDA0Ljk4NDggKiB0ICsgNjYuNTIzICogdDJlNCBcclxuXHQrIDAuNjA4ICogdDNlNiAtIDAuMjMyICogdDRlOCkpO1xyXG5cclxuXHR2YXIgc2dwID0gLSAwLjAyMDMgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDEyNS4wIC0gMTkzNC4xICogdCkpIFxyXG5cdFx0KyAwLjAwMzQgKiBNYXRoLmNvcyhERUdfVE9fUkFEICogKDIyMC4yIC0gMTkzNS41ICogdCkpO1xyXG5cclxuXHR2YXIgZ2FtbWEgPSAwLjA0NDk4NTggKyBzZyArIDFlLTMgKiBzZ3A7XHJcblxyXG5cdC8vJSBsb25naXR1ZGUgb2YgcGVyaWdlZVxyXG5cclxuXHR2YXIgc3AgPSAtIDE1LjQ0OCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTAwLjczNzAgKyA0MTMzMzUuMzU1NCAqIHQgLSAxMjIuNTcxICogdDJlNCBcclxuXHQtIDEwLjY4NCAqIHQzZTYgKyA1LjAyOCAqIHQ0ZTgpKVxyXG5cdC0gOS42NDIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDMyNS43NzM2IC0gNjM4NjMuNTEyMiAqIHQgLSAyMTIuNTQxICogdDJlNCBcclxuXHQtIDI1LjAzMSAqIHQzZTYgKyAxMS44MjYgKiB0NGU4KSkgXHJcblx0LSAyLjcyMSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTM0Ljk2MzQgKyA0NzcxOTguODY3NiAqIHQgKyA4OS45NzAgKiB0MmU0IFxyXG5cdCsgMTQuMzQ4ICogdDNlNiAtIDYuNzk3ICogdDRlOCkpIFxyXG5cdCsgMi42MDcgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDY2LjUxMDYgKyAzNDk0NzEuODQzMiAqIHQgLSAzMzUuMTEyICogdDJlNCBcclxuXHQtIDM1LjcxNSAqIHQzZTYgKyAxNi44NTQgKiB0NGU4KSkgXHJcblx0KyAyLjA4NSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjAxLjQ3NDAgKyA4MjY2NzAuNzEwOCAqIHQgLSAyNDUuMTQyICogdDJlNCBcclxuXHQtIDIxLjM2NyAqIHQzZTYgKyAxMC4wNTcgKiB0NGU4KSkgXHJcblx0KyAxLjQ3NyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTAuNjYzOCArIDEzNjc3MzMuMDkwNyAqIHQgKyA1Ny4zNzAgKiB0MmU0IFxyXG5cdCsgMTguMDExICogdDNlNiAtIDguNTY2ICogdDRlOCkpIFxyXG5cdCsgMC45NjggKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDI5MS41NDcyIC0gMTI3NzI3LjAyNDUgKiB0IC0gNDI1LjA4MiAqIHQyZTQgXHJcblx0LSA1MC4wNjIgKiB0M2U2ICsgMjMuNjUxICogdDRlOCkpIFxyXG5cdC0gMC45NDkgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDEwMy4yMDc5ICsgMzc3MzM2LjMwNTEgKiB0IC0gMTIxLjAzNSAqIHQyZTQgXHJcblx0LSAxMC43MjQgKiB0M2U2ICsgNS4wMjggKiB0NGU4KSkgXHJcblx0LSAwLjcwMyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTY3LjI0NzYgKyA3NjI4MDcuMTk4NiAqIHQgLSA0NTcuNjgzICogdDJlNCBcclxuXHQtIDQ2LjM5OCAqIHQzZTYgKyAyMS44ODIgKiB0NGU4KSkgXHJcblx0LSAwLjY2MCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjM1LjcwMDQgKyA4OTA1MzQuMjIzMCAqIHQgLSAzMi42MDEgKiB0MmU0IFxyXG5cdCsgMy42NjQgKiB0M2U2IC0gMS43NjkgKiB0NGU4KSkgXHJcblx0LSAwLjU3NyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTkwLjgxMDIgLSA1NDEwNjIuMzc5OSAqIHQgLSAzMDIuNTExICogdDJlNCBcclxuXHQtIDM5LjM3OSAqIHQzZTYgKyAxOC42MjMgKiB0NGU4KSkgXHJcblx0LSAwLjUyNCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjY5LjkyNjggKyA5NTQzOTcuNzM1MyAqIHQgKyAxNzkuOTQxICogdDJlNCBcclxuXHQrIDI4LjY5NSAqIHQzZTYgLSAxMy41OTQgKiB0NGU4KSkgXHJcblx0LSAwLjQ4MiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzIuMjg0MiArIDI4NTYwOC4zMzA5ICogdCAtIDU0Ny42NTMgKiB0MmU0IFxyXG5cdC0gNjAuNzQ2ICogdDNlNiArIDI4LjY3OSAqIHQ0ZTgpKSBcclxuXHQrIDAuNDUyICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgzNTcuNTI5MSArIDM1OTk5LjA1MDMgKiB0IC0gMS41MzYgKiB0MmU0IFxyXG5cdCsgMC4wNDEgKiB0M2U2ICsgMC4wMDAgKiB0NGU4KSkgXHJcblx0LSAwLjM4MSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzAyLjIxMTAgKyAxMjQwMDA2LjA2NjIgKiB0IC0gMzY3LjcxMyAqIHQyZTQgXHJcblx0LSAzMi4wNTEgKiB0M2U2ICsgMTUuMDg1ICogdDRlOCkpIFxyXG5cdC0gMC4zNDIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDMyOC4yNDQ1IC0gOTk4NjIuNTYyNSAqIHQgLSAyMTEuMDA1ICogdDJlNCBcclxuXHQtIDI1LjA3MiAqIHQzZTYgKyAxMS44MjYgKiB0NGU4KSkgXHJcblx0LSAwLjMxMiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoNDQuODkwMiArIDE0MzE1OTYuNjAyOSAqIHQgKyAyNjkuOTExICogdDJlNCBcclxuXHQrIDQzLjA0MyAqIHQzZTYgLSAyMC4zOTIgKiB0NGU4KSkgXHJcblx0KyAwLjI4MiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTYyLjg4NjggLSAzMTkzMS43NTYxICogdCAtIDEwNi4yNzEgKiB0MmU0IFxyXG5cdC0gMTIuNTE2ICogdDNlNiArIDUuOTEzICogdDRlOCkpIFxyXG5cdCsgMC4yNTUgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDIwMy45NDQ5ICsgNzkwNjcxLjY2MDUgKiB0IC0gMjQzLjYwNiAqIHQyZTQgXHJcblx0LSAyMS40MDggKiB0M2U2ICsgMTAuMDU3ICogdDRlOCkpIFxyXG5cdCsgMC4yNTIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDY4Ljk4MTUgKyAzMTM0NzIuNzkyOSAqIHQgLSAzMzMuNTc2ICogdDJlNCBcclxuXHQtIDM1Ljc1NiAqIHQzZTYgKyAxNi44NTQgKiB0NGU4KSkgXHJcblx0LSAwLjIxMSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoODMuMzgyNiAtIDEyMDA2LjI5OTggKiB0ICsgMjQ3Ljk5OSAqIHQyZTQgXHJcblx0KyAyOS4yNjIgKiB0M2U2IC0gMTMuODI2ICogdDRlOCkpIFxyXG5cdCsgMC4xOTMgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDI2Ny45ODQ2ICsgMTE3NjE0Mi41NTQwICogdCAtIDU4MC4yNTQgKiB0MmU0IFxyXG5cdC0gNTcuMDgyICogdDNlNiArIDI2LjkxMSAqIHQ0ZTgpKSBcclxuXHQrIDAuMTkxICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMzMuMDIxMiArIDY5ODk0My42ODYzICogdCAtIDY3MC4yMjQgKiB0MmU0IFxyXG5cdC0gNzEuNDI5ICogdDNlNiArIDMzLjcwOCAqIHQ0ZTgpKSBcclxuXHQtIDAuMTg0ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICg1NS44NDY4IC0gMTAxODI2MS4yNDc1ICogdCAtIDM5Mi40ODIgKiB0MmU0IFxyXG5cdC0gNTMuNzI2ICogdDNlNiArIDI1LjQyMCAqIHQ0ZTgpKSBcclxuXHQrIDAuMTgyICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxNDUuNjI3MiArIDE4NDQ5MzEuOTU4MyAqIHQgKyAxNDcuMzQwICogdDJlNCBcclxuXHQrIDMyLjM1OSAqIHQzZTYgLSAxNS4zNjMgKiB0NGU4KSkgXHJcblx0LSAwLjE1OCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjU3LjMyMDggLSAxOTE1OTAuNTM2NyAqIHQgLSA2MzcuNjIzICogdDJlNCBcclxuXHQtIDc1LjA5MyAqIHQzZTYgKyAzNS40NzcgKiB0NGU4KSkgXHJcblx0KyAwLjE0OCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTU2LjU4MzggLSA2MDQ5MjUuODkyMSAqIHQgLSA1MTUuMDUzICogdDJlNCBcclxuXHQtIDY0LjQxMCAqIHQzZTYgKyAzMC40NDggKiB0NGU4KSkgXHJcblx0LSAwLjExMSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTY5LjcxODUgKyA3MjY4MDguMTQ4MyAqIHQgLSA0NTYuMTQ3ICogdDJlNCBcclxuXHQtIDQ2LjQzOSAqIHQzZTYgKyAyMS44ODIgKiB0NGU4KSkgXHJcblx0KyAwLjEwMSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTMuMTM0NyArIDEzMzE3MzQuMDQwNCAqIHQgKyA1OC45MDYgKiB0MmU0IFxyXG5cdCsgMTcuOTcxICogdDNlNiAtIDguNTY2ICogdDRlOCkpIFxyXG5cdCsgMC4xMDAgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDM1OC4wNTc4ICsgMjIxNzQ0LjgxODcgKiB0IC0gNzYwLjE5NCAqIHQyZTQgXHJcblx0LSA4NS43NzcgKiB0M2U2ICsgNDAuNTA1ICogdDRlOCkpIFxyXG5cdCsgMC4wODcgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDk4LjI2NjEgKyA0NDkzMzQuNDA1NyAqIHQgLSAxMjQuMTA3ICogdDJlNCBcclxuXHQtIDEwLjY0MyAqIHQzZTYgKyA1LjAyOCAqIHQ0ZTgpKSBcclxuXHQrIDAuMDgwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICg0Mi45NDgwICsgMTY1MzM0MS40MjE2ICogdCAtIDQ5MC4yODMgKiB0MmU0IFxyXG5cdC0gNDIuNzM0ICogdDNlNiArIDIwLjExMyAqIHQ0ZTgpKSBcclxuXHQrIDAuMDgwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyMjIuNTY1NyAtIDQ0MTE5OS44MTczICogdCAtIDkxLjUwNiAqIHQyZTQgXHJcblx0LSAxNC4zMDcgKiB0M2U2ICsgNi43OTcgKiB0NGU4KSkgXHJcblx0KyAwLjA3NyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjk0LjAxODEgLSAxNjM3MjYuMDc0NyAqIHQgLSA0MjMuNTQ2ICogdDJlNCBcclxuXHQtIDUwLjEwMyAqIHQzZTYgKyAyMy42NTEgKiB0NGU4KSkgXHJcblx0LSAwLjA3MyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjgwLjg4MzQgLSAxNDk1NDYwLjExNTEgKiB0IC0gNDgyLjQ1MiAqIHQyZTQgXHJcblx0LSA2OC4wNzQgKiB0M2U2ICsgMzIuMjE3ICogdDRlOCkpIFxyXG5cdC0gMC4wNzEgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDMwNC42ODE5ICsgMTIwNDAwNy4wMTU5ICogdCAtIDM2Ni4xNzcgKiB0MmU0IFxyXG5cdC0gMzIuMDkyICogdDNlNiArIDE1LjA4NSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDY5ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyMzMuNzU4MiArIDExMTIyNzkuMDQxNyAqIHQgLSA3OTIuNzk1ICogdDJlNCBcclxuXHQtIDgyLjExMyAqIHQzZTYgKyAzOC43MzYgKiB0NGU4KSkgXHJcblx0LSAwLjA2NyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzQuNzU1MSArIDI0OTYwOS4yODA3ICogdCAtIDU0Ni4xMTcgKiB0MmU0IFxyXG5cdC0gNjAuNzg3ICogdDNlNiArIDI4LjY3OSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDY3ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyNjMuNjIzOCArIDM4MTQwMy41OTkzICogdCAtIDIyOC44NDEgKiB0MmU0IFxyXG5cdC0gMjMuMTk5ICogdDNlNiArIDEwLjk0MSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDU1ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyMS42MjAzIC0gMTA4MjEyNC43NTk3ICogdCAtIDYwNS4wMjMgKiB0MmU0IFxyXG5cdC0gNzguNzU3ICogdDNlNiArIDM3LjI0NiAqIHQ0ZTgpKSBcclxuXHQrIDAuMDU1ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgzMDguNDE5MiAtIDQ4OTIwNS4xNjc0ICogdCArIDE1OC4wMjkgKiB0MmU0IFxyXG5cdCsgMTQuOTE1ICogdDNlNiAtNy4wMjkgKiB0NGU4KSkgXHJcblx0LSAwLjA1NCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoOC43MjE2ICsgMTU4OTQ3Ny45MDk0ICogdCAtIDcwMi44MjQgKiB0MmU0IFxyXG5cdC0gNjcuNzY2ICogdDNlNiArIDMxLjkzOSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDUyICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxNzkuODUzNiArIDE5MDg3OTUuNDcwNSAqIHQgKyAzNTkuODgxICogdDJlNCBcclxuXHQrIDU3LjM5MCAqIHQzZTYgLSAyNy4xODkgKiB0NGU4KSkgXHJcblx0LSAwLjA1MCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoOTguNzk0OCArIDYzNTA4MC4xNzQxICogdCAtIDg4Mi43NjUgKiB0MmU0IFxyXG5cdC0gOTYuNDYxICogdDNlNiArIDQ1LjUzMyAqIHQ0ZTgpKSBcclxuXHQtIDAuMDQ5ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMjguNjYwNCAtIDk1Nzk1LjI2ODMgKiB0IC0gMzE4LjgxMiAqIHQyZTQgXHJcblx0LSAzNy41NDcgKiB0M2U2ICsgMTcuNzM4ICogdDRlOCkpIFxyXG5cdC0gMC4wNDcgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDE3LjM1NDQgKyA0MjUzNDEuNjU1MiAqIHQgLSAzNzAuNTcwICogdDJlNCBcclxuXHQtIDM5Ljk0NiAqIHQzZTYgKyAxOC44NTQgKiB0NGU4KSkgXHJcblx0LSAwLjA0NCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTYwLjQxNTkgKyA0MDY3LjI5NDIgKiB0IC0gMTA3LjgwNiAqIHQyZTQgXHJcblx0LSAxMi40NzUgKiB0M2U2ICsgNS45MTMgKiB0NGU4KSkgXHJcblx0LSAwLjA0MyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjM4LjE3MTMgKyA4NTQ1MzUuMTcyNyAqIHQgLSAzMS4wNjUgKiB0MmU0IFxyXG5cdCsgMy42MjMgKiB0M2U2IC0gMS43NjkgKiB0NGU4KSkgXHJcblx0KyAwLjA0MiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjcwLjQ1NTUgKyAxMTQwMTQzLjUwMzcgKiB0IC0gNTc4LjcxOCAqIHQyZTQgXHJcblx0LSA1Ny4xMjMgKiB0M2U2ICsgMjYuOTExICogdDRlOCkpIFxyXG5cdC0gMC4wNDIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDEzMi40OTI1ICsgNTEzMTk3LjkxNzkgKiB0ICsgODguNDM0ICogdDJlNCBcclxuXHQrIDE0LjM4OCAqIHQzZTYgLSA2Ljc5NyAqIHQ0ZTgpKSBcclxuXHQtIDAuMDQxICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMjIuMzU3MyAtIDY2ODc4OS40MDQzICogdCAtIDcyNy41OTQgKiB0MmU0IFxyXG5cdC0gODkuNDQxICogdDNlNiArIDQyLjI3NCAqIHQ0ZTgpKSBcclxuXHQtIDAuMDQwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMDUuNjc4OCArIDM0MTMzNy4yNTQ4ICogdCAtIDExOS40OTkgKiB0MmU0IFxyXG5cdC0gMTAuNzY1ICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdCsgMC4wMzggKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDEzNS40OTIxICsgNjYyOTQ0LjYzNjEgKiB0IC0gNjY4LjY4OCAqIHQyZTQgXHJcblx0LSA3MS40NzAgKiB0M2U2ICsgMzMuNzA4ICogdDRlOCkpIFxyXG5cdC0gMC4wMzcgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDI0Mi4zOTEwIC0gNTE4NTcuMjEyNCAqIHQgLSA0NjAuNTQwICogdDJlNCBcclxuXHQtIDU0LjI5MyAqIHQzZTYgKyAyNS42NTIgKiB0NGU4KSkgXHJcblx0KyAwLjAzNiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzM2LjQzNzQgKyAgMTMwMzg2OS41Nzg0ICogdCAtIDE1NS4xNzEgKiB0MmU0IFxyXG5cdC0gNy4wMjAgKiB0M2U2ICsgMy4yNTkgKiB0NGU4KSkgXHJcblx0KyAwLjAzNSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjIzLjA5NDMgLSAyNTU0NTQuMDQ4OSAqIHQgLSA4NTAuMTY0ICogdDJlNCBcclxuXHQtIDEwMC4xMjQgKiB0M2U2ICsgNDcuMzAyICogdDRlOCkpIFxyXG5cdC0gMC4wMzQgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDE5My4yODExIC0gNTc3MDYxLjQzMDIgKiB0IC0gMzAwLjk3NiAqIHQyZTQgXHJcblx0LSAzOS40MTkgKiB0M2U2ICsgMTguNjIzICogdDRlOCkpIFxyXG5cdCsgMC4wMzEgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDg3LjYwMjMgLSA5MTgzOTguNjg1MCAqIHQgLSAxODEuNDc2ICogdDJlNCBcclxuXHQtIDI4LjY1NCAqIHQzZTYgKyAxMy41OTQgKiB0NGU4KSk7XHJcblxyXG5cdHZhciBzcHAgPSAyLjQgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDEwMy4yICsgMzc3MzM2LjMgKiB0KSk7XHJcblxyXG5cdHZhciBscCA9IDgzLjM1MyArIDQwNjkuMDEzNyAqIHQgLSAxMDMuMjM4ICogdDJlNCBcclxuXHQtIDEyLjQ5MiAqIHQzZTYgKyA1LjI2MyAqIHQ0ZTggKyBzcCArIDFlLTMgKiB0ICogc3BwO1xyXG5cclxuXHQvLyUgbG9uZ2l0dWRlIG9mIHRoZSBhc2NlbmRpbmcgbm9kZVxyXG5cclxuXHR2YXIgc3IgPSAtIDEuNDk3OSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoNDkuMTU2MiAtIDc1ODY5LjgxMjAgKiB0ICsgMzUuNDU4ICogdDJlNCBcclxuXHQrIDQuMjMxICogdDNlNiAtIDIuMDAxICogdDRlOCkpIFxyXG5cdC0gMC4xNTAwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgzNTcuNTI5MSArIDM1OTk5LjA1MDMgKiB0IC0gMS41MzYgKiB0MmU0IFxyXG5cdCsgMC4wNDEgKiB0M2U2ICsgMC4wMDAgKiB0NGU4KSkgXHJcblx0LSAwLjEyMjYgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDIzNS43MDA0ICsgODkwNTM0LjIyMzAgKiB0IC0gMzIuNjAxICogdDJlNCBcclxuXHQrIDMuNjY0ICogdDNlNiAtIDEuNzY5ICogdDRlOCkpIFxyXG5cdCsgMC4xMTc2ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxODYuNTQ0MiArIDk2NjQwNC4wMzUxICogdCAtIDY4LjA1OCAqIHQyZTQgXHJcblx0LSAwLjU2NyAqIHQzZTYgKyAwLjIzMiAqIHQ0ZTgpKSBcclxuXHQtIDAuMDgwMSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoODMuMzgyNiAtIDEyMDA2LjI5OTggKiB0ICsgMjQ3Ljk5OSAqIHQyZTQgXHJcblx0KyAyOS4yNjIgKiB0M2U2IC0gMTMuODI2ICogdDRlOCkpIFxyXG5cdC0gMC4wNjE2ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICg1MS42MjcxIC0gMTExODY4Ljg2MjMgKiB0ICsgMzYuOTk0ICogdDJlNCBcclxuXHQrIDQuMTkwICogdDNlNiAtIDIuMDAxICogdDRlOCkpIFxyXG5cdCsgMC4wNDkwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMDAuNzM3MCArIDQxMzMzNS4zNTU0ICogdCAtIDEyMi41NzEgKiB0MmU0IFxyXG5cdC0gMTAuNjg0ICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdCsgMC4wNDA5ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgzMDguNDE5MiAtIDQ4OTIwNS4xNjc0ICogdCArIDE1OC4wMjkgKiB0MmU0IFxyXG5cdCsgMTQuOTE1ICogdDNlNiAtIDcuMDI5ICogdDRlOCkpIFxyXG5cdCsgMC4wMzI3ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMzQuOTYzNCArIDQ3NzE5OC44Njc2ICogdCArIDg5Ljk3MCAqIHQyZTQgXHJcblx0KyAxNC4zNDggKiB0M2U2IC0gNi43OTcgKiB0NGU4KSkgXHJcblx0KyAwLjAzMjQgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDQ2LjY4NTMgLSAzOTg3MC43NjE3ICogdCArIDMzLjkyMiAqIHQyZTQgXHJcblx0KyA0LjI3MiAqIHQzZTYgLSAyLjAwMSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDE5NiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoOTguMzEyNCAtIDE1MTczOS42MjQwICogdCArIDcwLjkxNiAqIHQyZTQgXHJcblx0KyA4LjQ2MiAqIHQzZTYgLSA0LjAwMSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDE4MCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjc0LjE5MjggLSA1NTMwNjguNjc5NyAqIHQgLSA1NC41MTMgKiB0MmU0IFxyXG5cdC0gMTAuMTE2ICogdDNlNiArIDQuNzk3ICogdDRlOCkpIFxyXG5cdCsgMC4wMTUwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgzMjUuNzczNiAtIDYzODYzLjUxMjIgKiB0IC0gMjEyLjU0MSAqIHQyZTQgXHJcblx0LSAyNS4wMzEgKiB0M2U2ICsgMTEuODI2ICogdDRlOCkpIFxyXG5cdC0gMC4wMTUwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxODQuMTE5NiArIDQwMTMyOS4wNTU2ICogdCArIDEyNS40MjggKiB0MmU0IFxyXG5cdCsgMTguNTc5ICogdDNlNiAtIDguNzk4ICogdDRlOCkpIFxyXG5cdC0gMC4wMDc4ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyMzguMTcxMyArIDg1NDUzNS4xNzI3ICogdCAtIDMxLjA2NSAqIHQyZTQgXHJcblx0KyAzLjYyMyAqIHQzZTYgLSAxLjc2OSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDA0NSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTAuNjYzOCArIDEzNjc3MzMuMDkwNyAqIHQgKyA1Ny4zNzAgKiB0MmU0IFxyXG5cdCsgMTguMDExICogdDNlNiAtIDguNTY2ICogdDRlOCkpIFxyXG5cdCsgMC4wMDQ0ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgzMjEuNTA3NiArIDE0NDM2MDIuOTAyNyAqIHQgKyAyMS45MTIgKiB0MmU0IFxyXG5cdCsgMTMuNzgwICogdDNlNiAtIDYuNTY2ICogdDRlOCkpIFxyXG5cdC0gMC4wMDQyICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxNjIuODg2OCAtIDMxOTMxLjc1NjEgKiB0IC0gMTA2LjI3MSAqIHQyZTQgXHJcblx0LSAxMi41MTYgKiB0M2U2ICsgNS45MTMgKiB0NGU4KSkgXHJcblx0LSAwLjAwMzEgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDE3MC45ODQ5IC0gOTMwNDA0Ljk4NDggKiB0ICsgNjYuNTIzICogdDJlNCBcclxuXHQrIDAuNjA4ICogdDNlNiAtIDAuMjMyICogdDRlOCkpIFxyXG5cdCsgMC4wMDMxICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMDMuMjA3OSArIDM3NzMzNi4zMDUxICogdCAtIDEyMS4wMzUgKiB0MmU0IFxyXG5cdC0gMTAuNzI0ICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdCsgMC4wMDI5ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyMjIuNjEyMCAtIDEwNDIyNzMuODQ3MSAqIHQgKyAxMDMuNTE2ICogdDJlNCBcclxuXHQrIDQuNzk4ICogdDNlNiAtIDIuMjMyICogdDRlOCkpIFxyXG5cdCsgMC4wMDI4ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxODQuMDczMyArIDEwMDI0MDMuMDg1MyAqIHQgLSA2OS41OTQgKiB0MmU0IFxyXG5cdC0gMC41MjYgKiB0M2U2ICsgMC4yMzIgKiB0NGU4KSk7XHJcblxyXG5cdHZhciBzcnAgPSAyNS45ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMjUuMCAtIDE5MzQuMSAqIHQpKSBcclxuXHRcdC0gNC4zICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyMjAuMiAtIDE5MzUuNSAqIHQpKTtcclxuXHJcblx0dmFyIHNycHAgPSAwLjM4ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgzNTcuNSArIDM1OTk5LjEgKiB0KSk7XHJcblxyXG5cdHZhciByYWFuID0gMTI1LjA0NDYgLSAxOTM0LjEzNjE4ICogdCArIDIwLjc2MiAqIHQyZTQgXHJcblx0XHQrIDIuMTM5ICogdDNlNiAtIDEuNjUwICogdDRlOCArIHNyIFxyXG5cdFx0KyAxZS0zICogKHNycCArIHNycHAgKiB0KTtcclxuXHJcblx0Ly8lIG1lYW4gbG9uZ2l0dWRlXHJcblxyXG5cdHZhciBzbCA9IC0gMC45MjU4MSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjM1LjcwMDQgKyA4OTA1MzQuMjIzMCAqIHQgLSAzMi42MDEgKiB0MmU0IFxyXG5cdCsgMy42NjQgKiB0M2U2IC0gMS43NjkgKiB0NGU4KSkgXHJcblx0KyAwLjMzMjYyICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMDAuNzM3MCArIDQxMzMzNS4zNTU0ICogdCAtIDEyMi41NzEgKiB0MmU0IFxyXG5cdC0gMTAuNjg0ICogdDNlNiArIDUuMDI4ICogdDRlOCkpIFxyXG5cdC0gMC4xODQwMiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzU3LjUyOTEgKyAzNTk5OS4wNTAzICogdCAtIDEuNTM2ICogdDJlNCBcclxuXHQrIDAuMDQxICogdDNlNiArIDAuMDAwICogdDRlOCkpIFxyXG5cdCsgMC4xMTAwNyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTM0Ljk2MzQgKyA0NzcxOTguODY3NiAqIHQgKyA4OS45NzAgKiB0MmU0IFxyXG5cdCsgMTQuMzQ4ICogdDNlNiAtIDYuNzk3ICogdDRlOCkpIFxyXG5cdC0gMC4wNjA1NSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjM4LjE3MTMgKyA4NTQ1MzUuMTcyNyAqIHQgLSAzMS4wNjUgKiB0MmU0IFxyXG5cdCsgMy42MjMgKiB0M2U2IC0gMS43NjkgKiB0NGU4KSkgXHJcblx0KyAwLjA0NzQxICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgzMjUuNzczNiAtIDYzODYzLjUxMjIgKiB0IC0gMjEyLjU0MSAqIHQyZTQgXHJcblx0LSAyNS4wMzEgKiB0M2U2ICsgMTEuODI2ICogdDRlOCkpIFxyXG5cdC0gMC4wMzA4NiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTAuNjYzOCArIDEzNjc3MzMuMDkwNyAqIHQgKyA1Ny4zNzAgKiB0MmU0IFxyXG5cdCsgMTguMDExICogdDNlNiAtIDguNTY2ICogdDRlOCkpIFxyXG5cdCsgMC4wMjE4NCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTAzLjIwNzkgKyAzNzczMzYuMzA1MSAqIHQgLSAxMjEuMDM1ICogdDJlNCBcclxuXHQtIDEwLjcyNCAqIHQzZTYgKyA1LjAyOCAqIHQ0ZTgpKSBcclxuXHQrIDAuMDE2NDUgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDQ5LjE1NjIgLSA3NTg2OS44MTIwICogdCArIDM1LjQ1OCAqIHQyZTQgXHJcblx0KyA0LjIzMSAqIHQzZTYgLSAyLjAwMSAqIHQ0ZTgpKSBcclxuXHQrIDAuMDEwMjIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDIzMy4yMjk1ICsgOTI2NTMzLjI3MzMgKiB0IC0gMzQuMTM2ICogdDJlNCBcclxuXHQrIDMuNzA1ICogdDNlNiAtIDEuNzY5ICogdDRlOCkpIFxyXG5cdC0gMC4wMDc1NiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzM2LjQzNzQgKyAxMzAzODY5LjU3ODQgKiB0IC0gMTU1LjE3MSAqIHQyZTQgXHJcblx0LSA3LjAyMCAqIHQzZTYgKyAzLjI1OSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDA1MzAgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDIyMi41NjU3IC0gNDQxMTk5LjgxNzMgKiB0IC0gOTEuNTA2ICogdDJlNCBcclxuXHQtIDE0LjMwNyAqIHQzZTYgKyA2Ljc5NyAqIHQ0ZTgpKSBcclxuXHQtIDAuMDA0OTYgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDE2Mi44ODY4IC0gMzE5MzEuNzU2MSAqIHQgLSAxMDYuMjcxICogdDJlNCBcclxuXHQtIDEyLjUxNiAqIHQzZTYgKyA1LjkxMyAqIHQ0ZTgpKSBcclxuXHQtIDAuMDA0NzIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDI5Ny44NTAyICsgNDQ1MjY3LjExMTUgKiB0IC0gMTYuMzAwICogdDJlNCBcclxuXHQrIDEuODMyICogdDNlNiAtIDAuODg0ICogdDRlOCkpIFxyXG5cdC0gMC4wMDI3MSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjQwLjY0MjIgKyA4MTg1MzYuMTIyNSAqIHQgLSAyOS41MjkgKiB0MmU0IFxyXG5cdCsgMy41ODIgKiB0M2U2IC0gMS43NjkgKiB0NGU4KSkgXHJcblx0KyAwLjAwMjY0ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMzIuNDkyNSArIDUxMzE5Ny45MTc5ICogdCArIDg4LjQzNCAqIHQyZTQgXHJcblx0KyAxNC4zODggKiB0M2U2IC0gNi43OTcgKiB0NGU4KSkgXHJcblx0LSAwLjAwMjU0ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxODYuNTQ0MiArIDk2NjQwNC4wMzUxICogdCAtIDY4LjA1OCAqIHQyZTQgXHJcblx0LSAwLjU2NyAqIHQzZTYgKyAwLjIzMiAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAyMzQgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDI2OS45MjY4ICsgOTU0Mzk3LjczNTMgKiB0ICsgMTc5Ljk0MSAqIHQyZTQgXHJcblx0KyAyOC42OTUgKiB0M2U2IC0gMTMuNTk0ICogdDRlOCkpIFxyXG5cdC0gMC4wMDIyMCAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTMuMTM0NyArIDEzMzE3MzQuMDQwNCAqIHQgKyA1OC45MDYgKiB0MmU0IFxyXG5cdCsgMTcuOTcxICogdDNlNiAtIDguNTY2ICogdDRlOCkpIFxyXG5cdC0gMC4wMDIwMiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzU1LjA1ODIgKyA3MTk5OC4xMDA2ICogdCAtIDMuMDcyICogdDJlNCBcclxuXHQrIDAuMDgyICogdDNlNiArIDAuMDAwICogdDRlOCkpIFxyXG5cdCsgMC4wMDE2NyAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzI4LjI0NDUgLSA5OTg2Mi41NjI1ICogdCAtIDIxMS4wMDUgKiB0MmU0IFxyXG5cdC0gMjUuMDcyICogdDNlNiArIDExLjgyNiAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAxNDMgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDE3My41NTA2ICsgMTMzNTgwMS4zMzQ2ICogdCAtIDQ4LjkwMSAqIHQyZTQgXHJcblx0KyA1LjQ5NiAqIHQzZTYgLSAyLjY1MyAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAxMjEgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDk4LjI2NjEgKyA0NDkzMzQuNDA1NyAqIHQgLSAxMjQuMTA3ICogdDJlNCBcclxuXHQtIDEwLjY0MyAqIHQzZTYgKyA1LjAyOCAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAxMTYgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDE0NS42MjcyICsgMTg0NDkzMS45NTgzICogdCArIDE0Ny4zNDAgKiB0MmU0IFxyXG5cdCsgMzIuMzU5ICogdDNlNiAtIDE1LjM2MyAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAxMDIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDEwNS42Nzg4ICsgMzQxMzM3LjI1NDggKiB0IC0gMTE5LjQ5OSAqIHQyZTQgXHJcblx0LSAxMC43NjUgKiB0M2U2ICsgNS4wMjggKiB0NGU4KSkgXHJcblx0LSAwLjAwMDkwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxODQuMTE5NiArIDQwMTMyOS4wNTU2ICogdCArIDEyNS40MjggKiB0MmU0IFxyXG5cdCsgMTguNTc5ICogdDNlNiAtIDguNzk4ICogdDRlOCkpIFxyXG5cdC0gMC4wMDA4NiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzM4LjkwODMgKyAxMjY3ODcwLjUyODEgKiB0IC0gMTUzLjYzNiAqIHQyZTQgXHJcblx0LSA3LjA2MSAqIHQzZTYgKyAzLjI1OSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwNzggKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDExMS40MDA4ICsgMTc4MTA2OC40NDYxICogdCAtIDY1LjIwMSAqIHQyZTQgXHJcblx0KyA3LjMyOCAqIHQzZTYgLSAzLjUzOCAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwNjkgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDMyMy4zMDI3IC0gMjc4NjQuNDYxOSAqIHQgLSAyMTQuMDc3ICogdDJlNCBcclxuXHQtIDI0Ljk5MCAqIHQzZTYgKyAxMS44MjYgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDY2ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICg1MS42MjcxIC0gMTExODY4Ljg2MjMgKiB0ICsgMzYuOTk0ICogdDJlNCBcclxuXHQrIDQuMTkwICogdDNlNiAtIDIuMDAxICogdDRlOCkpIFxyXG5cdCsgMC4wMDA2NSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMzguNTg3MiArIDg1ODYwMi40NjY5ICogdCAtIDEzOC44NzEgKiB0MmU0IFxyXG5cdC0gOC44NTIgKiB0M2U2ICsgNC4xNDQgKiB0NGU4KSkgXHJcblx0LSAwLjAwMDYwICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICg4My4zODI2IC0gMTIwMDYuMjk5OCAqIHQgKyAyNDcuOTk5ICogdDJlNCBcclxuXHQrIDI5LjI2MiAqIHQzZTYgLSAxMy44MjYgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDU0ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyMDEuNDc0MCArIDgyNjY3MC43MTA4ICogdCAtIDI0NS4xNDIgKiB0MmU0IFxyXG5cdC0gMjEuMzY3ICogdDNlNiArIDEwLjA1NyAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwNTIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDMwOC40MTkyIC0gNDg5MjA1LjE2NzQgKiB0ICsgMTU4LjAyOSAqIHQyZTQgXHJcblx0KyAxNC45MTUgKiB0M2U2IC0gNy4wMjkgKiB0NGU4KSkgXHJcblx0KyAwLjAwMDQ4ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICg4LjE5MjkgKyAxNDAzNzMyLjE0MTAgKiB0ICsgNTUuODM0ICogdDJlNCBcclxuXHQrIDE4LjA1MiAqIHQzZTYgLSA4LjU2NiAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwNDEgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDQ2LjY4NTMgLSAzOTg3MC43NjE3ICogdCArIDMzLjkyMiAqIHQyZTQgXHJcblx0KyA0LjI3MiAqIHQzZTYgLSAyLjAwMSAqIHQ0ZTgpKSBcclxuXHQtIDAuMDAwMzMgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDI3NC4xOTI4IC0gNTUzMDY4LjY3OTcgKiB0IC0gNTQuNTEzICogdDJlNCBcclxuXHQtIDEwLjExNiAqIHQzZTYgKyA0Ljc5NyAqIHQ0ZTgpKSBcclxuXHQrIDAuMDAwMzAgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDE2MC40MTU5ICsgNDA2Ny4yOTQyICogdCAtIDEwNy44MDYgKiB0MmU0IFxyXG5cdC0gMTIuNDc1ICogdDNlNiArIDUuOTEzICogdDRlOCkpO1xyXG5cclxuXHR2YXIgc2xwID0gMy45NiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTE5LjcgKyAxMzEuOCAqIHQpKSBcclxuXHRcdCsgMS45NiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMTI1LjAgLSAxOTM0LjEgKiB0KSk7XHJcblxyXG5cdHZhciBzbHBwID0gMC40NjMgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDM1Ny41ICsgMzU5OTkuMSAqIHQpKSBcclxuXHRcdCsgMC4xNTIgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDIzOC4yICsgODU0NTM1LjIgKiB0KSkgXHJcblx0XHQtIDAuMDcxICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgyNy44ICsgMTMxLjggKiB0KSkgXHJcblx0XHQtIDAuMDU1ICogTWF0aC5zaW4oREVHX1RPX1JBRCAqICgxMDMuMiArIDM3NzMzNi4zICogdCkpIFxyXG5cdFx0LSAwLjAyNiAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjMzLjIgKyA5MjY1MzMuMyAqIHQpKTtcclxuXHJcblx0dmFyIHNscHBwID0gMTQgKiBNYXRoLnNpbihERUdfVE9fUkFEICogKDM1Ny41ICsgMzU5OTkuMSAqIHQpKSBcclxuXHRcdCsgNSAqIE1hdGguc2luKERFR19UT19SQUQgKiAoMjM4LjIgKyA4NTQ1MzUuMiAqIHQpKTtcclxuXHJcblx0dmFyIGxhbWJkYSA9IDIxOC4zMTY2NSArIDQ4MTI2Ny44ODEzNCAqIHQgLSAxMy4yNjggKiB0MmU0IFxyXG5cdFx0KyAxLjg1NiAqIHQzZTYgLSAxLjUzNCAqIHQ0ZTggKyBzbCBcclxuXHRcdCsgMWUtMyAqIChzbHAgKyBzbHBwICogdCArIHNscHBwICogdDJlNCk7XHJcblxyXG5cdHZhciBjb21wdXRlZCA9IHtcclxuXHRcdGEgOiBzbWEgKiAxMDAwLFxyXG5cdFx0ZSA6IGVjYyxcclxuXHRcdGkgOiAyLjAgKiBNYXRoLmFzaW4oZ2FtbWEpICogUkFEX1RPX0RFRyxcclxuXHRcdHcgOiAoIChscCAtIHJhYW4pKSAlIDM2MCxcclxuXHRcdG8gOiAoIHJhYW4pICUgMzYwLFxyXG5cdFx0TSA6ICggKGxhbWJkYSAtIGxwKSkgJSAgMzYwXHJcblx0fTtcclxuXHRcclxuXHRyZXR1cm4gY29tcHV0ZWQ7XHJcblxyXG5cclxufTtcclxuIiwiLypcclxuXHRHbG9iYWwgdmFyc1xyXG4qL1xyXG5cclxuJ3VzZSBzdHJpY3QnO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuXHQvL2dyYXZpdGF0aW9uYWwgY29uc3RhbnQgdG8gbWVhc3VyZSB0aGUgZm9yY2Ugd2l0aCBtYXNzZXMgaW4ga2cgYW5kIHJhZGlpIGluIG1ldGVycyBOKG0va2cpXjJcclxuXHRHIDogNi42NzQyZS0xMSxcclxuXHQvL2FzdHJvbm9taWNhbCB1bml0IGluIGttXHJcblx0QVUgOiAxNDk1OTc4NzAsXHJcblx0Q0lSQ0xFIDogMiAqIE1hdGguUEksXHJcblx0S00gOiAxMDAwLFxyXG5cdERFR19UT19SQUQgOiBNYXRoLlBJLzE4MCxcclxuXHRSQURfVE9fREVHIDogMTgwL01hdGguUEksXHJcblx0Tk1fVE9fS00gOiAxLjg1MixcclxuXHRMQl9UT19LRyA6IDAuNDUzNTkyLFxyXG5cdExCRl9UT19ORVdUT04gOiA0LjQ0ODIyMTYyLFxyXG5cdEZUX1RPX00gOiAwLjMwNDgsXHJcblx0Ly9kdXJhdGlvbiBpbiBzZWNvbmRzXHJcblx0REFZIDogNjAgKiA2MCAqIDI0LFxyXG5cdC8vZHVyYXRpb24gaW4gZGF5c1xyXG5cdFlFQVIgOiAzNjUuMjUsXHJcblx0Ly9kdXJhdGlvbiBpbiBkYXlzXHJcblx0Q0VOVFVSWSA6IDEwMCAqIDM2NS4yNSxcclxuXHRTSURFUkFMX0RBWSA6IDM2MDAgKiAyMy45MzQ0Njk2LFxyXG5cdEoyMDAwIDogbmV3IERhdGUoJzIwMDAtMDEtMDFUMTI6MDA6MDAtMDA6MDAnKSxcclxuXHRnZXRFcG9jaFRpbWUgOiBmdW5jdGlvbih1c2VyRGF0ZSkge1xyXG5cdFx0dXNlckRhdGUgPSB1c2VyRGF0ZSB8fCBuZXcgRGF0ZSgpO1xyXG5cdFx0cmV0dXJuICgodXNlckRhdGUgLSB0aGlzLkoyMDAwKSAvIDEwMDApIDtcclxuXHR9XHJcbn07XHJcbiIsIlxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgbnMgPSByZXF1aXJlKCducycpO1xyXG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XHJcbnZhciBUSFJFRSA9IHJlcXVpcmUoJy4vVGhyZWUuc2hpbScpO1xyXG52YXIgQ01hdGggPSByZXF1aXJlKCcuL01hdGgnKTtcclxuXHJcbnZhciBtYXhJdGVyYXRpb25zRm9yRWNjZW50cmljQW5vbWFseSA9IDEwO1xyXG52YXIgbWF4REUgPSAxZS0xNTtcclxuXHJcbnZhciBzb2x2ZUVjY2VudHJpY0Fub21hbHkgPSBmdW5jdGlvbihmLCB4MCwgbWF4SXRlcikge1xyXG5cdFx0XHJcblx0dmFyIHggPSAwO1xyXG5cdHZhciB4MiA9IHgwO1xyXG5cdFxyXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgbWF4SXRlcjsgaSsrKSB7XHJcblx0XHR4ID0geDI7XHJcblx0XHR4MiA9IGYoeCk7XHJcblx0fVxyXG5cdFxyXG5cdHJldHVybiB4MjtcclxufVxyXG5cclxudmFyIHNvbHZlS2VwbGVyID0gZnVuY3Rpb24oZSwgTSkge1xyXG5cdHJldHVybiBmdW5jdGlvbih4KSB7XHJcblx0XHRyZXR1cm4geCArIChNICsgZSAqIE1hdGguc2luKHgpIC0geCkgLyAoMSAtIGUgKiBNYXRoLmNvcyh4KSk7XHJcblx0fTtcclxufTtcclxuXHJcbnZhciBzb2x2ZUtlcGxlckxhZ3VlcnJlQ29ud2F5ID0gZnVuY3Rpb24oZSwgTSkge1xyXG5cdHJldHVybiBmdW5jdGlvbih4KSB7XHJcblx0XHR2YXIgcyA9IGUgKiBNYXRoLnNpbih4KTtcclxuXHRcdHZhciBjID0gZSAqIE1hdGguY29zKHgpO1xyXG5cdFx0dmFyIGYgPSB4IC0gcyAtIE07XHJcblx0XHR2YXIgZjEgPSAxIC0gYztcclxuXHRcdHZhciBmMiA9IHM7XHJcblxyXG5cdFx0eCArPSAtNSAqIGYgLyAoZjEgKyBDTWF0aC5zaWduKGYxKSAqIE1hdGguc3FydChNYXRoLmFicygxNiAqIGYxICogZjEgLSAyMCAqIGYgKiBmMikpKTtcclxuXHRcdHJldHVybiB4O1xyXG5cdH07XHJcbn07XHJcblxyXG52YXIgc29sdmVLZXBsZXJMYWd1ZXJyZUNvbndheUh5cCA9IGZ1bmN0aW9uKGUsIE0pIHtcclxuXHRyZXR1cm4gZnVuY3Rpb24oeCkge1xyXG5cdFx0dmFyIHMgPSBlICogQ01hdGguc2luaCh4KTtcclxuXHRcdHZhciBjID0gZSAqIENNYXRoLmNvc2goeCk7XHJcblx0XHR2YXIgZiA9IHggLSBzIC0gTTtcclxuXHRcdHZhciBmMSA9IGMgLSAxO1xyXG5cdFx0dmFyIGYyID0gcztcclxuXHJcblx0XHR4ICs9IC01ICogZiAvIChmMSArIENNYXRoLnNpZ24oZjEpICogTWF0aC5zcXJ0KE1hdGguYWJzKDE2ICogZjEgKiBmMSAtIDIwICogZiAqIGYyKSkpO1xyXG5cdFx0cmV0dXJuIHg7XHJcblx0fTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdHNldERlZmF1bHRPcmJpdCA6IGZ1bmN0aW9uKG9yYml0YWxFbGVtZW50cywgY2FsY3VsYXRvcikge1xyXG5cdFx0dGhpcy5vcmJpdGFsRWxlbWVudHMgPSBvcmJpdGFsRWxlbWVudHM7XHJcblx0XHRpZihvcmJpdGFsRWxlbWVudHMgJiYgb3JiaXRhbEVsZW1lbnRzLmVwb2NoKSB7XHJcblx0XHRcdHRoaXMuZXBvY2hDb3JyZWN0aW9uID0gbnMuZ2V0RXBvY2hUaW1lKG9yYml0YWxFbGVtZW50cy5lcG9jaCk7XHJcblx0XHR9XHJcblx0XHR0aGlzLmNhbGN1bGF0b3IgPSBjYWxjdWxhdG9yO1xyXG5cdH0sXHJcblxyXG5cdHNldE5hbWUgOiBmdW5jdGlvbihuYW1lKXtcclxuXHRcdHRoaXMubmFtZSA9IG5hbWU7XHJcblx0fSxcclxuXHJcblx0Y2FsY3VsYXRlVmVsb2NpdHkgOiBmdW5jdGlvbih0aW1lRXBvY2gsIHJlbGF0aXZlVG8sIGlzRnJvbURlbHRhKSB7XHJcblx0XHRpZighdGhpcy5vcmJpdGFsRWxlbWVudHMpIHJldHVybiBuZXcgVEhSRUUuVmVjdG9yMygwLDAsMCk7XHJcblxyXG5cdFx0dmFyIGVjbGlwdGljVmVsb2NpdHk7XHJcblx0XHRcclxuXHRcdGlmICggaXNGcm9tRGVsdGEgKSB7XHJcblx0XHRcdHZhciBwb3MxID0gdGhpcy5jYWxjdWxhdGVQb3NpdGlvbih0aW1lRXBvY2gpO1xyXG5cdFx0XHR2YXIgcG9zMiA9IHRoaXMuY2FsY3VsYXRlUG9zaXRpb24odGltZUVwb2NoICsgNjApO1xyXG5cdFx0XHRlY2xpcHRpY1ZlbG9jaXR5ID0gcG9zMi5zdWIocG9zMSkubXVsdGlwbHlTY2FsYXIoMS82MCk7XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHQvL3ZpcyB2aXZhIHRvIGNhbGN1bGF0ZSBzcGVlZCAobm90IHZlbG9jaXR5LCBpLmUgbm90IGEgdmVjdG9yKVxyXG5cdFx0XHR2YXIgZWwgPSB0aGlzLmNhbGN1bGF0ZUVsZW1lbnRzKHRpbWVFcG9jaCk7XHJcblx0XHRcdHZhciBzcGVlZCA9IE1hdGguc3FydChucy5HICogcmVxdWlyZSgnLi9Tb2xhclN5c3RlbScpLmdldEJvZHkocmVsYXRpdmVUbykubWFzcyAqICgoMiAvIChlbC5yKSkgLSAoMSAvIChlbC5hKSkpKTtcclxuXHJcblx0XHRcdC8vbm93IGNhbGN1bGF0ZSB2ZWxvY2l0eSBvcmllbnRhdGlvbiwgdGhhdCBpcywgYSB2ZWN0b3IgdGFuZ2VudCB0byB0aGUgb3JiaXRhbCBlbGxpcHNlXHJcblx0XHRcdHZhciBrID0gZWwuciAvIGVsLmE7XHJcblx0XHRcdHZhciBvID0gKCgyIC0gKDIgKiBlbC5lICogZWwuZSkpIC8gKGsgKiAoMi1rKSkpLTE7XHJcblx0XHRcdC8vZmxvYXRpbmcgcG9pbnQgaW1wcmVjaXNpb25cclxuXHRcdFx0byA9IG8gPiAxID8gMSA6IG87XHJcblx0XHRcdHZhciBhbHBoYSA9IE1hdGguUEkgLSBNYXRoLmFjb3Mobyk7XHJcblx0XHRcdGFscGhhID0gZWwudiA8IDAgPyAoMiAqIE1hdGguUEkpIC0gYWxwaGEgIDogYWxwaGE7XHJcblx0XHRcdHZhciB2ZWxvY2l0eUFuZ2xlID0gZWwudiArIChhbHBoYSAvIDIpO1xyXG5cdFx0XHQvL3ZlbG9jaXR5IHZlY3RvciBpbiB0aGUgcGxhbmUgb2YgdGhlIG9yYml0XHJcblx0XHRcdHZhciBvcmJpdGFsVmVsb2NpdHkgPSBuZXcgVEhSRUUuVmVjdG9yMyhNYXRoLmNvcyh2ZWxvY2l0eUFuZ2xlKSwgTWF0aC5zaW4odmVsb2NpdHlBbmdsZSkpLnNldExlbmd0aChzcGVlZCk7XHJcblx0XHRcdHZhciB2ZWxvY2l0eUVscyA9IFV0aWxzLmV4dGVuZCh7fSwgZWwsIHtwb3M6b3JiaXRhbFZlbG9jaXR5LCB2Om51bGwsIHI6bnVsbH0pO1xyXG5cdFx0XHRlY2xpcHRpY1ZlbG9jaXR5ID0gdGhpcy5nZXRQb3NpdGlvbkZyb21FbGVtZW50cyh2ZWxvY2l0eUVscyk7XHJcblx0XHR9XHJcblxyXG5cdFx0Ly92YXIgZGlmZiA9IGVjbGlwdGljVmVsb2NpdHlGcm9tRGVsdGEuc3ViKGVjbGlwdGljVmVsb2NpdHkpO2NvbnNvbGUubG9nKGRpZmYubGVuZ3RoKCkpO1xyXG5cdFx0cmV0dXJuIGVjbGlwdGljVmVsb2NpdHk7XHJcblx0XHRcclxuXHR9LFxyXG5cclxuXHRjYWxjdWxhdGVQb3NpdGlvbiA6IGZ1bmN0aW9uKHRpbWVFcG9jaCkge1xyXG5cdFx0aWYoIXRoaXMub3JiaXRhbEVsZW1lbnRzKSByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoMCwwLDApO1xyXG5cdFx0dmFyIGNvbXB1dGVkID0gdGhpcy5jYWxjdWxhdGVFbGVtZW50cyh0aW1lRXBvY2gpO1xyXG5cdFx0dmFyIHBvcyA9ICB0aGlzLmdldFBvc2l0aW9uRnJvbUVsZW1lbnRzKGNvbXB1dGVkKTtcclxuXHRcdHJldHVybiBwb3M7XHJcblx0fSxcclxuXHJcblx0c29sdmVFY2NlbnRyaWNBbm9tYWx5IDogZnVuY3Rpb24oZSwgTSl7XHJcblx0XHRpZiAoZSA9PSAwLjApIHtcclxuXHRcdFx0cmV0dXJuIE07XHJcblx0XHR9ICBlbHNlIGlmIChlIDwgMC45KSB7XHJcblx0XHRcdHZhciBzb2wgPSBzb2x2ZUVjY2VudHJpY0Fub21hbHkoc29sdmVLZXBsZXIoZSwgTSksIE0sIDYpO1xyXG5cdFx0XHRyZXR1cm4gc29sO1xyXG5cdFx0fSBlbHNlIGlmIChlIDwgMS4wKSB7XHJcblx0XHRcdHZhciBFID0gTSArIDAuODUgKiBlICogKChNYXRoLnNpbihNKSA+PSAwLjApID8gMSA6IC0xKTtcclxuXHRcdFx0dmFyIHNvbCA9IHNvbHZlRWNjZW50cmljQW5vbWFseShzb2x2ZUtlcGxlckxhZ3VlcnJlQ29ud2F5KGUsIE0pLCBFLCA4KTtcclxuXHRcdFx0cmV0dXJuIHNvbDtcclxuXHRcdH0gZWxzZSBpZiAoZSA9PSAxLjApIHtcclxuXHRcdFx0cmV0dXJuIE07XHJcblx0XHR9IGVsc2Uge1xyXG5cdFx0XHR2YXIgRSA9IE1hdGgubG9nKDIgKiBNIC8gZSArIDEuODUpO1xyXG5cdFx0XHR2YXIgc29sID0gc29sdmVFY2NlbnRyaWNBbm9tYWx5KHNvbHZlS2VwbGVyTGFndWVycmVDb253YXlIeXAoZSwgTSksIEUsIDMwKTtcclxuXHRcdFx0cmV0dXJuIHNvbDtcclxuXHRcdH1cclxuXHR9LFxyXG5cclxuXHRjYWxjdWxhdGVFbGVtZW50cyA6IGZ1bmN0aW9uKHRpbWVFcG9jaCwgZm9yY2VkT3JiaXRhbEVsZW1lbnRzKSB7XHJcblx0XHRpZighZm9yY2VkT3JiaXRhbEVsZW1lbnRzICYmICF0aGlzLm9yYml0YWxFbGVtZW50cykgcmV0dXJuIG51bGw7XHJcblxyXG5cdFx0dmFyIG9yYml0YWxFbGVtZW50cyA9IGZvcmNlZE9yYml0YWxFbGVtZW50cyB8fCB0aGlzLm9yYml0YWxFbGVtZW50cztcclxuXHJcblx0XHQvKlxyXG5cclxuXHRcdEVwb2NoIDogSjIwMDBcclxuXHJcblx0XHRhIFx0U2VtaS1tYWpvciBheGlzXHJcblx0ICAgIGUgXHRFY2NlbnRyaWNpdHlcclxuXHQgICAgaSBcdEluY2xpbmF0aW9uXHJcblx0ICAgIG8gXHRMb25naXR1ZGUgb2YgQXNjZW5kaW5nIE5vZGUgKM6pKVxyXG5cdCAgICB3IFx0QXJndW1lbnQgb2YgcGVyaWFwc2lzICjPiSlcclxuXHRcdEUgXHRFY2NlbnRyaWMgQW5vbWFseVxyXG5cdCAgICBUIFx0VGltZSBhdCBwZXJpaGVsaW9uXHJcblx0ICAgIE1cdE1lYW4gYW5vbWFseVxyXG5cdCAgICBsIFx0TWVhbiBMb25naXR1ZGVcclxuXHQgICAgbHBcdGxvbmdpdHVkZSBvZiBwZXJpYXBzaXNcclxuXHQgICAgclx0ZGlzdGFuY2UgZHUgY2VudHJlXHJcblx0ICAgIHZcdHRydWUgYW5vbWFseVxyXG5cclxuXHQgICAgUFx0U2lkZXJlYWwgcGVyaW9kIChtZWFuIHZhbHVlKVxyXG5cdFx0UHdcdEFyZ3VtZW50IG9mIHBlcmlhcHNpcyBwcmVjZXNzaW9uIHBlcmlvZCAobWVhbiB2YWx1ZSlcclxuXHRcdFBuXHRMb25naXR1ZGUgb2YgdGhlIGFzY2VuZGluZyBub2RlIHByZWNlc3Npb24gcGVyaW9kIChtZWFuIHZhbHVlKVxyXG5cclxuXHQgICAgKi9cclxuXHQgICAgaWYgKHRoaXMuZXBvY2hDb3JyZWN0aW9uKSB7XHJcblx0ICAgIFx0dGltZUVwb2NoIC09IHRoaXMuZXBvY2hDb3JyZWN0aW9uO1xyXG5cdCAgICB9XHJcblx0XHR2YXIgdERheXMgPSB0aW1lRXBvY2ggLyBucy5EQVk7XHJcblx0XHR2YXIgVCA9IHREYXlzIC8gbnMuQ0VOVFVSWSA7XHJcblx0XHQvL2NvbnNvbGUubG9nKFQpO1xyXG5cdFx0dmFyIGNvbXB1dGVkID0ge1xyXG5cdFx0XHR0IDogdGltZUVwb2NoXHJcblx0XHR9O1xyXG5cclxuXHRcdGlmKHRoaXMuY2FsY3VsYXRvciAmJiAhZm9yY2VkT3JiaXRhbEVsZW1lbnRzKSB7XHJcblx0XHRcdHZhciByZWFsb3JiaXQgPSB0aGlzLmNhbGN1bGF0b3IoVCk7XHJcblx0XHRcdFV0aWxzLmV4dGVuZChjb21wdXRlZCwgcmVhbG9yYml0KTtcclxuXHRcdH0gZWxzZSB7XHJcblxyXG5cdFx0XHRpZiAob3JiaXRhbEVsZW1lbnRzLmJhc2UpIHtcclxuXHRcdFx0XHR2YXIgdmFyaWF0aW9uO1xyXG5cdFx0XHRcdGZvcih2YXIgZWwgaW4gb3JiaXRhbEVsZW1lbnRzLmJhc2UpIHtcclxuXHRcdFx0XHRcdC8vY3kgOiB2YXJpYXRpb24gYnkgY2VudHVyeS5cclxuXHRcdFx0XHRcdC8vZGF5IDogdmFyaWF0aW9uIGJ5IGRheS5cclxuXHRcdFx0XHRcdHZhcmlhdGlvbiA9IG9yYml0YWxFbGVtZW50cy5jeSA/IG9yYml0YWxFbGVtZW50cy5jeVtlbF0gOiAob3JiaXRhbEVsZW1lbnRzLmRheVtlbF0gKiBucy5DRU5UVVJZKTtcclxuXHRcdFx0XHRcdHZhcmlhdGlvbiA9IHZhcmlhdGlvbiB8fCAwO1xyXG5cdFx0XHRcdFx0Y29tcHV0ZWRbZWxdID0gb3JiaXRhbEVsZW1lbnRzLmJhc2VbZWxdICsgKHZhcmlhdGlvbiAqIFQpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRjb21wdXRlZCA9IFV0aWxzLmV4dGVuZCh7fSwgb3JiaXRhbEVsZW1lbnRzKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0aWYgKHVuZGVmaW5lZCA9PT0gY29tcHV0ZWQudykge1xyXG5cdFx0XHRcdGNvbXB1dGVkLncgPSBjb21wdXRlZC5scCAtIGNvbXB1dGVkLm87XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGlmICh1bmRlZmluZWQgPT09IGNvbXB1dGVkLk0pIHtcclxuXHRcdFx0XHRjb21wdXRlZC5NID0gY29tcHV0ZWQubCAtIGNvbXB1dGVkLmxwO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRjb21wdXRlZC5hID0gY29tcHV0ZWQuYSAqIG5zLktNOy8vd2FzIGluIGttLCBzZXQgaXQgaW4gbVxyXG5cdFx0fVxyXG5cclxuXHJcblx0XHRjb21wdXRlZC5pID0gbnMuREVHX1RPX1JBRCAqIGNvbXB1dGVkLmk7XHJcblx0XHRjb21wdXRlZC5vID0gbnMuREVHX1RPX1JBRCAqIGNvbXB1dGVkLm87XHJcblx0XHRjb21wdXRlZC53ID0gbnMuREVHX1RPX1JBRCAqIGNvbXB1dGVkLnc7XHJcblx0XHRjb21wdXRlZC5NID0gbnMuREVHX1RPX1JBRCAqIGNvbXB1dGVkLk07XHJcblxyXG5cdFx0Y29tcHV0ZWQuRSA9IHRoaXMuc29sdmVFY2NlbnRyaWNBbm9tYWx5KGNvbXB1dGVkLmUsIGNvbXB1dGVkLk0pO1xyXG5cclxuXHRcdGNvbXB1dGVkLkUgPSBjb21wdXRlZC5FICUgbnMuQ0lSQ0xFO1xyXG5cdFx0Y29tcHV0ZWQuaSA9IGNvbXB1dGVkLmkgJSBucy5DSVJDTEU7XHJcblx0XHRjb21wdXRlZC5vID0gY29tcHV0ZWQubyAlIG5zLkNJUkNMRTtcclxuXHRcdGNvbXB1dGVkLncgPSBjb21wdXRlZC53ICUgbnMuQ0lSQ0xFO1xyXG5cdFx0Y29tcHV0ZWQuTSA9IGNvbXB1dGVkLk0gJSBucy5DSVJDTEU7XHJcblxyXG5cdFx0Ly9pbiB0aGUgcGxhbmUgb2YgdGhlIG9yYml0XHJcblx0XHRjb21wdXRlZC5wb3MgPSBuZXcgVEhSRUUuVmVjdG9yMyhjb21wdXRlZC5hICogKE1hdGguY29zKGNvbXB1dGVkLkUpIC0gY29tcHV0ZWQuZSksIGNvbXB1dGVkLmEgKiAoTWF0aC5zcXJ0KDEgLSAoY29tcHV0ZWQuZSpjb21wdXRlZC5lKSkpICogTWF0aC5zaW4oY29tcHV0ZWQuRSkpO1xyXG5cclxuXHRcdGNvbXB1dGVkLnIgPSBjb21wdXRlZC5wb3MubGVuZ3RoKCk7XHJcblx0XHRjb21wdXRlZC52ID0gTWF0aC5hdGFuMihjb21wdXRlZC5wb3MueSwgY29tcHV0ZWQucG9zLngpO1xyXG5cdFx0aWYob3JiaXRhbEVsZW1lbnRzLnJlbGF0aXZlVG8pIHtcclxuXHRcdFx0dmFyIHJlbGF0aXZlVG8gPSByZXF1aXJlKCcuL1NvbGFyU3lzdGVtJykuZ2V0Qm9keShvcmJpdGFsRWxlbWVudHMucmVsYXRpdmVUbyk7XHJcblx0XHRcdGlmKHJlbGF0aXZlVG8udGlsdCkge1xyXG5cdFx0XHRcdGNvbXB1dGVkLnRpbHQgPSAtcmVsYXRpdmVUby50aWx0ICogbnMuREVHX1RPX1JBRDtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHRcdHJldHVybiBjb21wdXRlZDtcclxuXHR9LFxyXG5cclxuXHRnZXRQb3NpdGlvbkZyb21FbGVtZW50cyA6IGZ1bmN0aW9uKGNvbXB1dGVkKSB7XHJcblxyXG5cdFx0aWYoIWNvbXB1dGVkKSByZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoMCwwLDApO1xyXG5cclxuXHRcdHZhciBhMSA9IG5ldyBUSFJFRS5FdWxlcihjb21wdXRlZC50aWx0IHx8IDAsIDAsIGNvbXB1dGVkLm8sICdYWVonKTtcclxuXHRcdHZhciBxMSA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCkuc2V0RnJvbUV1bGVyKGExKTtcclxuXHRcdHZhciBhMiA9IG5ldyBUSFJFRS5FdWxlcihjb21wdXRlZC5pLCAwLCBjb21wdXRlZC53LCAnWFlaJyk7XHJcblx0XHR2YXIgcTIgPSBuZXcgVEhSRUUuUXVhdGVybmlvbigpLnNldEZyb21FdWxlcihhMik7XHJcblxyXG5cdFx0dmFyIHBsYW5lUXVhdCA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCkubXVsdGlwbHlRdWF0ZXJuaW9ucyhxMSwgcTIpO1xyXG5cdFx0Y29tcHV0ZWQucG9zLmFwcGx5UXVhdGVybmlvbihwbGFuZVF1YXQpO1xyXG5cdFx0cmV0dXJuIGNvbXB1dGVkLnBvcztcclxuXHR9LFxyXG5cclxuXHRjYWxjdWxhdGVQZXJpb2QgOiBmdW5jdGlvbihlbGVtZW50cywgcmVsYXRpdmVUbykge1xyXG5cdFx0dmFyIHBlcmlvZDtcclxuXHRcdGlmKHRoaXMub3JiaXRhbEVsZW1lbnRzICYmIHRoaXMub3JiaXRhbEVsZW1lbnRzLmRheSAmJiB0aGlzLm9yYml0YWxFbGVtZW50cy5kYXkuTSkge1xyXG5cdFx0XHRwZXJpb2QgPSAzNjAgLyB0aGlzLm9yYml0YWxFbGVtZW50cy5kYXkuTSA7XHJcblx0XHR9ZWxzZSBpZihyZXF1aXJlKCcuL1NvbGFyU3lzdGVtJykuZ2V0Qm9keShyZWxhdGl2ZVRvKSAmJiByZXF1aXJlKCcuL1NvbGFyU3lzdGVtJykuZ2V0Qm9keShyZWxhdGl2ZVRvKS5rICYmIGVsZW1lbnRzKSB7XHJcblx0XHRcdHBlcmlvZCA9IDIgKiBNYXRoLlBJICogTWF0aC5zcXJ0KE1hdGgucG93KGVsZW1lbnRzLmEvKG5zLkFVKjEwMDApLCAzKSkgLyByZXF1aXJlKCcuL1NvbGFyU3lzdGVtJykuZ2V0Qm9keShyZWxhdGl2ZVRvKS5rO1xyXG5cdFx0fVxyXG5cdFx0cGVyaW9kICo9IG5zLkRBWTsvL2luIHNlY29uZHNcclxuXHRcdHJldHVybiBwZXJpb2Q7XHJcblx0fVxyXG59O1xyXG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBucyA9IHJlcXVpcmUoJ25zJyk7XG52YXIgVXRpbHMgPSByZXF1aXJlKCcuL1V0aWxzJyk7XG52YXIgZGVmaW5pdGlvbnMgPSByZXF1aXJlKCcuL0RlZmluaXRpb25zJyk7XG52YXIgQ2VsZXN0aWFsQm9keSA9IHJlcXVpcmUoJy4vQ2VsZXN0aWFsQm9keScpO1xuXG5cbnZhciBib2RpZXMgPSBkZWZpbml0aW9ucy5tYXAoZnVuY3Rpb24oZGVmKXtcblx0dmFyIGJvZHkgPSBPYmplY3QuY3JlYXRlKENlbGVzdGlhbEJvZHkpO1xuXHRVdGlscy5leHRlbmQoYm9keSwgZGVmKTtcblx0Ym9keS5pbml0KCk7XG5cdHJldHVybiBib2R5O1xufSk7XG5cbnZhciBuYW1lcyA9IGJvZGllcy5yZWR1Y2UoZnVuY3Rpb24oY2FycnksIGJvZHkpe1xuXHRjYXJyeVtib2R5Lm5hbWVdID0gYm9keTtcblx0cmV0dXJuIGNhcnJ5O1xufSwge30pO1xuXG52YXIgY2VudHJhbCA9IGJvZGllcy5yZWR1Y2UoZnVuY3Rpb24oY2FycnksIGJvZHkpe1xuXHRjYXJyeSA9IGNhcnJ5ICYmIGNhcnJ5Lm1hc3MgPiBib2R5Lm1hc3MgPyBjYXJyeSA6IGJvZHk7XG5cdHJldHVybiBjYXJyeTtcbn0sIG51bGwpO1xuXG5cbmNvbnNvbGUubG9nKGJvZGllcyk7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRnZXRCb2R5OiBmdW5jdGlvbihuYW1lKXtcblx0XHRyZXR1cm4gbmFtZXNbbmFtZV0gfHwgY2VudHJhbDtcblx0fSxcblx0Z2V0UG9zaXRpb25zOiBmdW5jdGlvbih1c2VyRGF0ZSwgY2FsY3VsYXRlVmVsb2NpdHkpe1xuXHRcdHZhciBlcG9jaFRpbWUgPSBucy5nZXRFcG9jaFRpbWUodXNlckRhdGUpO1xuXHRcdHJldHVybiBib2RpZXMubWFwKGZ1bmN0aW9uKGJvZHkpe1xuXHRcdFx0Ym9keS5zZXRQb3NpdGlvbkZyb21EYXRlKGVwb2NoVGltZSwgY2FsY3VsYXRlVmVsb2NpdHkpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0bmFtZTogYm9keS5uYW1lLFxuXHRcdFx0XHRwb3NpdGlvbjogYm9keS5nZXRQb3NpdGlvbigpLFxuXHRcdFx0XHR2ZWxvY2l0eTogYm9keS5nZXRWZWxvY2l0eSgpXG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9XG59OyIsIlxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgVEhSRUUgPSBnbG9iYWwuVEhSRUUgPSB7fTtcblxucmVxdWlyZSgnLi4vdmVuZG9yL3RocmVlL21hdGgvVmVjdG9yMycpO1xucmVxdWlyZSgnLi4vdmVuZG9yL3RocmVlL21hdGgvUXVhdGVybmlvbicpO1xucmVxdWlyZSgnLi4vdmVuZG9yL3RocmVlL21hdGgvRXVsZXInKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUSFJFRTsiLCIvKlxyXG5cdEdsb2JhbCB2YXJzXHJcbiovXHJcblxyXG4ndXNlIHN0cmljdCc7XHJcblxyXG52YXIgZXh0ZW5kID0gZnVuY3Rpb24oKXtcclxuXHRpZihhcmd1bWVudHMubGVuZ3RoID09PSAxKSByZXR1cm4gYXJndW1lbnRzWzBdO1xyXG5cdHZhciBzb3VyY2UgPSBBcnJheS5wcm90b3R5cGUuc3BsaWNlLmNhbGwoYXJndW1lbnRzLCAxLCAxKVswXTtcclxuXHRhcmd1bWVudHNbMF0gPSBPYmplY3Qua2V5cyhzb3VyY2UpLnJlZHVjZShmdW5jdGlvbihjYXJyeSwga2V5KXtcclxuXHRcdGNhcnJ5W2tleV0gPSBzb3VyY2Vba2V5XTtcclxuXHRcdHJldHVybiBjYXJyeTtcclxuXHR9LCBhcmd1bWVudHNbMF0pO1xyXG5cdHJldHVybiBleHRlbmQuYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGV4dGVuZDogZXh0ZW5kXHJcbn07XHJcbiIsIi8qKlxuICogQGF1dGhvciBtcmRvb2IgLyBodHRwOi8vbXJkb29iLmNvbS9cbiAqIEBhdXRob3IgV2VzdExhbmdsZXkgLyBodHRwOi8vZ2l0aHViLmNvbS9XZXN0TGFuZ2xleVxuICogQGF1dGhvciBiaG91c3RvbiAvIGh0dHA6Ly9leG9jb3J0ZXguY29tXG4gKi9cblxuVEhSRUUuRXVsZXIgPSBmdW5jdGlvbiAoIHgsIHksIHosIG9yZGVyICkge1xuXG5cdHRoaXMuX3ggPSB4IHx8IDA7XG5cdHRoaXMuX3kgPSB5IHx8IDA7XG5cdHRoaXMuX3ogPSB6IHx8IDA7XG5cdHRoaXMuX29yZGVyID0gb3JkZXIgfHwgVEhSRUUuRXVsZXIuRGVmYXVsdE9yZGVyO1xuXG59O1xuXG5USFJFRS5FdWxlci5Sb3RhdGlvbk9yZGVycyA9IFsgJ1hZWicsICdZWlgnLCAnWlhZJywgJ1haWScsICdZWFonLCAnWllYJyBdO1xuXG5USFJFRS5FdWxlci5EZWZhdWx0T3JkZXIgPSAnWFlaJztcblxuVEhSRUUuRXVsZXIucHJvdG90eXBlID0ge1xuXG5cdGNvbnN0cnVjdG9yOiBUSFJFRS5FdWxlcixcblxuXHRfeDogMCwgX3k6IDAsIF96OiAwLCBfb3JkZXI6IFRIUkVFLkV1bGVyLkRlZmF1bHRPcmRlcixcblxuXHRnZXQgeCAoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5feDtcblxuXHR9LFxuXG5cdHNldCB4ICggdmFsdWUgKSB7XG5cblx0XHR0aGlzLl94ID0gdmFsdWU7XG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fSxcblxuXHRnZXQgeSAoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5feTtcblxuXHR9LFxuXG5cdHNldCB5ICggdmFsdWUgKSB7XG5cblx0XHR0aGlzLl95ID0gdmFsdWU7XG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fSxcblxuXHRnZXQgeiAoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5fejtcblxuXHR9LFxuXG5cdHNldCB6ICggdmFsdWUgKSB7XG5cblx0XHR0aGlzLl96ID0gdmFsdWU7XG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fSxcblxuXHRnZXQgb3JkZXIgKCkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX29yZGVyO1xuXG5cdH0sXG5cblx0c2V0IG9yZGVyICggdmFsdWUgKSB7XG5cblx0XHR0aGlzLl9vcmRlciA9IHZhbHVlO1xuXHRcdHRoaXMub25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdH0sXG5cblx0c2V0OiBmdW5jdGlvbiAoIHgsIHksIHosIG9yZGVyICkge1xuXG5cdFx0dGhpcy5feCA9IHg7XG5cdFx0dGhpcy5feSA9IHk7XG5cdFx0dGhpcy5feiA9IHo7XG5cdFx0dGhpcy5fb3JkZXIgPSBvcmRlciB8fCB0aGlzLl9vcmRlcjtcblxuXHRcdHRoaXMub25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRjb3B5OiBmdW5jdGlvbiAoIGV1bGVyICkge1xuXG5cdFx0dGhpcy5feCA9IGV1bGVyLl94O1xuXHRcdHRoaXMuX3kgPSBldWxlci5feTtcblx0XHR0aGlzLl96ID0gZXVsZXIuX3o7XG5cdFx0dGhpcy5fb3JkZXIgPSBldWxlci5fb3JkZXI7XG5cblx0XHR0aGlzLm9uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0RnJvbVJvdGF0aW9uTWF0cml4OiBmdW5jdGlvbiAoIG0sIG9yZGVyLCB1cGRhdGUgKSB7XG5cblx0XHR2YXIgY2xhbXAgPSBUSFJFRS5NYXRoLmNsYW1wO1xuXG5cdFx0Ly8gYXNzdW1lcyB0aGUgdXBwZXIgM3gzIG9mIG0gaXMgYSBwdXJlIHJvdGF0aW9uIG1hdHJpeCAoaS5lLCB1bnNjYWxlZClcblxuXHRcdHZhciB0ZSA9IG0uZWxlbWVudHM7XG5cdFx0dmFyIG0xMSA9IHRlWyAwIF0sIG0xMiA9IHRlWyA0IF0sIG0xMyA9IHRlWyA4IF07XG5cdFx0dmFyIG0yMSA9IHRlWyAxIF0sIG0yMiA9IHRlWyA1IF0sIG0yMyA9IHRlWyA5IF07XG5cdFx0dmFyIG0zMSA9IHRlWyAyIF0sIG0zMiA9IHRlWyA2IF0sIG0zMyA9IHRlWyAxMCBdO1xuXG5cdFx0b3JkZXIgPSBvcmRlciB8fCB0aGlzLl9vcmRlcjtcblxuXHRcdGlmICggb3JkZXIgPT09ICdYWVonICkge1xuXG5cdFx0XHR0aGlzLl95ID0gTWF0aC5hc2luKCBjbGFtcCggbTEzLCAtIDEsIDEgKSApO1xuXG5cdFx0XHRpZiAoIE1hdGguYWJzKCBtMTMgKSA8IDAuOTk5OTkgKSB7XG5cblx0XHRcdFx0dGhpcy5feCA9IE1hdGguYXRhbjIoIC0gbTIzLCBtMzMgKTtcblx0XHRcdFx0dGhpcy5feiA9IE1hdGguYXRhbjIoIC0gbTEyLCBtMTEgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR0aGlzLl94ID0gTWF0aC5hdGFuMiggbTMyLCBtMjIgKTtcblx0XHRcdFx0dGhpcy5feiA9IDA7XG5cblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZiAoIG9yZGVyID09PSAnWVhaJyApIHtcblxuXHRcdFx0dGhpcy5feCA9IE1hdGguYXNpbiggLSBjbGFtcCggbTIzLCAtIDEsIDEgKSApO1xuXG5cdFx0XHRpZiAoIE1hdGguYWJzKCBtMjMgKSA8IDAuOTk5OTkgKSB7XG5cblx0XHRcdFx0dGhpcy5feSA9IE1hdGguYXRhbjIoIG0xMywgbTMzICk7XG5cdFx0XHRcdHRoaXMuX3ogPSBNYXRoLmF0YW4yKCBtMjEsIG0yMiApO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHRoaXMuX3kgPSBNYXRoLmF0YW4yKCAtIG0zMSwgbTExICk7XG5cdFx0XHRcdHRoaXMuX3ogPSAwO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYgKCBvcmRlciA9PT0gJ1pYWScgKSB7XG5cblx0XHRcdHRoaXMuX3ggPSBNYXRoLmFzaW4oIGNsYW1wKCBtMzIsIC0gMSwgMSApICk7XG5cblx0XHRcdGlmICggTWF0aC5hYnMoIG0zMiApIDwgMC45OTk5OSApIHtcblxuXHRcdFx0XHR0aGlzLl95ID0gTWF0aC5hdGFuMiggLSBtMzEsIG0zMyApO1xuXHRcdFx0XHR0aGlzLl96ID0gTWF0aC5hdGFuMiggLSBtMTIsIG0yMiApO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdHRoaXMuX3kgPSAwO1xuXHRcdFx0XHR0aGlzLl96ID0gTWF0aC5hdGFuMiggbTIxLCBtMTEgKTtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIGlmICggb3JkZXIgPT09ICdaWVgnICkge1xuXG5cdFx0XHR0aGlzLl95ID0gTWF0aC5hc2luKCAtIGNsYW1wKCBtMzEsIC0gMSwgMSApICk7XG5cblx0XHRcdGlmICggTWF0aC5hYnMoIG0zMSApIDwgMC45OTk5OSApIHtcblxuXHRcdFx0XHR0aGlzLl94ID0gTWF0aC5hdGFuMiggbTMyLCBtMzMgKTtcblx0XHRcdFx0dGhpcy5feiA9IE1hdGguYXRhbjIoIG0yMSwgbTExICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0dGhpcy5feCA9IDA7XG5cdFx0XHRcdHRoaXMuX3ogPSBNYXRoLmF0YW4yKCAtIG0xMiwgbTIyICk7XG5cblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZiAoIG9yZGVyID09PSAnWVpYJyApIHtcblxuXHRcdFx0dGhpcy5feiA9IE1hdGguYXNpbiggY2xhbXAoIG0yMSwgLSAxLCAxICkgKTtcblxuXHRcdFx0aWYgKCBNYXRoLmFicyggbTIxICkgPCAwLjk5OTk5ICkge1xuXG5cdFx0XHRcdHRoaXMuX3ggPSBNYXRoLmF0YW4yKCAtIG0yMywgbTIyICk7XG5cdFx0XHRcdHRoaXMuX3kgPSBNYXRoLmF0YW4yKCAtIG0zMSwgbTExICk7XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0dGhpcy5feCA9IDA7XG5cdFx0XHRcdHRoaXMuX3kgPSBNYXRoLmF0YW4yKCBtMTMsIG0zMyApO1xuXG5cdFx0XHR9XG5cblx0XHR9IGVsc2UgaWYgKCBvcmRlciA9PT0gJ1haWScgKSB7XG5cblx0XHRcdHRoaXMuX3ogPSBNYXRoLmFzaW4oIC0gY2xhbXAoIG0xMiwgLSAxLCAxICkgKTtcblxuXHRcdFx0aWYgKCBNYXRoLmFicyggbTEyICkgPCAwLjk5OTk5ICkge1xuXG5cdFx0XHRcdHRoaXMuX3ggPSBNYXRoLmF0YW4yKCBtMzIsIG0yMiApO1xuXHRcdFx0XHR0aGlzLl95ID0gTWF0aC5hdGFuMiggbTEzLCBtMTEgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHR0aGlzLl94ID0gTWF0aC5hdGFuMiggLSBtMjMsIG0zMyApO1xuXHRcdFx0XHR0aGlzLl95ID0gMDtcblxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0VEhSRUUud2FybiggJ1RIUkVFLkV1bGVyOiAuc2V0RnJvbVJvdGF0aW9uTWF0cml4KCkgZ2l2ZW4gdW5zdXBwb3J0ZWQgb3JkZXI6ICcgKyBvcmRlciApXG5cblx0XHR9XG5cblx0XHR0aGlzLl9vcmRlciA9IG9yZGVyO1xuXG5cdFx0aWYgKCB1cGRhdGUgIT09IGZhbHNlICkgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHNldEZyb21RdWF0ZXJuaW9uOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgbWF0cml4O1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggcSwgb3JkZXIsIHVwZGF0ZSApIHtcblxuXHRcdFx0aWYgKCBtYXRyaXggPT09IHVuZGVmaW5lZCApIG1hdHJpeCA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cdFx0XHRtYXRyaXgubWFrZVJvdGF0aW9uRnJvbVF1YXRlcm5pb24oIHEgKTtcblx0XHRcdHRoaXMuc2V0RnJvbVJvdGF0aW9uTWF0cml4KCBtYXRyaXgsIG9yZGVyLCB1cGRhdGUgKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9O1xuXG5cdH0oKSxcblxuXHRzZXRGcm9tVmVjdG9yMzogZnVuY3Rpb24gKCB2LCBvcmRlciApIHtcblxuXHRcdHJldHVybiB0aGlzLnNldCggdi54LCB2LnksIHYueiwgb3JkZXIgfHwgdGhpcy5fb3JkZXIgKTtcblxuXHR9LFxuXG5cdHJlb3JkZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdC8vIFdBUk5JTkc6IHRoaXMgZGlzY2FyZHMgcmV2b2x1dGlvbiBpbmZvcm1hdGlvbiAtYmhvdXN0b25cblxuXHRcdHZhciBxID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIG5ld09yZGVyICkge1xuXG5cdFx0XHRxLnNldEZyb21FdWxlciggdGhpcyApO1xuXHRcdFx0dGhpcy5zZXRGcm9tUXVhdGVybmlvbiggcSwgbmV3T3JkZXIgKTtcblxuXHRcdH07XG5cblx0fSgpLFxuXG5cdGVxdWFsczogZnVuY3Rpb24gKCBldWxlciApIHtcblxuXHRcdHJldHVybiAoIGV1bGVyLl94ID09PSB0aGlzLl94ICkgJiYgKCBldWxlci5feSA9PT0gdGhpcy5feSApICYmICggZXVsZXIuX3ogPT09IHRoaXMuX3ogKSAmJiAoIGV1bGVyLl9vcmRlciA9PT0gdGhpcy5fb3JkZXIgKTtcblxuXHR9LFxuXG5cdGZyb21BcnJheTogZnVuY3Rpb24gKCBhcnJheSApIHtcblxuXHRcdHRoaXMuX3ggPSBhcnJheVsgMCBdO1xuXHRcdHRoaXMuX3kgPSBhcnJheVsgMSBdO1xuXHRcdHRoaXMuX3ogPSBhcnJheVsgMiBdO1xuXHRcdGlmICggYXJyYXlbIDMgXSAhPT0gdW5kZWZpbmVkICkgdGhpcy5fb3JkZXIgPSBhcnJheVsgMyBdO1xuXG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHRvQXJyYXk6IGZ1bmN0aW9uICggYXJyYXksIG9mZnNldCApIHtcblxuXHRcdGlmICggYXJyYXkgPT09IHVuZGVmaW5lZCApIGFycmF5ID0gW107XG5cdFx0aWYgKCBvZmZzZXQgPT09IHVuZGVmaW5lZCApIG9mZnNldCA9IDA7XG5cblx0XHRhcnJheVsgb2Zmc2V0IF0gPSB0aGlzLl94O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAxIF0gPSB0aGlzLl95O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAyIF0gPSB0aGlzLl96O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAzIF0gPSB0aGlzLl9vcmRlcjtcblxuXHRcdHJldHVybiBhcnJheTtcblx0fSxcblxuXHR0b1ZlY3RvcjM6IGZ1bmN0aW9uICggb3B0aW9uYWxSZXN1bHQgKSB7XG5cblx0XHRpZiAoIG9wdGlvbmFsUmVzdWx0ICkge1xuXG5cdFx0XHRyZXR1cm4gb3B0aW9uYWxSZXN1bHQuc2V0KCB0aGlzLl94LCB0aGlzLl95LCB0aGlzLl96ICk7XG5cblx0XHR9IGVsc2Uge1xuXG5cdFx0XHRyZXR1cm4gbmV3IFRIUkVFLlZlY3RvcjMoIHRoaXMuX3gsIHRoaXMuX3ksIHRoaXMuX3ogKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdG9uQ2hhbmdlOiBmdW5jdGlvbiAoIGNhbGxiYWNrICkge1xuXG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdG9uQ2hhbmdlQ2FsbGJhY2s6IGZ1bmN0aW9uICgpIHt9LFxuXG5cdGNsb25lOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRyZXR1cm4gbmV3IFRIUkVFLkV1bGVyKCB0aGlzLl94LCB0aGlzLl95LCB0aGlzLl96LCB0aGlzLl9vcmRlciApO1xuXG5cdH1cblxufTtcbiIsIi8qKlxuICogQGF1dGhvciBtaWthZWwgZW10aW5nZXIgLyBodHRwOi8vZ29tby5zZS9cbiAqIEBhdXRob3IgYWx0ZXJlZHEgLyBodHRwOi8vYWx0ZXJlZHF1YWxpYS5jb20vXG4gKiBAYXV0aG9yIFdlc3RMYW5nbGV5IC8gaHR0cDovL2dpdGh1Yi5jb20vV2VzdExhbmdsZXlcbiAqIEBhdXRob3IgYmhvdXN0b24gLyBodHRwOi8vZXhvY29ydGV4LmNvbVxuICovXG5cblRIUkVFLlF1YXRlcm5pb24gPSBmdW5jdGlvbiAoIHgsIHksIHosIHcgKSB7XG5cblx0dGhpcy5feCA9IHggfHwgMDtcblx0dGhpcy5feSA9IHkgfHwgMDtcblx0dGhpcy5feiA9IHogfHwgMDtcblx0dGhpcy5fdyA9ICggdyAhPT0gdW5kZWZpbmVkICkgPyB3IDogMTtcblxufTtcblxuVEhSRUUuUXVhdGVybmlvbi5wcm90b3R5cGUgPSB7XG5cblx0Y29uc3RydWN0b3I6IFRIUkVFLlF1YXRlcm5pb24sXG5cblx0X3g6IDAsX3k6IDAsIF96OiAwLCBfdzogMCxcblxuXHRnZXQgeCAoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5feDtcblxuXHR9LFxuXG5cdHNldCB4ICggdmFsdWUgKSB7XG5cblx0XHR0aGlzLl94ID0gdmFsdWU7XG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fSxcblxuXHRnZXQgeSAoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5feTtcblxuXHR9LFxuXG5cdHNldCB5ICggdmFsdWUgKSB7XG5cblx0XHR0aGlzLl95ID0gdmFsdWU7XG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fSxcblxuXHRnZXQgeiAoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5fejtcblxuXHR9LFxuXG5cdHNldCB6ICggdmFsdWUgKSB7XG5cblx0XHR0aGlzLl96ID0gdmFsdWU7XG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fSxcblxuXHRnZXQgdyAoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5fdztcblxuXHR9LFxuXG5cdHNldCB3ICggdmFsdWUgKSB7XG5cblx0XHR0aGlzLl93ID0gdmFsdWU7XG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0fSxcblxuXHRzZXQ6IGZ1bmN0aW9uICggeCwgeSwgeiwgdyApIHtcblxuXHRcdHRoaXMuX3ggPSB4O1xuXHRcdHRoaXMuX3kgPSB5O1xuXHRcdHRoaXMuX3ogPSB6O1xuXHRcdHRoaXMuX3cgPSB3O1xuXG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGNvcHk6IGZ1bmN0aW9uICggcXVhdGVybmlvbiApIHtcblxuXHRcdHRoaXMuX3ggPSBxdWF0ZXJuaW9uLng7XG5cdFx0dGhpcy5feSA9IHF1YXRlcm5pb24ueTtcblx0XHR0aGlzLl96ID0gcXVhdGVybmlvbi56O1xuXHRcdHRoaXMuX3cgPSBxdWF0ZXJuaW9uLnc7XG5cblx0XHR0aGlzLm9uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0RnJvbUV1bGVyOiBmdW5jdGlvbiAoIGV1bGVyLCB1cGRhdGUgKSB7XG5cblx0XHRpZiAoIGV1bGVyIGluc3RhbmNlb2YgVEhSRUUuRXVsZXIgPT09IGZhbHNlICkge1xuXG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoICdUSFJFRS5RdWF0ZXJuaW9uOiAuc2V0RnJvbUV1bGVyKCkgbm93IGV4cGVjdHMgYSBFdWxlciByb3RhdGlvbiByYXRoZXIgdGhhbiBhIFZlY3RvcjMgYW5kIG9yZGVyLicgKTtcblx0XHR9XG5cblx0XHQvLyBodHRwOi8vd3d3Lm1hdGh3b3Jrcy5jb20vbWF0bGFiY2VudHJhbC9maWxlZXhjaGFuZ2UvXG5cdFx0Ly8gXHQyMDY5Ni1mdW5jdGlvbi10by1jb252ZXJ0LWJldHdlZW4tZGNtLWV1bGVyLWFuZ2xlcy1xdWF0ZXJuaW9ucy1hbmQtZXVsZXItdmVjdG9ycy9cblx0XHQvL1x0Y29udGVudC9TcGluQ2FsYy5tXG5cblx0XHR2YXIgYzEgPSBNYXRoLmNvcyggZXVsZXIuX3ggLyAyICk7XG5cdFx0dmFyIGMyID0gTWF0aC5jb3MoIGV1bGVyLl95IC8gMiApO1xuXHRcdHZhciBjMyA9IE1hdGguY29zKCBldWxlci5feiAvIDIgKTtcblx0XHR2YXIgczEgPSBNYXRoLnNpbiggZXVsZXIuX3ggLyAyICk7XG5cdFx0dmFyIHMyID0gTWF0aC5zaW4oIGV1bGVyLl95IC8gMiApO1xuXHRcdHZhciBzMyA9IE1hdGguc2luKCBldWxlci5feiAvIDIgKTtcblxuXHRcdGlmICggZXVsZXIub3JkZXIgPT09ICdYWVonICkge1xuXG5cdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzICsgYzEgKiBzMiAqIHMzO1xuXHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcblx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgKyBzMSAqIHMyICogYzM7XG5cdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzIC0gczEgKiBzMiAqIHMzO1xuXG5cdFx0fSBlbHNlIGlmICggZXVsZXIub3JkZXIgPT09ICdZWFonICkge1xuXG5cdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzICsgYzEgKiBzMiAqIHMzO1xuXHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcblx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgLSBzMSAqIHMyICogYzM7XG5cdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzICsgczEgKiBzMiAqIHMzO1xuXG5cdFx0fSBlbHNlIGlmICggZXVsZXIub3JkZXIgPT09ICdaWFknICkge1xuXG5cdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzIC0gYzEgKiBzMiAqIHMzO1xuXHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcblx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgKyBzMSAqIHMyICogYzM7XG5cdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzIC0gczEgKiBzMiAqIHMzO1xuXG5cdFx0fSBlbHNlIGlmICggZXVsZXIub3JkZXIgPT09ICdaWVgnICkge1xuXG5cdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzIC0gYzEgKiBzMiAqIHMzO1xuXHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcblx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgLSBzMSAqIHMyICogYzM7XG5cdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzICsgczEgKiBzMiAqIHMzO1xuXG5cdFx0fSBlbHNlIGlmICggZXVsZXIub3JkZXIgPT09ICdZWlgnICkge1xuXG5cdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzICsgYzEgKiBzMiAqIHMzO1xuXHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyArIHMxICogYzIgKiBzMztcblx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgLSBzMSAqIHMyICogYzM7XG5cdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzIC0gczEgKiBzMiAqIHMzO1xuXG5cdFx0fSBlbHNlIGlmICggZXVsZXIub3JkZXIgPT09ICdYWlknICkge1xuXG5cdFx0XHR0aGlzLl94ID0gczEgKiBjMiAqIGMzIC0gYzEgKiBzMiAqIHMzO1xuXHRcdFx0dGhpcy5feSA9IGMxICogczIgKiBjMyAtIHMxICogYzIgKiBzMztcblx0XHRcdHRoaXMuX3ogPSBjMSAqIGMyICogczMgKyBzMSAqIHMyICogYzM7XG5cdFx0XHR0aGlzLl93ID0gYzEgKiBjMiAqIGMzICsgczEgKiBzMiAqIHMzO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB1cGRhdGUgIT09IGZhbHNlICkgdGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHNldEZyb21BeGlzQW5nbGU6IGZ1bmN0aW9uICggYXhpcywgYW5nbGUgKSB7XG5cblx0XHQvLyBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9nZW9tZXRyeS9yb3RhdGlvbnMvY29udmVyc2lvbnMvYW5nbGVUb1F1YXRlcm5pb24vaW5kZXguaHRtXG5cblx0XHQvLyBhc3N1bWVzIGF4aXMgaXMgbm9ybWFsaXplZFxuXG5cdFx0dmFyIGhhbGZBbmdsZSA9IGFuZ2xlIC8gMiwgcyA9IE1hdGguc2luKCBoYWxmQW5nbGUgKTtcblxuXHRcdHRoaXMuX3ggPSBheGlzLnggKiBzO1xuXHRcdHRoaXMuX3kgPSBheGlzLnkgKiBzO1xuXHRcdHRoaXMuX3ogPSBheGlzLnogKiBzO1xuXHRcdHRoaXMuX3cgPSBNYXRoLmNvcyggaGFsZkFuZ2xlICk7XG5cblx0XHR0aGlzLm9uQ2hhbmdlQ2FsbGJhY2soKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0RnJvbVJvdGF0aW9uTWF0cml4OiBmdW5jdGlvbiAoIG0gKSB7XG5cblx0XHQvLyBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9nZW9tZXRyeS9yb3RhdGlvbnMvY29udmVyc2lvbnMvbWF0cml4VG9RdWF0ZXJuaW9uL2luZGV4Lmh0bVxuXG5cdFx0Ly8gYXNzdW1lcyB0aGUgdXBwZXIgM3gzIG9mIG0gaXMgYSBwdXJlIHJvdGF0aW9uIG1hdHJpeCAoaS5lLCB1bnNjYWxlZClcblxuXHRcdHZhciB0ZSA9IG0uZWxlbWVudHMsXG5cblx0XHRcdG0xMSA9IHRlWyAwIF0sIG0xMiA9IHRlWyA0IF0sIG0xMyA9IHRlWyA4IF0sXG5cdFx0XHRtMjEgPSB0ZVsgMSBdLCBtMjIgPSB0ZVsgNSBdLCBtMjMgPSB0ZVsgOSBdLFxuXHRcdFx0bTMxID0gdGVbIDIgXSwgbTMyID0gdGVbIDYgXSwgbTMzID0gdGVbIDEwIF0sXG5cblx0XHRcdHRyYWNlID0gbTExICsgbTIyICsgbTMzLFxuXHRcdFx0cztcblxuXHRcdGlmICggdHJhY2UgPiAwICkge1xuXG5cdFx0XHRzID0gMC41IC8gTWF0aC5zcXJ0KCB0cmFjZSArIDEuMCApO1xuXG5cdFx0XHR0aGlzLl93ID0gMC4yNSAvIHM7XG5cdFx0XHR0aGlzLl94ID0gKCBtMzIgLSBtMjMgKSAqIHM7XG5cdFx0XHR0aGlzLl95ID0gKCBtMTMgLSBtMzEgKSAqIHM7XG5cdFx0XHR0aGlzLl96ID0gKCBtMjEgLSBtMTIgKSAqIHM7XG5cblx0XHR9IGVsc2UgaWYgKCBtMTEgPiBtMjIgJiYgbTExID4gbTMzICkge1xuXG5cdFx0XHRzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMTEgLSBtMjIgLSBtMzMgKTtcblxuXHRcdFx0dGhpcy5fdyA9ICggbTMyIC0gbTIzICkgLyBzO1xuXHRcdFx0dGhpcy5feCA9IDAuMjUgKiBzO1xuXHRcdFx0dGhpcy5feSA9ICggbTEyICsgbTIxICkgLyBzO1xuXHRcdFx0dGhpcy5feiA9ICggbTEzICsgbTMxICkgLyBzO1xuXG5cdFx0fSBlbHNlIGlmICggbTIyID4gbTMzICkge1xuXG5cdFx0XHRzID0gMi4wICogTWF0aC5zcXJ0KCAxLjAgKyBtMjIgLSBtMTEgLSBtMzMgKTtcblxuXHRcdFx0dGhpcy5fdyA9ICggbTEzIC0gbTMxICkgLyBzO1xuXHRcdFx0dGhpcy5feCA9ICggbTEyICsgbTIxICkgLyBzO1xuXHRcdFx0dGhpcy5feSA9IDAuMjUgKiBzO1xuXHRcdFx0dGhpcy5feiA9ICggbTIzICsgbTMyICkgLyBzO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0cyA9IDIuMCAqIE1hdGguc3FydCggMS4wICsgbTMzIC0gbTExIC0gbTIyICk7XG5cblx0XHRcdHRoaXMuX3cgPSAoIG0yMSAtIG0xMiApIC8gcztcblx0XHRcdHRoaXMuX3ggPSAoIG0xMyArIG0zMSApIC8gcztcblx0XHRcdHRoaXMuX3kgPSAoIG0yMyArIG0zMiApIC8gcztcblx0XHRcdHRoaXMuX3ogPSAwLjI1ICogcztcblxuXHRcdH1cblxuXHRcdHRoaXMub25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRzZXRGcm9tVW5pdFZlY3RvcnM6IGZ1bmN0aW9uICgpIHtcblxuXHRcdC8vIGh0dHA6Ly9sb2xlbmdpbmUubmV0L2Jsb2cvMjAxNC8wMi8yNC9xdWF0ZXJuaW9uLWZyb20tdHdvLXZlY3RvcnMtZmluYWxcblxuXHRcdC8vIGFzc3VtZXMgZGlyZWN0aW9uIHZlY3RvcnMgdkZyb20gYW5kIHZUbyBhcmUgbm9ybWFsaXplZFxuXG5cdFx0dmFyIHYxLCByO1xuXG5cdFx0dmFyIEVQUyA9IDAuMDAwMDAxO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggdkZyb20sIHZUbyApIHtcblxuXHRcdFx0aWYgKCB2MSA9PT0gdW5kZWZpbmVkICkgdjEgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdFx0XHRyID0gdkZyb20uZG90KCB2VG8gKSArIDE7XG5cblx0XHRcdGlmICggciA8IEVQUyApIHtcblxuXHRcdFx0XHRyID0gMDtcblxuXHRcdFx0XHRpZiAoIE1hdGguYWJzKCB2RnJvbS54ICkgPiBNYXRoLmFicyggdkZyb20ueiApICkge1xuXG5cdFx0XHRcdFx0djEuc2V0KCAtIHZGcm9tLnksIHZGcm9tLngsIDAgKTtcblxuXHRcdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdFx0djEuc2V0KCAwLCAtIHZGcm9tLnosIHZGcm9tLnkgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0djEuY3Jvc3NWZWN0b3JzKCB2RnJvbSwgdlRvICk7XG5cblx0XHRcdH1cblxuXHRcdFx0dGhpcy5feCA9IHYxLng7XG5cdFx0XHR0aGlzLl95ID0gdjEueTtcblx0XHRcdHRoaXMuX3ogPSB2MS56O1xuXHRcdFx0dGhpcy5fdyA9IHI7XG5cblx0XHRcdHRoaXMubm9ybWFsaXplKCk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fVxuXG5cdH0oKSxcblxuXHRpbnZlcnNlOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR0aGlzLmNvbmp1Z2F0ZSgpLm5vcm1hbGl6ZSgpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRjb25qdWdhdGU6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHRoaXMuX3ggKj0gLSAxO1xuXHRcdHRoaXMuX3kgKj0gLSAxO1xuXHRcdHRoaXMuX3ogKj0gLSAxO1xuXG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGRvdDogZnVuY3Rpb24gKCB2ICkge1xuXG5cdFx0cmV0dXJuIHRoaXMuX3ggKiB2Ll94ICsgdGhpcy5feSAqIHYuX3kgKyB0aGlzLl96ICogdi5feiArIHRoaXMuX3cgKiB2Ll93O1xuXG5cdH0sXG5cblx0bGVuZ3RoU3E6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiB0aGlzLl94ICogdGhpcy5feCArIHRoaXMuX3kgKiB0aGlzLl95ICsgdGhpcy5feiAqIHRoaXMuX3ogKyB0aGlzLl93ICogdGhpcy5fdztcblxuXHR9LFxuXG5cdGxlbmd0aDogZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy5feCAqIHRoaXMuX3ggKyB0aGlzLl95ICogdGhpcy5feSArIHRoaXMuX3ogKiB0aGlzLl96ICsgdGhpcy5fdyAqIHRoaXMuX3cgKTtcblxuXHR9LFxuXG5cdG5vcm1hbGl6ZTogZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIGwgPSB0aGlzLmxlbmd0aCgpO1xuXG5cdFx0aWYgKCBsID09PSAwICkge1xuXG5cdFx0XHR0aGlzLl94ID0gMDtcblx0XHRcdHRoaXMuX3kgPSAwO1xuXHRcdFx0dGhpcy5feiA9IDA7XG5cdFx0XHR0aGlzLl93ID0gMTtcblxuXHRcdH0gZWxzZSB7XG5cblx0XHRcdGwgPSAxIC8gbDtcblxuXHRcdFx0dGhpcy5feCA9IHRoaXMuX3ggKiBsO1xuXHRcdFx0dGhpcy5feSA9IHRoaXMuX3kgKiBsO1xuXHRcdFx0dGhpcy5feiA9IHRoaXMuX3ogKiBsO1xuXHRcdFx0dGhpcy5fdyA9IHRoaXMuX3cgKiBsO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdG11bHRpcGx5OiBmdW5jdGlvbiAoIHEsIHAgKSB7XG5cblx0XHRpZiAoIHAgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0VEhSRUUud2FybiggJ1RIUkVFLlF1YXRlcm5pb246IC5tdWx0aXBseSgpIG5vdyBvbmx5IGFjY2VwdHMgb25lIGFyZ3VtZW50LiBVc2UgLm11bHRpcGx5UXVhdGVybmlvbnMoIGEsIGIgKSBpbnN0ZWFkLicgKTtcblx0XHRcdHJldHVybiB0aGlzLm11bHRpcGx5UXVhdGVybmlvbnMoIHEsIHAgKTtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLm11bHRpcGx5UXVhdGVybmlvbnMoIHRoaXMsIHEgKTtcblxuXHR9LFxuXG5cdG11bHRpcGx5UXVhdGVybmlvbnM6IGZ1bmN0aW9uICggYSwgYiApIHtcblxuXHRcdC8vIGZyb20gaHR0cDovL3d3dy5ldWNsaWRlYW5zcGFjZS5jb20vbWF0aHMvYWxnZWJyYS9yZWFsTm9ybWVkQWxnZWJyYS9xdWF0ZXJuaW9ucy9jb2RlL2luZGV4Lmh0bVxuXG5cdFx0dmFyIHFheCA9IGEuX3gsIHFheSA9IGEuX3ksIHFheiA9IGEuX3osIHFhdyA9IGEuX3c7XG5cdFx0dmFyIHFieCA9IGIuX3gsIHFieSA9IGIuX3ksIHFieiA9IGIuX3osIHFidyA9IGIuX3c7XG5cblx0XHR0aGlzLl94ID0gcWF4ICogcWJ3ICsgcWF3ICogcWJ4ICsgcWF5ICogcWJ6IC0gcWF6ICogcWJ5O1xuXHRcdHRoaXMuX3kgPSBxYXkgKiBxYncgKyBxYXcgKiBxYnkgKyBxYXogKiBxYnggLSBxYXggKiBxYno7XG5cdFx0dGhpcy5feiA9IHFheiAqIHFidyArIHFhdyAqIHFieiArIHFheCAqIHFieSAtIHFheSAqIHFieDtcblx0XHR0aGlzLl93ID0gcWF3ICogcWJ3IC0gcWF4ICogcWJ4IC0gcWF5ICogcWJ5IC0gcWF6ICogcWJ6O1xuXG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdG11bHRpcGx5VmVjdG9yMzogZnVuY3Rpb24gKCB2ZWN0b3IgKSB7XG5cblx0XHRUSFJFRS53YXJuKCAnVEhSRUUuUXVhdGVybmlvbjogLm11bHRpcGx5VmVjdG9yMygpIGhhcyBiZWVuIHJlbW92ZWQuIFVzZSBpcyBub3cgdmVjdG9yLmFwcGx5UXVhdGVybmlvbiggcXVhdGVybmlvbiApIGluc3RlYWQuJyApO1xuXHRcdHJldHVybiB2ZWN0b3IuYXBwbHlRdWF0ZXJuaW9uKCB0aGlzICk7XG5cblx0fSxcblxuXHRzbGVycDogZnVuY3Rpb24gKCBxYiwgdCApIHtcblxuXHRcdGlmICggdCA9PT0gMCApIHJldHVybiB0aGlzO1xuXHRcdGlmICggdCA9PT0gMSApIHJldHVybiB0aGlzLmNvcHkoIHFiICk7XG5cblx0XHR2YXIgeCA9IHRoaXMuX3gsIHkgPSB0aGlzLl95LCB6ID0gdGhpcy5feiwgdyA9IHRoaXMuX3c7XG5cblx0XHQvLyBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9hbGdlYnJhL3JlYWxOb3JtZWRBbGdlYnJhL3F1YXRlcm5pb25zL3NsZXJwL1xuXG5cdFx0dmFyIGNvc0hhbGZUaGV0YSA9IHcgKiBxYi5fdyArIHggKiBxYi5feCArIHkgKiBxYi5feSArIHogKiBxYi5fejtcblxuXHRcdGlmICggY29zSGFsZlRoZXRhIDwgMCApIHtcblxuXHRcdFx0dGhpcy5fdyA9IC0gcWIuX3c7XG5cdFx0XHR0aGlzLl94ID0gLSBxYi5feDtcblx0XHRcdHRoaXMuX3kgPSAtIHFiLl95O1xuXHRcdFx0dGhpcy5feiA9IC0gcWIuX3o7XG5cblx0XHRcdGNvc0hhbGZUaGV0YSA9IC0gY29zSGFsZlRoZXRhO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy5jb3B5KCBxYiApO1xuXG5cdFx0fVxuXG5cdFx0aWYgKCBjb3NIYWxmVGhldGEgPj0gMS4wICkge1xuXG5cdFx0XHR0aGlzLl93ID0gdztcblx0XHRcdHRoaXMuX3ggPSB4O1xuXHRcdFx0dGhpcy5feSA9IHk7XG5cdFx0XHR0aGlzLl96ID0gejtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9XG5cblx0XHR2YXIgaGFsZlRoZXRhID0gTWF0aC5hY29zKCBjb3NIYWxmVGhldGEgKTtcblx0XHR2YXIgc2luSGFsZlRoZXRhID0gTWF0aC5zcXJ0KCAxLjAgLSBjb3NIYWxmVGhldGEgKiBjb3NIYWxmVGhldGEgKTtcblxuXHRcdGlmICggTWF0aC5hYnMoIHNpbkhhbGZUaGV0YSApIDwgMC4wMDEgKSB7XG5cblx0XHRcdHRoaXMuX3cgPSAwLjUgKiAoIHcgKyB0aGlzLl93ICk7XG5cdFx0XHR0aGlzLl94ID0gMC41ICogKCB4ICsgdGhpcy5feCApO1xuXHRcdFx0dGhpcy5feSA9IDAuNSAqICggeSArIHRoaXMuX3kgKTtcblx0XHRcdHRoaXMuX3ogPSAwLjUgKiAoIHogKyB0aGlzLl96ICk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fVxuXG5cdFx0dmFyIHJhdGlvQSA9IE1hdGguc2luKCAoIDEgLSB0ICkgKiBoYWxmVGhldGEgKSAvIHNpbkhhbGZUaGV0YSxcblx0XHRyYXRpb0IgPSBNYXRoLnNpbiggdCAqIGhhbGZUaGV0YSApIC8gc2luSGFsZlRoZXRhO1xuXG5cdFx0dGhpcy5fdyA9ICggdyAqIHJhdGlvQSArIHRoaXMuX3cgKiByYXRpb0IgKTtcblx0XHR0aGlzLl94ID0gKCB4ICogcmF0aW9BICsgdGhpcy5feCAqIHJhdGlvQiApO1xuXHRcdHRoaXMuX3kgPSAoIHkgKiByYXRpb0EgKyB0aGlzLl95ICogcmF0aW9CICk7XG5cdFx0dGhpcy5feiA9ICggeiAqIHJhdGlvQSArIHRoaXMuX3ogKiByYXRpb0IgKTtcblxuXHRcdHRoaXMub25DaGFuZ2VDYWxsYmFjaygpO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRlcXVhbHM6IGZ1bmN0aW9uICggcXVhdGVybmlvbiApIHtcblxuXHRcdHJldHVybiAoIHF1YXRlcm5pb24uX3ggPT09IHRoaXMuX3ggKSAmJiAoIHF1YXRlcm5pb24uX3kgPT09IHRoaXMuX3kgKSAmJiAoIHF1YXRlcm5pb24uX3ogPT09IHRoaXMuX3ogKSAmJiAoIHF1YXRlcm5pb24uX3cgPT09IHRoaXMuX3cgKTtcblxuXHR9LFxuXG5cdGZyb21BcnJheTogZnVuY3Rpb24gKCBhcnJheSwgb2Zmc2V0ICkge1xuXG5cdFx0aWYgKCBvZmZzZXQgPT09IHVuZGVmaW5lZCApIG9mZnNldCA9IDA7XG5cblx0XHR0aGlzLl94ID0gYXJyYXlbIG9mZnNldCBdO1xuXHRcdHRoaXMuX3kgPSBhcnJheVsgb2Zmc2V0ICsgMSBdO1xuXHRcdHRoaXMuX3ogPSBhcnJheVsgb2Zmc2V0ICsgMiBdO1xuXHRcdHRoaXMuX3cgPSBhcnJheVsgb2Zmc2V0ICsgMyBdO1xuXG5cdFx0dGhpcy5vbkNoYW5nZUNhbGxiYWNrKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHRvQXJyYXk6IGZ1bmN0aW9uICggYXJyYXksIG9mZnNldCApIHtcblxuXHRcdGlmICggYXJyYXkgPT09IHVuZGVmaW5lZCApIGFycmF5ID0gW107XG5cdFx0aWYgKCBvZmZzZXQgPT09IHVuZGVmaW5lZCApIG9mZnNldCA9IDA7XG5cblx0XHRhcnJheVsgb2Zmc2V0IF0gPSB0aGlzLl94O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAxIF0gPSB0aGlzLl95O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAyIF0gPSB0aGlzLl96O1xuXHRcdGFycmF5WyBvZmZzZXQgKyAzIF0gPSB0aGlzLl93O1xuXG5cdFx0cmV0dXJuIGFycmF5O1xuXG5cdH0sXG5cblx0b25DaGFuZ2U6IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cblx0XHR0aGlzLm9uQ2hhbmdlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0b25DaGFuZ2VDYWxsYmFjazogZnVuY3Rpb24gKCkge30sXG5cblx0Y2xvbmU6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiBuZXcgVEhSRUUuUXVhdGVybmlvbiggdGhpcy5feCwgdGhpcy5feSwgdGhpcy5feiwgdGhpcy5fdyApO1xuXG5cdH1cblxufTtcblxuVEhSRUUuUXVhdGVybmlvbi5zbGVycCA9IGZ1bmN0aW9uICggcWEsIHFiLCBxbSwgdCApIHtcblxuXHRyZXR1cm4gcW0uY29weSggcWEgKS5zbGVycCggcWIsIHQgKTtcblxufVxuIiwiLyoqXG4gKiBAYXV0aG9yIG1yZG9vYiAvIGh0dHA6Ly9tcmRvb2IuY29tL1xuICogQGF1dGhvciAqa2lsZSAvIGh0dHA6Ly9raWxlLnN0cmF2YWdhbnphLm9yZy9cbiAqIEBhdXRob3IgcGhpbG9nYiAvIGh0dHA6Ly9ibG9nLnRoZWppdC5vcmcvXG4gKiBAYXV0aG9yIG1pa2FlbCBlbXRpbmdlciAvIGh0dHA6Ly9nb21vLnNlL1xuICogQGF1dGhvciBlZ3JhZXRoZXIgLyBodHRwOi8vZWdyYWV0aGVyLmNvbS9cbiAqIEBhdXRob3IgV2VzdExhbmdsZXkgLyBodHRwOi8vZ2l0aHViLmNvbS9XZXN0TGFuZ2xleVxuICovXG5cblRIUkVFLlZlY3RvcjMgPSBmdW5jdGlvbiAoIHgsIHksIHogKSB7XG5cblx0dGhpcy54ID0geCB8fCAwO1xuXHR0aGlzLnkgPSB5IHx8IDA7XG5cdHRoaXMueiA9IHogfHwgMDtcblxufTtcblxuVEhSRUUuVmVjdG9yMy5wcm90b3R5cGUgPSB7XG5cblx0Y29uc3RydWN0b3I6IFRIUkVFLlZlY3RvcjMsXG5cblx0c2V0OiBmdW5jdGlvbiAoIHgsIHksIHogKSB7XG5cblx0XHR0aGlzLnggPSB4O1xuXHRcdHRoaXMueSA9IHk7XG5cdFx0dGhpcy56ID0gejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0WDogZnVuY3Rpb24gKCB4ICkge1xuXG5cdFx0dGhpcy54ID0geDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0WTogZnVuY3Rpb24gKCB5ICkge1xuXG5cdFx0dGhpcy55ID0geTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0WjogZnVuY3Rpb24gKCB6ICkge1xuXG5cdFx0dGhpcy56ID0gejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c2V0Q29tcG9uZW50OiBmdW5jdGlvbiAoIGluZGV4LCB2YWx1ZSApIHtcblxuXHRcdHN3aXRjaCAoIGluZGV4ICkge1xuXG5cdFx0XHRjYXNlIDA6IHRoaXMueCA9IHZhbHVlOyBicmVhaztcblx0XHRcdGNhc2UgMTogdGhpcy55ID0gdmFsdWU7IGJyZWFrO1xuXHRcdFx0Y2FzZSAyOiB0aGlzLnogPSB2YWx1ZTsgYnJlYWs7XG5cdFx0XHRkZWZhdWx0OiB0aHJvdyBuZXcgRXJyb3IoICdpbmRleCBpcyBvdXQgb2YgcmFuZ2U6ICcgKyBpbmRleCApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0Z2V0Q29tcG9uZW50OiBmdW5jdGlvbiAoIGluZGV4ICkge1xuXG5cdFx0c3dpdGNoICggaW5kZXggKSB7XG5cblx0XHRcdGNhc2UgMDogcmV0dXJuIHRoaXMueDtcblx0XHRcdGNhc2UgMTogcmV0dXJuIHRoaXMueTtcblx0XHRcdGNhc2UgMjogcmV0dXJuIHRoaXMuejtcblx0XHRcdGRlZmF1bHQ6IHRocm93IG5ldyBFcnJvciggJ2luZGV4IGlzIG91dCBvZiByYW5nZTogJyArIGluZGV4ICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRjb3B5OiBmdW5jdGlvbiAoIHYgKSB7XG5cblx0XHR0aGlzLnggPSB2Lng7XG5cdFx0dGhpcy55ID0gdi55O1xuXHRcdHRoaXMueiA9IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0YWRkOiBmdW5jdGlvbiAoIHYsIHcgKSB7XG5cblx0XHRpZiAoIHcgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0VEhSRUUud2FybiggJ1RIUkVFLlZlY3RvcjM6IC5hZGQoKSBub3cgb25seSBhY2NlcHRzIG9uZSBhcmd1bWVudC4gVXNlIC5hZGRWZWN0b3JzKCBhLCBiICkgaW5zdGVhZC4nICk7XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGRWZWN0b3JzKCB2LCB3ICk7XG5cblx0XHR9XG5cblx0XHR0aGlzLnggKz0gdi54O1xuXHRcdHRoaXMueSArPSB2Lnk7XG5cdFx0dGhpcy56ICs9IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0YWRkU2NhbGFyOiBmdW5jdGlvbiAoIHMgKSB7XG5cblx0XHR0aGlzLnggKz0gcztcblx0XHR0aGlzLnkgKz0gcztcblx0XHR0aGlzLnogKz0gcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0YWRkVmVjdG9yczogZnVuY3Rpb24gKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54ICsgYi54O1xuXHRcdHRoaXMueSA9IGEueSArIGIueTtcblx0XHR0aGlzLnogPSBhLnogKyBiLno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHN1YjogZnVuY3Rpb24gKCB2LCB3ICkge1xuXG5cdFx0aWYgKCB3ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFRIUkVFLndhcm4oICdUSFJFRS5WZWN0b3IzOiAuc3ViKCkgbm93IG9ubHkgYWNjZXB0cyBvbmUgYXJndW1lbnQuIFVzZSAuc3ViVmVjdG9ycyggYSwgYiApIGluc3RlYWQuJyApO1xuXHRcdFx0cmV0dXJuIHRoaXMuc3ViVmVjdG9ycyggdiwgdyApO1xuXG5cdFx0fVxuXG5cdFx0dGhpcy54IC09IHYueDtcblx0XHR0aGlzLnkgLT0gdi55O1xuXHRcdHRoaXMueiAtPSB2Lno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXHRcblx0c3ViU2NhbGFyOiBmdW5jdGlvbiAoIHMgKSB7XG5cblx0XHR0aGlzLnggLT0gcztcblx0XHR0aGlzLnkgLT0gcztcblx0XHR0aGlzLnogLT0gcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0c3ViVmVjdG9yczogZnVuY3Rpb24gKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54IC0gYi54O1xuXHRcdHRoaXMueSA9IGEueSAtIGIueTtcblx0XHR0aGlzLnogPSBhLnogLSBiLno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdG11bHRpcGx5OiBmdW5jdGlvbiAoIHYsIHcgKSB7XG5cblx0XHRpZiAoIHcgIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0VEhSRUUud2FybiggJ1RIUkVFLlZlY3RvcjM6IC5tdWx0aXBseSgpIG5vdyBvbmx5IGFjY2VwdHMgb25lIGFyZ3VtZW50LiBVc2UgLm11bHRpcGx5VmVjdG9ycyggYSwgYiApIGluc3RlYWQuJyApO1xuXHRcdFx0cmV0dXJuIHRoaXMubXVsdGlwbHlWZWN0b3JzKCB2LCB3ICk7XG5cblx0XHR9XG5cblx0XHR0aGlzLnggKj0gdi54O1xuXHRcdHRoaXMueSAqPSB2Lnk7XG5cdFx0dGhpcy56ICo9IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0bXVsdGlwbHlTY2FsYXI6IGZ1bmN0aW9uICggc2NhbGFyICkge1xuXG5cdFx0dGhpcy54ICo9IHNjYWxhcjtcblx0XHR0aGlzLnkgKj0gc2NhbGFyO1xuXHRcdHRoaXMueiAqPSBzY2FsYXI7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdG11bHRpcGx5VmVjdG9yczogZnVuY3Rpb24gKCBhLCBiICkge1xuXG5cdFx0dGhpcy54ID0gYS54ICogYi54O1xuXHRcdHRoaXMueSA9IGEueSAqIGIueTtcblx0XHR0aGlzLnogPSBhLnogKiBiLno7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGFwcGx5RXVsZXI6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBxdWF0ZXJuaW9uO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggZXVsZXIgKSB7XG5cblx0XHRcdGlmICggZXVsZXIgaW5zdGFuY2VvZiBUSFJFRS5FdWxlciA9PT0gZmFsc2UgKSB7XG5cblx0XHRcdFx0VEhSRUUuZXJyb3IoICdUSFJFRS5WZWN0b3IzOiAuYXBwbHlFdWxlcigpIG5vdyBleHBlY3RzIGEgRXVsZXIgcm90YXRpb24gcmF0aGVyIHRoYW4gYSBWZWN0b3IzIGFuZCBvcmRlci4nICk7XG5cblx0XHRcdH1cblxuXHRcdFx0aWYgKCBxdWF0ZXJuaW9uID09PSB1bmRlZmluZWQgKSBxdWF0ZXJuaW9uID0gbmV3IFRIUkVFLlF1YXRlcm5pb24oKTtcblxuXHRcdFx0dGhpcy5hcHBseVF1YXRlcm5pb24oIHF1YXRlcm5pb24uc2V0RnJvbUV1bGVyKCBldWxlciApICk7XG5cblx0XHRcdHJldHVybiB0aGlzO1xuXG5cdFx0fTtcblxuXHR9KCksXG5cblx0YXBwbHlBeGlzQW5nbGU6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBxdWF0ZXJuaW9uO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggYXhpcywgYW5nbGUgKSB7XG5cblx0XHRcdGlmICggcXVhdGVybmlvbiA9PT0gdW5kZWZpbmVkICkgcXVhdGVybmlvbiA9IG5ldyBUSFJFRS5RdWF0ZXJuaW9uKCk7XG5cblx0XHRcdHRoaXMuYXBwbHlRdWF0ZXJuaW9uKCBxdWF0ZXJuaW9uLnNldEZyb21BeGlzQW5nbGUoIGF4aXMsIGFuZ2xlICkgKTtcblxuXHRcdFx0cmV0dXJuIHRoaXM7XG5cblx0XHR9O1xuXG5cdH0oKSxcblxuXHRhcHBseU1hdHJpeDM6IGZ1bmN0aW9uICggbSApIHtcblxuXHRcdHZhciB4ID0gdGhpcy54O1xuXHRcdHZhciB5ID0gdGhpcy55O1xuXHRcdHZhciB6ID0gdGhpcy56O1xuXG5cdFx0dmFyIGUgPSBtLmVsZW1lbnRzO1xuXG5cdFx0dGhpcy54ID0gZVsgMCBdICogeCArIGVbIDMgXSAqIHkgKyBlWyA2IF0gKiB6O1xuXHRcdHRoaXMueSA9IGVbIDEgXSAqIHggKyBlWyA0IF0gKiB5ICsgZVsgNyBdICogejtcblx0XHR0aGlzLnogPSBlWyAyIF0gKiB4ICsgZVsgNSBdICogeSArIGVbIDggXSAqIHo7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGFwcGx5TWF0cml4NDogZnVuY3Rpb24gKCBtICkge1xuXG5cdFx0Ly8gaW5wdXQ6IFRIUkVFLk1hdHJpeDQgYWZmaW5lIG1hdHJpeFxuXG5cdFx0dmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnksIHogPSB0aGlzLno7XG5cblx0XHR2YXIgZSA9IG0uZWxlbWVudHM7XG5cblx0XHR0aGlzLnggPSBlWyAwIF0gKiB4ICsgZVsgNCBdICogeSArIGVbIDggXSAgKiB6ICsgZVsgMTIgXTtcblx0XHR0aGlzLnkgPSBlWyAxIF0gKiB4ICsgZVsgNSBdICogeSArIGVbIDkgXSAgKiB6ICsgZVsgMTMgXTtcblx0XHR0aGlzLnogPSBlWyAyIF0gKiB4ICsgZVsgNiBdICogeSArIGVbIDEwIF0gKiB6ICsgZVsgMTQgXTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0YXBwbHlQcm9qZWN0aW9uOiBmdW5jdGlvbiAoIG0gKSB7XG5cblx0XHQvLyBpbnB1dDogVEhSRUUuTWF0cml4NCBwcm9qZWN0aW9uIG1hdHJpeFxuXG5cdFx0dmFyIHggPSB0aGlzLngsIHkgPSB0aGlzLnksIHogPSB0aGlzLno7XG5cblx0XHR2YXIgZSA9IG0uZWxlbWVudHM7XG5cdFx0dmFyIGQgPSAxIC8gKCBlWyAzIF0gKiB4ICsgZVsgNyBdICogeSArIGVbIDExIF0gKiB6ICsgZVsgMTUgXSApOyAvLyBwZXJzcGVjdGl2ZSBkaXZpZGVcblxuXHRcdHRoaXMueCA9ICggZVsgMCBdICogeCArIGVbIDQgXSAqIHkgKyBlWyA4IF0gICogeiArIGVbIDEyIF0gKSAqIGQ7XG5cdFx0dGhpcy55ID0gKCBlWyAxIF0gKiB4ICsgZVsgNSBdICogeSArIGVbIDkgXSAgKiB6ICsgZVsgMTMgXSApICogZDtcblx0XHR0aGlzLnogPSAoIGVbIDIgXSAqIHggKyBlWyA2IF0gKiB5ICsgZVsgMTAgXSAqIHogKyBlWyAxNCBdICkgKiBkO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRhcHBseVF1YXRlcm5pb246IGZ1bmN0aW9uICggcSApIHtcblxuXHRcdHZhciB4ID0gdGhpcy54O1xuXHRcdHZhciB5ID0gdGhpcy55O1xuXHRcdHZhciB6ID0gdGhpcy56O1xuXG5cdFx0dmFyIHF4ID0gcS54O1xuXHRcdHZhciBxeSA9IHEueTtcblx0XHR2YXIgcXogPSBxLno7XG5cdFx0dmFyIHF3ID0gcS53O1xuXG5cdFx0Ly8gY2FsY3VsYXRlIHF1YXQgKiB2ZWN0b3JcblxuXHRcdHZhciBpeCA9ICBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHk7XG5cdFx0dmFyIGl5ID0gIHF3ICogeSArIHF6ICogeCAtIHF4ICogejtcblx0XHR2YXIgaXogPSAgcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4O1xuXHRcdHZhciBpdyA9IC0gcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG5cdFx0Ly8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuXG5cdFx0dGhpcy54ID0gaXggKiBxdyArIGl3ICogLSBxeCArIGl5ICogLSBxeiAtIGl6ICogLSBxeTtcblx0XHR0aGlzLnkgPSBpeSAqIHF3ICsgaXcgKiAtIHF5ICsgaXogKiAtIHF4IC0gaXggKiAtIHF6O1xuXHRcdHRoaXMueiA9IGl6ICogcXcgKyBpdyAqIC0gcXogKyBpeCAqIC0gcXkgLSBpeSAqIC0gcXg7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHByb2plY3Q6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBtYXRyaXg7XG5cblx0XHRyZXR1cm4gZnVuY3Rpb24gKCBjYW1lcmEgKSB7XG5cblx0XHRcdGlmICggbWF0cml4ID09PSB1bmRlZmluZWQgKSBtYXRyaXggPSBuZXcgVEhSRUUuTWF0cml4NCgpO1xuXG5cdFx0XHRtYXRyaXgubXVsdGlwbHlNYXRyaWNlcyggY2FtZXJhLnByb2plY3Rpb25NYXRyaXgsIG1hdHJpeC5nZXRJbnZlcnNlKCBjYW1lcmEubWF0cml4V29ybGQgKSApO1xuXHRcdFx0cmV0dXJuIHRoaXMuYXBwbHlQcm9qZWN0aW9uKCBtYXRyaXggKTtcblxuXHRcdH07XG5cblx0fSgpLFxuXG5cdHVucHJvamVjdDogZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIG1hdHJpeDtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIGNhbWVyYSApIHtcblxuXHRcdFx0aWYgKCBtYXRyaXggPT09IHVuZGVmaW5lZCApIG1hdHJpeCA9IG5ldyBUSFJFRS5NYXRyaXg0KCk7XG5cblx0XHRcdG1hdHJpeC5tdWx0aXBseU1hdHJpY2VzKCBjYW1lcmEubWF0cml4V29ybGQsIG1hdHJpeC5nZXRJbnZlcnNlKCBjYW1lcmEucHJvamVjdGlvbk1hdHJpeCApICk7XG5cdFx0XHRyZXR1cm4gdGhpcy5hcHBseVByb2plY3Rpb24oIG1hdHJpeCApO1xuXG5cdFx0fTtcblxuXHR9KCksXG5cblx0dHJhbnNmb3JtRGlyZWN0aW9uOiBmdW5jdGlvbiAoIG0gKSB7XG5cblx0XHQvLyBpbnB1dDogVEhSRUUuTWF0cml4NCBhZmZpbmUgbWF0cml4XG5cdFx0Ly8gdmVjdG9yIGludGVycHJldGVkIGFzIGEgZGlyZWN0aW9uXG5cblx0XHR2YXIgeCA9IHRoaXMueCwgeSA9IHRoaXMueSwgeiA9IHRoaXMuejtcblxuXHRcdHZhciBlID0gbS5lbGVtZW50cztcblxuXHRcdHRoaXMueCA9IGVbIDAgXSAqIHggKyBlWyA0IF0gKiB5ICsgZVsgOCBdICAqIHo7XG5cdFx0dGhpcy55ID0gZVsgMSBdICogeCArIGVbIDUgXSAqIHkgKyBlWyA5IF0gICogejtcblx0XHR0aGlzLnogPSBlWyAyIF0gKiB4ICsgZVsgNiBdICogeSArIGVbIDEwIF0gKiB6O1xuXG5cdFx0dGhpcy5ub3JtYWxpemUoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0ZGl2aWRlOiBmdW5jdGlvbiAoIHYgKSB7XG5cblx0XHR0aGlzLnggLz0gdi54O1xuXHRcdHRoaXMueSAvPSB2Lnk7XG5cdFx0dGhpcy56IC89IHYuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0ZGl2aWRlU2NhbGFyOiBmdW5jdGlvbiAoIHNjYWxhciApIHtcblxuXHRcdGlmICggc2NhbGFyICE9PSAwICkge1xuXG5cdFx0XHR2YXIgaW52U2NhbGFyID0gMSAvIHNjYWxhcjtcblxuXHRcdFx0dGhpcy54ICo9IGludlNjYWxhcjtcblx0XHRcdHRoaXMueSAqPSBpbnZTY2FsYXI7XG5cdFx0XHR0aGlzLnogKj0gaW52U2NhbGFyO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0dGhpcy54ID0gMDtcblx0XHRcdHRoaXMueSA9IDA7XG5cdFx0XHR0aGlzLnogPSAwO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRtaW46IGZ1bmN0aW9uICggdiApIHtcblxuXHRcdGlmICggdGhpcy54ID4gdi54ICkge1xuXG5cdFx0XHR0aGlzLnggPSB2Lng7XG5cblx0XHR9XG5cblx0XHRpZiAoIHRoaXMueSA+IHYueSApIHtcblxuXHRcdFx0dGhpcy55ID0gdi55O1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnogPiB2LnogKSB7XG5cblx0XHRcdHRoaXMueiA9IHYuejtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0bWF4OiBmdW5jdGlvbiAoIHYgKSB7XG5cblx0XHRpZiAoIHRoaXMueCA8IHYueCApIHtcblxuXHRcdFx0dGhpcy54ID0gdi54O1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnkgPCB2LnkgKSB7XG5cblx0XHRcdHRoaXMueSA9IHYueTtcblxuXHRcdH1cblxuXHRcdGlmICggdGhpcy56IDwgdi56ICkge1xuXG5cdFx0XHR0aGlzLnogPSB2Lno7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGNsYW1wOiBmdW5jdGlvbiAoIG1pbiwgbWF4ICkge1xuXG5cdFx0Ly8gVGhpcyBmdW5jdGlvbiBhc3N1bWVzIG1pbiA8IG1heCwgaWYgdGhpcyBhc3N1bXB0aW9uIGlzbid0IHRydWUgaXQgd2lsbCBub3Qgb3BlcmF0ZSBjb3JyZWN0bHlcblxuXHRcdGlmICggdGhpcy54IDwgbWluLnggKSB7XG5cblx0XHRcdHRoaXMueCA9IG1pbi54O1xuXG5cdFx0fSBlbHNlIGlmICggdGhpcy54ID4gbWF4LnggKSB7XG5cblx0XHRcdHRoaXMueCA9IG1heC54O1xuXG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnkgPCBtaW4ueSApIHtcblxuXHRcdFx0dGhpcy55ID0gbWluLnk7XG5cblx0XHR9IGVsc2UgaWYgKCB0aGlzLnkgPiBtYXgueSApIHtcblxuXHRcdFx0dGhpcy55ID0gbWF4Lnk7XG5cblx0XHR9XG5cblx0XHRpZiAoIHRoaXMueiA8IG1pbi56ICkge1xuXG5cdFx0XHR0aGlzLnogPSBtaW4uejtcblxuXHRcdH0gZWxzZSBpZiAoIHRoaXMueiA+IG1heC56ICkge1xuXG5cdFx0XHR0aGlzLnogPSBtYXguejtcblxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0Y2xhbXBTY2FsYXI6ICggZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIG1pbiwgbWF4O1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggbWluVmFsLCBtYXhWYWwgKSB7XG5cblx0XHRcdGlmICggbWluID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdFx0bWluID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblx0XHRcdFx0bWF4ID0gbmV3IFRIUkVFLlZlY3RvcjMoKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRtaW4uc2V0KCBtaW5WYWwsIG1pblZhbCwgbWluVmFsICk7XG5cdFx0XHRtYXguc2V0KCBtYXhWYWwsIG1heFZhbCwgbWF4VmFsICk7XG5cblx0XHRcdHJldHVybiB0aGlzLmNsYW1wKCBtaW4sIG1heCApO1xuXG5cdFx0fTtcblxuXHR9ICkoKSxcblxuXHRmbG9vcjogZnVuY3Rpb24gKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5mbG9vciggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5mbG9vciggdGhpcy55ICk7XG5cdFx0dGhpcy56ID0gTWF0aC5mbG9vciggdGhpcy56ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGNlaWw6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHRoaXMueCA9IE1hdGguY2VpbCggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5jZWlsKCB0aGlzLnkgKTtcblx0XHR0aGlzLnogPSBNYXRoLmNlaWwoIHRoaXMueiApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRyb3VuZDogZnVuY3Rpb24gKCkge1xuXG5cdFx0dGhpcy54ID0gTWF0aC5yb3VuZCggdGhpcy54ICk7XG5cdFx0dGhpcy55ID0gTWF0aC5yb3VuZCggdGhpcy55ICk7XG5cdFx0dGhpcy56ID0gTWF0aC5yb3VuZCggdGhpcy56ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHJvdW5kVG9aZXJvOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR0aGlzLnggPSAoIHRoaXMueCA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy54ICkgOiBNYXRoLmZsb29yKCB0aGlzLnggKTtcblx0XHR0aGlzLnkgPSAoIHRoaXMueSA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy55ICkgOiBNYXRoLmZsb29yKCB0aGlzLnkgKTtcblx0XHR0aGlzLnogPSAoIHRoaXMueiA8IDAgKSA/IE1hdGguY2VpbCggdGhpcy56ICkgOiBNYXRoLmZsb29yKCB0aGlzLnogKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0bmVnYXRlOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR0aGlzLnggPSAtIHRoaXMueDtcblx0XHR0aGlzLnkgPSAtIHRoaXMueTtcblx0XHR0aGlzLnogPSAtIHRoaXMuejtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0ZG90OiBmdW5jdGlvbiAoIHYgKSB7XG5cblx0XHRyZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55ICsgdGhpcy56ICogdi56O1xuXG5cdH0sXG5cblx0bGVuZ3RoU3E6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiB0aGlzLnggKiB0aGlzLnggKyB0aGlzLnkgKiB0aGlzLnkgKyB0aGlzLnogKiB0aGlzLno7XG5cblx0fSxcblxuXHRsZW5ndGg6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiBNYXRoLnNxcnQoIHRoaXMueCAqIHRoaXMueCArIHRoaXMueSAqIHRoaXMueSArIHRoaXMueiAqIHRoaXMueiApO1xuXG5cdH0sXG5cblx0bGVuZ3RoTWFuaGF0dGFuOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5hYnMoIHRoaXMueCApICsgTWF0aC5hYnMoIHRoaXMueSApICsgTWF0aC5hYnMoIHRoaXMueiApO1xuXG5cdH0sXG5cblx0bm9ybWFsaXplOiBmdW5jdGlvbiAoKSB7XG5cblx0XHRyZXR1cm4gdGhpcy5kaXZpZGVTY2FsYXIoIHRoaXMubGVuZ3RoKCkgKTtcblxuXHR9LFxuXG5cdHNldExlbmd0aDogZnVuY3Rpb24gKCBsICkge1xuXG5cdFx0dmFyIG9sZExlbmd0aCA9IHRoaXMubGVuZ3RoKCk7XG5cblx0XHRpZiAoIG9sZExlbmd0aCAhPT0gMCAmJiBsICE9PSBvbGRMZW5ndGggICkge1xuXG5cdFx0XHR0aGlzLm11bHRpcGx5U2NhbGFyKCBsIC8gb2xkTGVuZ3RoICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRsZXJwOiBmdW5jdGlvbiAoIHYsIGFscGhhICkge1xuXG5cdFx0dGhpcy54ICs9ICggdi54IC0gdGhpcy54ICkgKiBhbHBoYTtcblx0XHR0aGlzLnkgKz0gKCB2LnkgLSB0aGlzLnkgKSAqIGFscGhhO1xuXHRcdHRoaXMueiArPSAoIHYueiAtIHRoaXMueiApICogYWxwaGE7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGxlcnBWZWN0b3JzOiBmdW5jdGlvbiAoIHYxLCB2MiwgYWxwaGEgKSB7XG5cblx0XHR0aGlzLnN1YlZlY3RvcnMoIHYyLCB2MSApLm11bHRpcGx5U2NhbGFyKCBhbHBoYSApLmFkZCggdjEgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0Y3Jvc3M6IGZ1bmN0aW9uICggdiwgdyApIHtcblxuXHRcdGlmICggdyAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHRUSFJFRS53YXJuKCAnVEhSRUUuVmVjdG9yMzogLmNyb3NzKCkgbm93IG9ubHkgYWNjZXB0cyBvbmUgYXJndW1lbnQuIFVzZSAuY3Jvc3NWZWN0b3JzKCBhLCBiICkgaW5zdGVhZC4nICk7XG5cdFx0XHRyZXR1cm4gdGhpcy5jcm9zc1ZlY3RvcnMoIHYsIHcgKTtcblxuXHRcdH1cblxuXHRcdHZhciB4ID0gdGhpcy54LCB5ID0gdGhpcy55LCB6ID0gdGhpcy56O1xuXG5cdFx0dGhpcy54ID0geSAqIHYueiAtIHogKiB2Lnk7XG5cdFx0dGhpcy55ID0geiAqIHYueCAtIHggKiB2Lno7XG5cdFx0dGhpcy56ID0geCAqIHYueSAtIHkgKiB2Lng7XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdGNyb3NzVmVjdG9yczogZnVuY3Rpb24gKCBhLCBiICkge1xuXG5cdFx0dmFyIGF4ID0gYS54LCBheSA9IGEueSwgYXogPSBhLno7XG5cdFx0dmFyIGJ4ID0gYi54LCBieSA9IGIueSwgYnogPSBiLno7XG5cblx0XHR0aGlzLnggPSBheSAqIGJ6IC0gYXogKiBieTtcblx0XHR0aGlzLnkgPSBheiAqIGJ4IC0gYXggKiBiejtcblx0XHR0aGlzLnogPSBheCAqIGJ5IC0gYXkgKiBieDtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0cHJvamVjdE9uVmVjdG9yOiBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgdjEsIGRvdDtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIHZlY3RvciApIHtcblxuXHRcdFx0aWYgKCB2MSA9PT0gdW5kZWZpbmVkICkgdjEgPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuXG5cdFx0XHR2MS5jb3B5KCB2ZWN0b3IgKS5ub3JtYWxpemUoKTtcblxuXHRcdFx0ZG90ID0gdGhpcy5kb3QoIHYxICk7XG5cblx0XHRcdHJldHVybiB0aGlzLmNvcHkoIHYxICkubXVsdGlwbHlTY2FsYXIoIGRvdCApO1xuXG5cdFx0fTtcblxuXHR9KCksXG5cblx0cHJvamVjdE9uUGxhbmU6IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciB2MTtcblxuXHRcdHJldHVybiBmdW5jdGlvbiAoIHBsYW5lTm9ybWFsICkge1xuXG5cdFx0XHRpZiAoIHYxID09PSB1bmRlZmluZWQgKSB2MSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0XHRcdHYxLmNvcHkoIHRoaXMgKS5wcm9qZWN0T25WZWN0b3IoIHBsYW5lTm9ybWFsICk7XG5cblx0XHRcdHJldHVybiB0aGlzLnN1YiggdjEgKTtcblxuXHRcdH1cblxuXHR9KCksXG5cblx0cmVmbGVjdDogZnVuY3Rpb24gKCkge1xuXG5cdFx0Ly8gcmVmbGVjdCBpbmNpZGVudCB2ZWN0b3Igb2ZmIHBsYW5lIG9ydGhvZ29uYWwgdG8gbm9ybWFsXG5cdFx0Ly8gbm9ybWFsIGlzIGFzc3VtZWQgdG8gaGF2ZSB1bml0IGxlbmd0aFxuXG5cdFx0dmFyIHYxO1xuXG5cdFx0cmV0dXJuIGZ1bmN0aW9uICggbm9ybWFsICkge1xuXG5cdFx0XHRpZiAoIHYxID09PSB1bmRlZmluZWQgKSB2MSA9IG5ldyBUSFJFRS5WZWN0b3IzKCk7XG5cblx0XHRcdHJldHVybiB0aGlzLnN1YiggdjEuY29weSggbm9ybWFsICkubXVsdGlwbHlTY2FsYXIoIDIgKiB0aGlzLmRvdCggbm9ybWFsICkgKSApO1xuXG5cdFx0fVxuXG5cdH0oKSxcblxuXHRhbmdsZVRvOiBmdW5jdGlvbiAoIHYgKSB7XG5cblx0XHR2YXIgdGhldGEgPSB0aGlzLmRvdCggdiApIC8gKCB0aGlzLmxlbmd0aCgpICogdi5sZW5ndGgoKSApO1xuXG5cdFx0Ly8gY2xhbXAsIHRvIGhhbmRsZSBudW1lcmljYWwgcHJvYmxlbXNcblxuXHRcdHJldHVybiBNYXRoLmFjb3MoIFRIUkVFLk1hdGguY2xhbXAoIHRoZXRhLCAtIDEsIDEgKSApO1xuXG5cdH0sXG5cblx0ZGlzdGFuY2VUbzogZnVuY3Rpb24gKCB2ICkge1xuXG5cdFx0cmV0dXJuIE1hdGguc3FydCggdGhpcy5kaXN0YW5jZVRvU3F1YXJlZCggdiApICk7XG5cblx0fSxcblxuXHRkaXN0YW5jZVRvU3F1YXJlZDogZnVuY3Rpb24gKCB2ICkge1xuXG5cdFx0dmFyIGR4ID0gdGhpcy54IC0gdi54O1xuXHRcdHZhciBkeSA9IHRoaXMueSAtIHYueTtcblx0XHR2YXIgZHogPSB0aGlzLnogLSB2Lno7XG5cblx0XHRyZXR1cm4gZHggKiBkeCArIGR5ICogZHkgKyBkeiAqIGR6O1xuXG5cdH0sXG5cblx0c2V0RXVsZXJGcm9tUm90YXRpb25NYXRyaXg6IGZ1bmN0aW9uICggbSwgb3JkZXIgKSB7XG5cblx0XHRUSFJFRS5lcnJvciggJ1RIUkVFLlZlY3RvcjM6IC5zZXRFdWxlckZyb21Sb3RhdGlvbk1hdHJpeCgpIGhhcyBiZWVuIHJlbW92ZWQuIFVzZSBFdWxlci5zZXRGcm9tUm90YXRpb25NYXRyaXgoKSBpbnN0ZWFkLicgKTtcblxuXHR9LFxuXG5cdHNldEV1bGVyRnJvbVF1YXRlcm5pb246IGZ1bmN0aW9uICggcSwgb3JkZXIgKSB7XG5cblx0XHRUSFJFRS5lcnJvciggJ1RIUkVFLlZlY3RvcjM6IC5zZXRFdWxlckZyb21RdWF0ZXJuaW9uKCkgaGFzIGJlZW4gcmVtb3ZlZC4gVXNlIEV1bGVyLnNldEZyb21RdWF0ZXJuaW9uKCkgaW5zdGVhZC4nICk7XG5cblx0fSxcblxuXHRnZXRQb3NpdGlvbkZyb21NYXRyaXg6IGZ1bmN0aW9uICggbSApIHtcblxuXHRcdFRIUkVFLndhcm4oICdUSFJFRS5WZWN0b3IzOiAuZ2V0UG9zaXRpb25Gcm9tTWF0cml4KCkgaGFzIGJlZW4gcmVuYW1lZCB0byAuc2V0RnJvbU1hdHJpeFBvc2l0aW9uKCkuJyApO1xuXG5cdFx0cmV0dXJuIHRoaXMuc2V0RnJvbU1hdHJpeFBvc2l0aW9uKCBtICk7XG5cblx0fSxcblxuXHRnZXRTY2FsZUZyb21NYXRyaXg6IGZ1bmN0aW9uICggbSApIHtcblxuXHRcdFRIUkVFLndhcm4oICdUSFJFRS5WZWN0b3IzOiAuZ2V0U2NhbGVGcm9tTWF0cml4KCkgaGFzIGJlZW4gcmVuYW1lZCB0byAuc2V0RnJvbU1hdHJpeFNjYWxlKCkuJyApO1xuXG5cdFx0cmV0dXJuIHRoaXMuc2V0RnJvbU1hdHJpeFNjYWxlKCBtICk7XG5cdH0sXG5cblx0Z2V0Q29sdW1uRnJvbU1hdHJpeDogZnVuY3Rpb24gKCBpbmRleCwgbWF0cml4ICkge1xuXG5cdFx0VEhSRUUud2FybiggJ1RIUkVFLlZlY3RvcjM6IC5nZXRDb2x1bW5Gcm9tTWF0cml4KCkgaGFzIGJlZW4gcmVuYW1lZCB0byAuc2V0RnJvbU1hdHJpeENvbHVtbigpLicgKTtcblxuXHRcdHJldHVybiB0aGlzLnNldEZyb21NYXRyaXhDb2x1bW4oIGluZGV4LCBtYXRyaXggKTtcblxuXHR9LFxuXG5cdHNldEZyb21NYXRyaXhQb3NpdGlvbjogZnVuY3Rpb24gKCBtICkge1xuXG5cdFx0dGhpcy54ID0gbS5lbGVtZW50c1sgMTIgXTtcblx0XHR0aGlzLnkgPSBtLmVsZW1lbnRzWyAxMyBdO1xuXHRcdHRoaXMueiA9IG0uZWxlbWVudHNbIDE0IF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHNldEZyb21NYXRyaXhTY2FsZTogZnVuY3Rpb24gKCBtICkge1xuXG5cdFx0dmFyIHN4ID0gdGhpcy5zZXQoIG0uZWxlbWVudHNbIDAgXSwgbS5lbGVtZW50c1sgMSBdLCBtLmVsZW1lbnRzWyAgMiBdICkubGVuZ3RoKCk7XG5cdFx0dmFyIHN5ID0gdGhpcy5zZXQoIG0uZWxlbWVudHNbIDQgXSwgbS5lbGVtZW50c1sgNSBdLCBtLmVsZW1lbnRzWyAgNiBdICkubGVuZ3RoKCk7XG5cdFx0dmFyIHN6ID0gdGhpcy5zZXQoIG0uZWxlbWVudHNbIDggXSwgbS5lbGVtZW50c1sgOSBdLCBtLmVsZW1lbnRzWyAxMCBdICkubGVuZ3RoKCk7XG5cblx0XHR0aGlzLnggPSBzeDtcblx0XHR0aGlzLnkgPSBzeTtcblx0XHR0aGlzLnogPSBzejtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHNldEZyb21NYXRyaXhDb2x1bW46IGZ1bmN0aW9uICggaW5kZXgsIG1hdHJpeCApIHtcblx0XHRcblx0XHR2YXIgb2Zmc2V0ID0gaW5kZXggKiA0O1xuXG5cdFx0dmFyIG1lID0gbWF0cml4LmVsZW1lbnRzO1xuXG5cdFx0dGhpcy54ID0gbWVbIG9mZnNldCBdO1xuXHRcdHRoaXMueSA9IG1lWyBvZmZzZXQgKyAxIF07XG5cdFx0dGhpcy56ID0gbWVbIG9mZnNldCArIDIgXTtcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH0sXG5cblx0ZXF1YWxzOiBmdW5jdGlvbiAoIHYgKSB7XG5cblx0XHRyZXR1cm4gKCAoIHYueCA9PT0gdGhpcy54ICkgJiYgKCB2LnkgPT09IHRoaXMueSApICYmICggdi56ID09PSB0aGlzLnogKSApO1xuXG5cdH0sXG5cblx0ZnJvbUFycmF5OiBmdW5jdGlvbiAoIGFycmF5LCBvZmZzZXQgKSB7XG5cblx0XHRpZiAoIG9mZnNldCA9PT0gdW5kZWZpbmVkICkgb2Zmc2V0ID0gMDtcblxuXHRcdHRoaXMueCA9IGFycmF5WyBvZmZzZXQgXTtcblx0XHR0aGlzLnkgPSBhcnJheVsgb2Zmc2V0ICsgMSBdO1xuXHRcdHRoaXMueiA9IGFycmF5WyBvZmZzZXQgKyAyIF07XG5cblx0XHRyZXR1cm4gdGhpcztcblxuXHR9LFxuXG5cdHRvQXJyYXk6IGZ1bmN0aW9uICggYXJyYXksIG9mZnNldCApIHtcblxuXHRcdGlmICggYXJyYXkgPT09IHVuZGVmaW5lZCApIGFycmF5ID0gW107XG5cdFx0aWYgKCBvZmZzZXQgPT09IHVuZGVmaW5lZCApIG9mZnNldCA9IDA7XG5cblx0XHRhcnJheVsgb2Zmc2V0IF0gPSB0aGlzLng7XG5cdFx0YXJyYXlbIG9mZnNldCArIDEgXSA9IHRoaXMueTtcblx0XHRhcnJheVsgb2Zmc2V0ICsgMiBdID0gdGhpcy56O1xuXG5cdFx0cmV0dXJuIGFycmF5O1xuXG5cdH0sXG5cblx0ZnJvbUF0dHJpYnV0ZTogZnVuY3Rpb24gKCBhdHRyaWJ1dGUsIGluZGV4LCBvZmZzZXQgKSB7XG5cblx0XHRpZiAoIG9mZnNldCA9PT0gdW5kZWZpbmVkICkgb2Zmc2V0ID0gMDtcblxuXHRcdGluZGV4ID0gaW5kZXggKiBhdHRyaWJ1dGUuaXRlbVNpemUgKyBvZmZzZXQ7XG5cblx0XHR0aGlzLnggPSBhdHRyaWJ1dGUuYXJyYXlbIGluZGV4IF07XG5cdFx0dGhpcy55ID0gYXR0cmlidXRlLmFycmF5WyBpbmRleCArIDEgXTtcblx0XHR0aGlzLnogPSBhdHRyaWJ1dGUuYXJyYXlbIGluZGV4ICsgMiBdO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fSxcblxuXHRjbG9uZTogZnVuY3Rpb24gKCkge1xuXG5cdFx0cmV0dXJuIG5ldyBUSFJFRS5WZWN0b3IzKCB0aGlzLngsIHRoaXMueSwgdGhpcy56ICk7XG5cblx0fVxuXG59O1xuIl19
