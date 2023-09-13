#version 300 es

precision mediump float;

in vec2 vTextureCoord;
in vec3 vLightDirection;
in vec3 vViewDirection;
in vec3 vNormal;

uniform sampler2D uSampler;
uniform samplerCube uCubeMap;

uniform vec3 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

out vec4 fColor;

void main(void) {
    vec4 textureColor = texture(uSampler, vTextureCoord);
    // remove opacity < 0.1
    if (textureColor.a < 0.1) {
        discard;
    }

    vec3 normal = normalize(vNormal);

    vec3 halfVector = normalize(vLightDirection + vViewDirection);
    float specularAngle = pow(max(dot(halfVector, normal), 0.0), uShininess);
    vec3 diffuseReflection = uAmbientColor + textureColor.rgb * max(dot(vLightDirection, normal), 0.0);
    vec3 specularReflection = uSpecularColor * specularAngle;
    vec3 lighting = diffuseReflection + specularReflection;

    // environment mapping
    vec3 reflected = reflect(normalize(-vViewDirection), normal);
    vec3 envColor = texture(uCubeMap, reflected).rgb;

    // output final color
    fColor = vec4(textureColor.rgb * lighting + envColor, textureColor.a);
}
