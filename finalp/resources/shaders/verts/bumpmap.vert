#version 300 es
precision highp float;

layout (location = 0) in vec4 aVertexPosition;
layout (location = 1) in vec3 aVertexNormal;
layout (location = 2) in vec2 aTextureCoord;
layout (location = 3) in vec3 aVertexTangent;
layout (location = 4) in vec3 aVertexBitangent;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec3 vFragPos;
out vec3 vTangentLightPos;
out vec3 vTangentViewPos;
out vec2 vTextureCoord;

uniform vec3 uLightPos;
uniform vec3 uViewPos;

void main() {
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    vFragPos = vec3(uModelViewMatrix * aVertexPosition);

    // Construct TBN matrix
    vec3 T = normalize(uNormalMatrix * aVertexTangent);
    vec3 N = normalize(uNormalMatrix * aVertexNormal);
    vec3 B = normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

    vTangentLightPos = TBN * uLightPos;
    vTangentViewPos = TBN * uViewPos;
    vTextureCoord = aTextureCoord;
}
