#version 300 es

precision mediump float;

in vec2 TexCoord;
in vec3 FragPos;
in vec3 Normal;
in vec3 LightPos;

uniform vec3 lightColor;

out vec4 FragColor;

void main()
{
    // Set the dark green color
    vec3 objectColor = vec3(1.0, 0.9, 0.0);

    // Phong shading model
    vec3 normal = normalize(Normal);
    vec3 lightDir = normalize(LightPos - FragPos);
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * lightColor;

    // Ambient lighting
    vec3 ambient = 0.1 * objectColor;

    // Final output color
    vec3 result = ambient + diffuse;
    FragColor = vec4(result * objectColor, 1.0);
}
