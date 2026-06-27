import code from '@content/Animations/Strands/Strands.jsx?raw';
import css from '@content/Animations/Strands/Strands.css?raw';
import tailwind from '@tailwind/Animations/Strands/Strands.jsx?raw';
import tsCode from '@ts-default/Animations/Strands/Strands.tsx?raw';
import tsTailwind from '@ts-tailwind/Animations/Strands/Strands.tsx?raw';

export const strands = {
  dependencies: `ogl`,
  usage: `import Strands from './Strands';

<div style={{ width: '100%', height: '600px', position: 'relative' }}>
  <Strands
    colors={["#FF4242", "#7C3AED", "#06B6D4", "#EAB308"]}
    count={3}
    speed={0.5}
    amplitude={1}
    waviness={1}
    thickness={0.7}
    glow={2.6}
    taper={3}
    spread={1}
    intensity={0.6}
    saturation={1.5}
    opacity={1}
    scale={1.5}
    glass={false}
    refraction={1}
    dispersion={1}
    glassSize={1}
  />
</div>`,
  code,
  css,
  tailwind,
  tsCode,
  tsTailwind
};
