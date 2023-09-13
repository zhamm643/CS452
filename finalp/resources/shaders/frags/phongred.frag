#version 300 es
precision mediump float;

in vec2 v_textureCoord;
in vec3 v_normal;
in vec3 v_viewDirection;
in vec3 v_lightDirection;

out vec4 outColor;

uniform vec3 uAmbientColor;
uniform vec3 uSpecularColor;
uniform float uShininess;
uniform sampler2D uSampler; // new sampler uniform for texture

void main() {
  vec3 lightColor = vec3(1.0, 1.0, 1.0); // white point light source
  vec3 lightDirection = normalize(v_lightDirection);
  vec3 viewDirection = normalize(v_viewDirection);

  vec3 diffuseColor = texture(uSampler, v_textureCoord).rgb * lightColor * max(dot(v_normal, lightDirection), 0.0); // use texture color instead of material color

  vec3 halfVector = normalize(lightDirection + viewDirection);
  float specular = pow(max(dot(halfVector, v_normal), 0.0), uShininess);
  vec3 specularColor = uSpecularColor * lightColor * specular;
  
  float x = uAmbientColor.x + diffuseColor.x + specularColor.x;
  float y = uAmbientColor.y + diffuseColor.y + specularColor.y;
  float z = uAmbientColor.z + diffuseColor.z + specularColor.z;
  vec3 finalColor = vec3(x, y, z);

  // Linearly modulate the red component according to height (y component of gl_Position)

  vec4 textureColor = texture(uSampler, v_textureCoord);
  outColor = vec4(finalColor * textureColor.rgb, 1.0);
}
