#version 300 es

precision highp float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;
in vec3 aVertexTangent;
in vec3 aVertexBitangent;

uniform mat4 uModelViewMatrix; 
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;
uniform mat3 uTBN;

out vec2 vTextureCoord;
out vec3 vLightDirection;
out mat3 vTBN;


void main(void) {
    vec4 position = uModelViewMatrix * aVertexPosition;
    vTextureCoord = aTextureCoord;
    
    vec3 viewPosition = vec3(uModelViewMatrix * aVertexPosition);
    vec3 lightPosition = vec3(0.0, 0.0, 0.0);
    vec3 space = vec3(uModelViewMatrix * vec4(lightPosition, 1.0));
    vLightDirection = normalize(space - viewPosition);

    vTBN = uTBN;

    gl_Position = uProjectionMatrix * position;
}
