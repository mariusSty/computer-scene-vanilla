uniform vec3 uColor;

void main() {
  float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
  float strength = 0.2 / distanceToCenter - 0.2 * 2.0;
  gl_FragColor = vec4(uColor, strength);
}