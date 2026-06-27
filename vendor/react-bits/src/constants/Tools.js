import { Palette, Shapes, ImageIcon } from 'lucide-react';

export const TOOLS = [
  {
    id: 'background-studio',
    label: 'Background Studio',
    icon: Palette,
    path: '/tools/background-studio',
    description:
      'Explore animated backgrounds for your projects. Choose from various effects and customize as you like. Export as video, image, or code or share your creations as URLs.'
  },
  {
    id: 'shape-magic',
    label: 'Shape Magic',
    icon: Shapes,
    path: '/tools/shape-magic',
    description:
      'Build smooth merged blob shapes with auto inner-rounded corners, gradients, shadows, outlines and presets. Export as SVG, PNG, JPG, React or CSS clip-path.'
  },
  {
    id: 'texture-lab',
    label: 'Texture Lab',
    icon: ImageIcon,
    path: '/tools/texture-lab',
    description:
      'Apply effects to your images and export the results. Add noise, dithering, halftone, ASCII art, and more. Save your presets for sharing or future use.'
  }
];
