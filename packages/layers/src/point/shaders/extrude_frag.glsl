varying vec4 v_color;
uniform float u_opacity: 1.0;
void main() {
  gl_FragColor = v_color;
  gl_FragColor.a *= u_opacity;
}