#version 300 es
precision mediump float;

in vec3 vFragPos;
in vec3 vTangentLightPos;
in vec3 vTangentViewPos;
in vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uNormalSampler;

out vec4 fColor;

void main() {
    // Obtain normal from normal map in range [0, 1]
    vec3 normal = texture(uNormalSampler, vTextureCoord).rgb;

    // Transform normal vector to range [-1, 1]
    normal = normalize(normal * 2.0 - 1.0);

    // Calculate the lighting
    vec3 lightDir = normalize(vTangentLightPos - vFragPos);
    float diff = max(dot(lightDir, normal), 0.0);

    // Calculate the specular component
    vec3 viewDir = normalize(vTangentViewPos - vFragPos);
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfwayDir), 0.0), 32.0);

    // Calculate the ambient, diffuse and specular components
    vec3 ambient = vec3(0.1);
    vec3 diffuse = diff * vec3(1.0);
    vec3 specular = spec * vec3(1.0);

    vec3 color = texture(uSampler, vTextureCoord).rgb;
    fColor = vec4((ambient + diffuse) * color + specular, 1.0);
}
