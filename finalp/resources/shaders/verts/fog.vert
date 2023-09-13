#version 300 es
precision mediump float;

layout (location = 0) in vec4 aVertexPosition;
layout (location = 1) in vec3 aVertexNormal;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vNormal;
out vec4 vPosition;

void main() {
    vNormal = normalize(uNormalMatrix * aVertexNormal);
    vPosition = uModelViewMatrix * aVertexPosition;
    gl_Position = uProjectionMatrix * vPosition;
}
