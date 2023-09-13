#version 300 es

precision highp float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;

uniform mat4 uModelViewMatrix; 
uniform mat4 uProjectionMatrix;
uniform mat3 uNormalMatrix;

uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

out vec4 vColor;

void main(void) {


// get the normal of the vertex
vec3 normal = normalize(uNormalMatrix * aVertexNormal);
// transform position
vec4 position = uModelViewMatrix * aVertexPosition;

vec3 viewDirection = normalize(-position.xyz);
vec3 lightDirection = normalize(uLightPosition - position.xyz);

// diffuse reflection at the vertex
float lamb = max(dot(lightDirection, normal), 0.0);

vec3 halfVector = normalize(lightDirection + viewDirection);
float specularAngle = pow(max(dot(halfVector, normal), 0.0), uShininess);

// calculate the parts of the lighting equation
vec3 diffuse = uDiffuseColor * lamb * uLightColor;
vec3 specular = uSpecularColor * specularAngle * uLightColor;

// get final color by combining the components, then transform using uProjectionMatrix
vColor = vec4(uAmbientColor + diffuse + specular, 1.0);
gl_Position = uProjectionMatrix * position;

}