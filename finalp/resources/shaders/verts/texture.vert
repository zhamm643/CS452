#version 300 es

precision highp float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

uniform mat4 uModelViewMatrix; 
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

out vec2 vTextureCoord;

void main(void) {

    vec3 normal = normalize(uNormalMatrix * aVertexNormal);
    vec4 position = uModelViewMatrix * aVertexPosition;

    // pass texture coordinate to fragment shader
    vTextureCoord = aTextureCoord;
    
    gl_Position = uProjectionMatrix * position;
}
