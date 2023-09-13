#version 300 es

precision mediump float;

in vec3 outColor;
in vec3 outBary;

out vec4 fragColor;

float isOnTriangleEdge(vec3 b, float e){
  vec3 howClose = smoothstep(vec3(0.0), vec3(e), b);
  return clamp(1.0 - min(min(howClose.x, howClose.y), howClose.z), 0.0, 1.0);
}

void main() {
  vec3 newColor = abs(outBary);
  fragColor = vec4(newColor, 1.0);
}
