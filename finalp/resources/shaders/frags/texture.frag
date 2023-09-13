#version 300 es
precision mediump float;

in vec2 vTextureCoord;
uniform sampler2D uSampler;

out vec4 fColor;

void main(void) {
    vec4 texColor = texture(uSampler, vTextureCoord);
        fColor = texColor;
}
