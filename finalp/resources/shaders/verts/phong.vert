#version 300 es
precision mediump float;

in vec3 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;


out vec3 v_normal;
out vec3 v_viewDirection;
out vec3 v_lightDirection;

void main() {
  vec4 viewPosition = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = uProjectionMatrix * viewPosition;

  v_normal = normalize(uNormalMatrix * aVertexNormal);
  v_viewDirection = normalize(-viewPosition.xyz);
  v_lightDirection = normalize(vec3(0.0, 0.0, 0.0) - viewPosition.xyz);
}