#Planet positions

Computes planet positions, plus the Earth's Moon, on any given UTC time.

##Usage

Include planet-positions.js (or planet-positions.min.js), then call 

```javascript
var planets = window.lagrange.planet_positions.getPositions(new Date());
```

An array of objects will be returned, one for each planet, with a Three.js Vector3 as the planet's position. If you also want to receive the planet's velocity as a Vector3, specify a second parameter set to true.

```
{
	name: 'earth',
	position: Three.Vector3,
	velocity: Three.Vector3
}
```


Credits
-------

* Planets orbital elements were taken from Nasa's [Jet Propulsion Laboratory](http://ssd.jpl.nasa.gov/?planet_pos).
* I learned about calculating positions from orbital elements by reading these documents by [Keith Burnett](http://www.stargazing.net/kepler/ellipse.html), [Paul Schlyter](http://www.stjarnhimlen.se/comp/tutorial.html) and [E M Standish (JPL)](http://ssd.jpl.nasa.gov/txt/aprx_pos_planets.pdf).
* David Eagle for orbital calculations of the moon, based on "Lunar Tables and Programs From 4000 B.C. TO A.D. 8000" by Michelle Chapront-Touze and Jean Chapront. See [mathworks.com](http://www.mathworks.com/matlabcentral/fileexchange/39130-orbital-elements-of-the-moon).

More details on La Grange's blog at <a href="http://lab.la-grange.ca/en/jsorrery">http://lab.la-grange.ca/en/jsorrery</a>
