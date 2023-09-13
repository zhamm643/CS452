#version 300 es
precision mediump float;

in vec2 vTextureCoord;
in vec3 vLightDirection;
in mat3 vTBN;

uniform sampler2D uNormalMap;
uniform vec3 uLightColor;
uniform vec3 uAmbientColor;

out vec4 fColor;

void main(void) {
    vec3 normalFromMap = texture(uNormalMap, vTextureCoord).rgb * 2.0 - 1.0;
    vec3 worldNormal = normalize(vTBN * normalFromMap);
    vec3 norm = normalize(worldNormal);
    float strength = max(dot(norm, -vLightDirection), 0.0);
    vec3 DiffuseColor = uLightColor * strength;

    vec3 finalColor = uAmbientColor + DiffuseColor;

    fColor = vec4(finalColor * worldNormal, 1.0);
}
