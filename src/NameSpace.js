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
