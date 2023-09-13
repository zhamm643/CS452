#version 300 es

layout (location = 0) in vec3 inPosition;
layout (location = 1) in vec2 inTexCoord;
layout (location = 2) in vec3 inNormal;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;

uniform vec3 lightPosition;

out vec2 TexCoord;
out vec3 FragPos;
out vec3 Normal;
out vec3 LightPos;

void main()
{
    gl_Position = projection * view * model * vec4(inPosition, 1.0);
    TexCoord = inTexCoord;
    FragPos = vec3(model * vec4(inPosition, 1.0));
    Normal = mat3(transpose(inverse(model))) * inNormal;
    LightPos = lightPosition;
}
