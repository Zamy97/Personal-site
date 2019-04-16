// // when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
// // not supported in all browsers though and sometimes needs a prefix, so we need a shim
// window.requestAnimFrame = ( function() {
// 	return window.requestAnimationFrame ||
// 				window.webkitRequestAnimationFrame ||
// 				window.mozRequestAnimationFrame ||
// 				function( callback ) {
// 					window.setTimeout( callback, 1000 / 60 );
// 				};
// })();
//
// // now we will setup our basic variables for the demo
// var canvas = document.getElementById( 'canvas' ),
// 		ctx = canvas.getContext( '2d' ),
// 		// full screen dimensions
// 		cw = window.innerWidth,
// 		ch = window.innerHeight,
// 		// firework collection
// 		fireworks = [],
// 		// particle collection
// 		particles = [],
// 		// starting hue
// 		hue = 120,
// 		// when launching fireworks with a click, too many get launched at once without a limiter, one launch per 5 loop ticks
// 		limiterTotal = 5,
// 		limiterTick = 0,
// 		// this will time the auto launches of fireworks, one launch per 80 loop ticks
// 		timerTotal = 80,
// 		timerTick = 0,
// 		mousedown = false,
// 		// mouse x coordinate,
// 		mx,
// 		// mouse y coordinate
// 		my;
//
// // set canvas dimensions
// canvas.width = cw;
// canvas.height = ch;
//
// // now we are going to setup our function placeholders for the entire demo
//
// // get a random number within a range
// function random( min, max ) {
// 	return Math.random() * ( max - min ) + min;
// }
//
// // calculate the distance between two points
// function calculateDistance( p1x, p1y, p2x, p2y ) {
// 	var xDistance = p1x - p2x,
// 			yDistance = p1y - p2y;
// 	return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
// }
//
// // create firework
// function Firework( sx, sy, tx, ty ) {
// 	// actual coordinates
// 	this.x = sx;
// 	this.y = sy;
// 	// starting coordinates
// 	this.sx = sx;
// 	this.sy = sy;
//
//
// 	// target coordinates
// 	this.tx = tx;
// 	this.ty = ty;
// 	// distance from starting point to target
// 	this.distanceToTarget = calculateDistance( sx, sy, tx, ty );
// 	this.distanceTraveled = 0;
// 	// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
// 	this.coordinates = [];
// 	this.coordinateCount = 3;
// 	// populate initial coordinate collection with the current coordinates
// 	while( this.coordinateCount-- ) {
// 		this.coordinates.push( [ this.x, this.y ] );
// 	}
// 	this.angle = Math.atan2( ty - sy, tx - sx );
// 	this.speed = 2;
// 	this.acceleration = 1.05;
// 	this.brightness = random( 50, 70 );
// 	// circle target indicator radius
// 	this.targetRadius = 1;
// }
//
// // update firework
// Firework.prototype.update = function( index ) {
// 	// remove last item in coordinates array
// 	this.coordinates.pop();
// 	// add current coordinates to the start of the array
// 	this.coordinates.unshift( [ this.x, this.y ] );
//
// 	// cycle the circle target indicator radius
// 	if( this.targetRadius < 8 ) {
// 		this.targetRadius += 0.3;
// 	} else {
// 		this.targetRadius = 1;
// 	}
//
// 	// speed up the firework
// 	this.speed *= this.acceleration;
//
// 	// get the current velocities based on angle and speed
// 	var vx = Math.cos( this.angle ) * this.speed,
// 			vy = Math.sin( this.angle ) * this.speed;
// 	// how far will the firework have traveled with velocities applied?
// 	this.distanceTraveled = calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );
//
// 	// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
// 	if( this.distanceTraveled >= this.distanceToTarget ) {
// 		createParticles( this.tx, this.ty );
// 		// remove the firework, use the index passed into the update function to determine which to remove
// 		fireworks.splice( index, 1 );
// 	} else {
// 		// target not reached, keep traveling
// 		this.x += vx;
// 		this.y += vy;
// 	}
// }
//
// // draw firework
// Firework.prototype.draw = function() {
// 	ctx.beginPath();
// 	// move to the last tracked coordinate in the set, then draw a line to the current x and y
// 	ctx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
// 	ctx.lineTo( this.x, this.y );
// 	ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
// 	ctx.stroke();
//
// 	ctx.beginPath();
// 	// draw the target for this firework with a pulsing circle
// 	ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
// 	ctx.stroke();
// }
//
// // create particle
// function Particle( x, y ) {
// 	this.x = x;
// 	this.y = y;
// 	// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
// 	this.coordinates = [];
// 	this.coordinateCount = 5;
// 	while( this.coordinateCount-- ) {
// 		this.coordinates.push( [ this.x, this.y ] );
// 	}
// 	// set a random angle in all possible directions, in radians
// 	this.angle = random( 0, Math.PI * 2 );
// 	this.speed = random( 1, 10 );
// 	// friction will slow the particle down
// 	this.friction = 0.95;
// 	// gravity will be applied and pull the particle down
// 	this.gravity = 1;
// 	// set the hue to a random number +-20 of the overall hue variable
// 	this.hue = random( hue - 20, hue + 20 );
// 	this.brightness = random( 50, 80 );
// 	this.alpha = 1;
// 	// set how fast the particle fades out
// 	this.decay = random( 0.015, 0.03 );
// }
//
// // update particle
// Particle.prototype.update = function( index ) {
// 	// remove last item in coordinates array
// 	this.coordinates.pop();
// 	// add current coordinates to the start of the array
// 	this.coordinates.unshift( [ this.x, this.y ] );
// 	// slow down the particle
// 	this.speed *= this.friction;
// 	// apply velocity
// 	this.x += Math.cos( this.angle ) * this.speed;
// 	this.y += Math.sin( this.angle ) * this.speed + this.gravity;
// 	// fade out the particle
// 	this.alpha -= this.decay;
//
// 	// remove the particle once the alpha is low enough, based on the passed in index
// 	if( this.alpha <= this.decay ) {
// 		particles.splice( index, 1 );
// 	}
// }
//
// // draw particle
// Particle.prototype.draw = function() {
// 	ctx. beginPath();
// 	// move to the last tracked coordinates in the set, then draw a line to the current x and y
// 	ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
// 	ctx.lineTo( this.x, this.y );
// 	ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
// 	ctx.stroke();
// }
//
// // create particle group/explosion
// function createParticles( x, y ) {
// 	// increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
// 	var particleCount = 30;
// 	while( particleCount-- ) {
// 		particles.push( new Particle( x, y ) );
// 	}
// }
//
// // main demo loop
// function loop() {
// 	// this function will run endlessly with requestAnimationFrame
// 	requestAnimFrame( loop );
//
// 	// increase the hue to get different colored fireworks over time
// 	hue += 0.5;
//
// 	// normally, clearRect() would be used to clear the canvas
// 	// we want to create a trailing effect though
// 	// setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
// 	ctx.globalCompositeOperation = 'destination-out';
// 	// decrease the alpha property to create more prominent trails
// 	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
// 	ctx.fillRect( 0, 0, cw, ch );
// 	// change the composite operation back to our main mode
// 	// lighter creates bright highlight points as the fireworks and particles overlap each other
// 	ctx.globalCompositeOperation = 'lighter';
//
// 	// loop over each firework, draw it, update it
// 	var i = fireworks.length;
// 	while( i-- ) {
// 		fireworks[ i ].draw();
// 		fireworks[ i ].update( i );
// 	}
//
// 	// loop over each particle, draw it, update it
// 	var i = particles.length;
// 	while( i-- ) {
// 		particles[ i ].draw();
// 		particles[ i ].update( i );
// 	}
//
// 	// launch fireworks automatically to random coordinates, when the mouse isn't down
// 	if( timerTick >= timerTotal ) {
// 		if( !mousedown ) {
// 			// start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
// 			fireworks.push( new Firework( cw / 2, ch, random( 0, cw ), random( 0, ch / 2 ) ) );
// 			timerTick = 0;
// 		}
// 	} else {
// 		timerTick++;
// 	}
//
// 	// limit the rate at which fireworks get launched when mouse is down
// 	if( limiterTick >= limiterTotal ) {
// 		if( mousedown ) {
// 			// start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
// 			fireworks.push( new Firework( cw / 2, ch, mx, my ) );
// 			limiterTick = 0;
// 		}
// 	} else {
// 		limiterTick++;
// 	}
// }
//
// // mouse event bindings
// // update the mouse coordinates on mousemove
// canvas.addEventListener( 'mousemove', function( e ) {
// 	mx = e.pageX - canvas.offsetLeft;
// 	my = e.pageY - canvas.offsetTop;
// });
//
// // toggle mousedown state and prevent canvas from being selected
// canvas.addEventListener( 'mousedown', function( e ) {
// 	e.preventDefault();
// 	mousedown = true;
// });
//
// canvas.addEventListener( 'mouseup', function( e ) {
// 	e.preventDefault();
// 	mousedown = false;
// });
//
// // once the window loads, we are ready for some fireworks!
// window.onload = loop;
//

// Testing 0

// // <script type="text/javascript"> (function (d, w, c) { (w[c] = w[c] || []).push(function() { try { w.yaCounter39321480 = new Ya.Metrika({ id:39321480, clickmap:true, trackLinks:true, accurateTrackBounce:true }); } catch(e) { } }); var n = d.getElementsByTagName("script")[0], s = d.createElement("script"), f = function () { n.parentNode.insertBefore(s, n); }; s.type = "text/javascript"; s.async = true; s.src = "https://mc.yandex.ru/metrika/watch.js"; if (w.opera == "[object Opera]"){d.addEventListener("DOMContentLoaded", f, false); } else { f(); } })(document, window, "yandex_metrika_callbacks"); </script> <noscript><div><img src="https://mc.yandex.ru/watch/39321480" style="position:absolute; left:-9999px;" alt="" /></div></noscript>
// //
//
// // Gotten from a codepen that does this nice scolling of a page
// $(function(){
//     //WOW plugin init
//     new WOW().init();
//
//     //parallax effect for banner
//     (function() {
//         var posY;
//         var image = document.getElementById('parallax');;
//         function paralax() {
//             posY = window.pageYOffset;
//             image.style.top = posY * 0.9 + 'px';
//         }
//         window.addEventListener('scroll', paralax);
//     })();
// });


// Testing 1
// CLASSES
class Shard {
  constructor(x, y, hue) {
    this.x = x;
    this.y = y;
    this.hue = hue;
    this.lightness = 50;
    this.size = 15 + Math.random() * 10;
    const angle = Math.random() * 2 * Math.PI;
    const blastSpeed = 1 + Math.random() * 6;
    this.xSpeed = Math.cos(angle) * blastSpeed;
    this.ySpeed = Math.sin(angle) * blastSpeed;
    this.target = getTarget();
    this.ttl = 100;
    this.timer = 0;
  }
  draw() {
    ctx2.fillStyle = `hsl(${this.hue}, 100%, ${this.lightness}%)`;
    ctx2.beginPath();
    ctx2.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx2.closePath();
    ctx2.fill();
  }
  update() {
    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const a = Math.atan2(dy, dx);
      const tx = Math.cos(a) * 5;
      const ty = Math.sin(a) * 5;
      this.size = lerp(this.size, 1.5, 0.05);

      if (dist < 5) {
        this.lightness = lerp(this.lightness, 100, 0.01);
        this.xSpeed = this.ySpeed = 0;
        this.x = lerp(this.x, this.target.x + fidelity / 2, 0.05);
        this.y = lerp(this.y, this.target.y + fidelity / 2, 0.05);
        this.timer += 1;
      } else
      if (dist < 10) {
        this.lightness = lerp(this.lightness, 100, 0.01);
        this.xSpeed = lerp(this.xSpeed, tx, 0.1);
        this.ySpeed = lerp(this.ySpeed, ty, 0.1);
        this.timer += 1;
      } else
      {
        this.xSpeed = lerp(this.xSpeed, tx, 0.02);
        this.ySpeed = lerp(this.ySpeed, ty, 0.02);
      }
    } else
    {
      this.ySpeed += 0.05;
      //this.xSpeed = lerp(this.xSpeed, 0, 0.1);
      this.size = lerp(this.size, 1, 0.05);

      if (this.y > c2.height) {
        shards.forEach((shard, idx) => {
          if (shard === this) {
            shards.splice(idx, 1);
          }
        });
      }
    }
    this.x = this.x + this.xSpeed;
    this.y = this.y + this.ySpeed;
  }}


class Rocket {
  constructor() {
    const quarterW = c2.width / 4;
    this.x = quarterW + Math.random() * (c2.width - quarterW);
    this.y = c2.height - 15;
    this.angle = Math.random() * Math.PI / 4 - Math.PI / 6;
    this.blastSpeed = 6 + Math.random() * 7;
    this.shardCount = 15 + Math.floor(Math.random() * 15);
    this.xSpeed = Math.sin(this.angle) * this.blastSpeed;
    this.ySpeed = -Math.cos(this.angle) * this.blastSpeed;
    this.hue = Math.floor(Math.random() * 360);
    this.trail = [];
  }
  draw() {
    ctx2.save();
    ctx2.translate(this.x, this.y);
    ctx2.rotate(Math.atan2(this.ySpeed, this.xSpeed) + Math.PI / 2);
    ctx2.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
    ctx2.fillRect(0, 0, 5, 15);
    ctx2.restore();
  }
  update() {
    this.x = this.x + this.xSpeed;
    this.y = this.y + this.ySpeed;
    this.ySpeed += 0.1;
  }

  explode() {
    for (let i = 0; i < 70; i++) {
      shards.push(new Shard(this.x, this.y, this.hue));
    }
  }}


// INITIALIZATION
const [c1, c2, c3] = document.querySelectorAll('canvas');
const [ctx1, ctx2, ctx3] = [c1, c2, c3].map(c => c.getContext('2d'));
let fontSize = 200;
const rockets = [];
const shards = [];
const targets = [];
const fidelity = 3;
let counter = 0;
c2.width = c3.width = window.innerWidth;
c2.height = c3.height = window.innerHeight;
ctx1.fillStyle = '#000';
const text = 'Akhtar Zaman';
let textWidth = 99999999;

while (textWidth > window.innerWidth) {
  ctx1.font = `900 ${fontSize--}px Arial`;
  textWidth = ctx1.measureText(text).width;
}

c1.width = textWidth;
c1.height = fontSize * 1.5;
ctx1.font = `900 ${fontSize}px Arial`;
ctx1.fillText(text, 0, fontSize);
const imgData = ctx1.getImageData(0, 0, c1.width, c1.height);
for (let i = 0, max = imgData.data.length; i < max; i += 4) {
  const alpha = imgData.data[i + 3];
  const x = Math.floor(i / 4) % imgData.width;
  const y = Math.floor(i / 4 / imgData.width);

  if (alpha && x % fidelity === 0 && y % fidelity === 0) {
    targets.push({ x, y });
  }
}

ctx3.fillStyle = '#FFF';
ctx3.shadowColor = '#FFF';
ctx3.shadowBlur = 25;

// ANIMATION LOOP
(function loop() {
  ctx2.fillStyle = "rgba(0, 0, 0, .1)";
  ctx2.fillRect(0, 0, c2.width, c2.height);
  //ctx2.clearRect(0, 0, c2.width, c2.height);
  counter += 1;

  if (counter % 15 === 0) {
    rockets.push(new Rocket());
  }
  rockets.forEach((r, i) => {
    r.draw();
    r.update();
    if (r.ySpeed > 0) {
      r.explode();
      rockets.splice(i, 1);
    }
  });

  shards.forEach((s, i) => {
    s.draw();
    s.update();

    if (s.timer >= s.ttl || s.lightness >= 99) {
      ctx3.fillRect(s.target.x, s.target.y, fidelity + 1, fidelity + 1);
      shards.splice(i, 1);
    }
  });

  requestAnimationFrame(loop);
})();

// HELPER FUNCTIONS
const lerp = (a, b, t) => Math.abs(b - a) > 0.1 ? a + t * (b - a) : b;

function getTarget() {
  if (targets.length > 0) {
    const idx = Math.floor(Math.random() * targets.length);
    let { x, y } = targets[idx];
    targets.splice(idx, 1);

    x += c2.width / 2 - textWidth / 2;
    y += c2.height / 2 - fontSize / 2;

    return { x, y };
  }
}
