import rainGlsl from './rain.glsl';

function preprocessRainGlsl(src: string): string {
  let s = src.replace(/^\s*#define\s+HAS_HEART\s*$/m, '');
  s = s.replace(
    /float rainAmount = iMouse\.z>0\. \? M\.y : sin\(T\*\.05\)\*\.3+\.7;/,
    'float rainAmount = uUseManualRain>0 ? uManualRain : (iMouse.z>0. ? M.y : sin(T*.05)*.3+.7);',
  );
  s = s.replace(
    /void mainImage\( out vec4 fragColor, in vec2 fragCoord \)/,
    'void mainImage( out vec4 shadertoyOut, in vec2 fragCoord )',
  );
  s = s.replace(/fragColor = vec4\(col, 1\.\);/, 'shadertoyOut = vec4(col, 1.);');
  return s;
}

const rainBody = preprocessRainGlsl(rainGlsl);

export function buildRainWindowFragmentShader(): string {
  return `precision highp float;
precision highp int;

uniform float iTime;
uniform vec3 iResolution;
uniform vec4 iMouse;
uniform sampler2D iChannel0;
uniform int uUseManualRain;
uniform float uManualRain;

out vec4 fragColor;

${rainBody}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  fragColor = color;
}
`;
}

export const rainWindowVertexShader = `precision highp float;

in vec3 position;

void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;
