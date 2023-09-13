#version 300 es
precision mediump float;

in vec3 vNormal;
in vec4 vPosition;

uniform vec3 uLightPosition;
uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

uniform vec3 uFogColor;
uniform float uFogDensity;

out vec4 fragColor;

void main() {
    vec3 lightDirection = normalize(uLightPosition - vPosition.xyz);
    vec3 normal = normalize(vNormal);

    // Compute diffuse and specular lighting
    float diffuse = max(dot(normal, lightDirection), 0.0);
    vec3 reflectDir = reflect(-lightDirection, normal);
    float specular = pow(max(dot(normal, reflectDir), 0.0), uShininess);

    // Calculate fog factor based on distance from camera
    float fogFactor = exp(-uFogDensity * uFogDensity * vPosition.z * vPosition.z);
    fogFactor = clamp(fogFactor, 0.0, 1.0);

    // Final color with fog effect applied
    vec3 color = (uAmbientColor + uDiffuseColor * diffuse + uSpecularColor * specular);
    fragColor = vec4(mix(uFogColor, color, fogFactor), 1.0);
}
