#version 300 es

in vec3 aVertexPosition;
in vec3 aVertexNormal;

out vec3 vertex_normal;
out vec4 frag_position; // Add this line

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vertex_normal = normalize(aVertexNormal);
  frag_position = uModelViewMatrix * vec4(aVertexPosition, 1.0); // Add this line
}
