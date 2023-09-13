#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;

out vec3 outColor;
out vec3 outNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  outColor = vec3(1.0, 1.0, 1.0);
  outNormal = (uModelViewMatrix * vec4(aVertexNormal, 0.0)).xyz;
}
