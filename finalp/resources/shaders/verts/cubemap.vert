#version 300 es

precision highp float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

uniform mat4 uModelViewMatrix; 
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform vec3 uLightPosition;
uniform vec3 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

out vec2 vTextureCoord;
out vec3 vLightDirection;
out vec3 vViewDirection;
out vec3 vNormal;

void main(void) {

    vec3 normal = normalize(uNormalMatrix * aVertexNormal);
    vec4 position = uModelViewMatrix * aVertexPosition;

    vec3 viewDirection = normalize(-position.xyz);
    vec3 lightDirection = normalize(uLightPosition - position.xyz);
    
    vTextureCoord = aTextureCoord;
    vLightDirection = lightDirection;
    vViewDirection = viewDirection;
    vNormal = normal;
    
    gl_Position = uProjectionMatrix * position;
}
