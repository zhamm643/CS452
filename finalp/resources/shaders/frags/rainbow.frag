#version 300 es

precision highp float;

in vec3 vertex_normal;
in vec4 frag_position;

uniform float uTime; // Add this line

out vec4 frag_value;

void main() {
  vec3 rainbowColor = abs(vertex_normal);

  // Fog parameters
  float fogStart = 10.0;
  float fogCycleDuration = 3.0; // Duration of the fog cycle in seconds
  float minFogEnd = 25.0;
  float maxFogEnd = 85.0;
  float fogEnd = mix(minFogEnd, maxFogEnd, 0.5 * (1.0 + sin(uTime * 2.0 * 3.14159 / fogCycleDuration))); // Animate fogEnd using a sine function

  vec3 fogColor = vec3(0.7, 0.7, 0.7);

  // Calculate the fog factor
  float fogDistance = length(frag_position.xyz);
  float fogFactor = clamp((fogEnd - fogDistance) / (fogEnd - fogStart), 0.0, 1.0);
  fogFactor = smoothstep(0.0, 1.0, fogFactor);

  // Blend the object color with the fog color using the fog factor
  vec3 finalColor = mix(fogColor, rainbowColor, fogFactor);

  frag_value = vec4(finalColor, 1.0);
}
