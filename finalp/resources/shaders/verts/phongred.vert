#version 300 es
precision mediump float;

in vec3 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord; // new attribute for texture coordinates

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 v_normal;
out vec3 v_viewDirection;
out vec3 v_lightDirection;
out vec2 v_textureCoord; // new varying for texture coordinates

void main() {
  vec4 viewPosition = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = uProjectionMatrix * viewPosition;

  v_normal = normalize(uNormalMatrix * aVertexNormal);
  v_viewDirection = normalize(-viewPosition.xyz);
  v_lightDirection = normalize(vec3(0.0, 0.0, 0.0) - viewPosition.xyz);

  v_textureCoord = aTextureCoord; // pass texture coordinates to fragment shader
}
