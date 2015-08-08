
(function(ns){
'use strict';

	var pp = ns.planet_positions;

	var planets = pp.getPositions(new Date('1977-12-21T12:00:00Z'), true);
	console.log(planets);
	planets.forEach(function(pos){
		var div = document.createElement('div');
		div.className = 'planet';
		div.innerHTML = pos.name;
		div.style.top = ((-pos.position.y / 2000000000)+(window.innerHeight/2))+'px';
		div.style.left = ((pos.position.x / 2000000000)+(window.innerWidth/2))+'px';
		document.body.appendChild(div); 
	});
}(window.lagrange));