#version 300 es
precision mediump float;

in vec3 v_normal;
in vec3 v_viewDirection;
in vec3 v_lightDirection;

out vec4 outColor;

uniform vec3 uAmbientColor;
uniform vec3 uDiffuseColor;
uniform vec3 uSpecularColor;
uniform float uShininess;

void main() {
  vec3 ambientColor = uAmbientColor;
  vec3 lightColor = vec3(1.0, 1.0, 1.0); // white point light source
  vec3 lightDirection = normalize(v_lightDirection);
  vec3 viewDirection = normalize(v_viewDirection);

  vec3 diffuseColor = uDiffuseColor * lightColor * max(dot(v_normal, lightDirection), 0.0);

  vec3 halfVector = normalize(lightDirection + viewDirection);
  float specular = pow(max(dot(halfVector, v_normal), 0.0), uShininess);
  vec3 specularColor = uSpecularColor * lightColor * specular * step(0.0, dot(v_normal, lightDirection));

  vec3 finalColor = ambientColor + diffuseColor + specularColor;
  outColor = vec4(finalColor, 1.0);
}