uniform float time;
varying vec2 vUv;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )
#pragma glslify: random = require('./random.glsl' )

void main( void ) {

	vec3 color = vec3( 1.0 );
	gl_FragColor = vec4( color, 1.0 );

}