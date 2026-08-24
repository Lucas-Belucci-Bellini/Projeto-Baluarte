declare module 'three' {
  export interface Vector3 { set(x: number, y: number, z: number): this }
  export class Color { constructor(value?: number | string) }
  export class Texture { readonly isTexture: boolean; dispose(): void }
  export class Object3D {
    name: string;
    position: Vector3;
    traverse(callback: (object: Object3D) => void): this;
    clear(): this;
    add(...objects: Object3D[]): this;
  }
  export class Scene extends Object3D { background: Color | null }
  export class PerspectiveCamera extends Object3D {
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    aspect: number;
    lookAt(x: number, y: number, z: number): this;
    updateProjectionMatrix(): void;
  }
  export interface WebGLRendererParameters { canvas?: HTMLCanvasElement; antialias?: boolean; alpha?: boolean }
  export class WebGLRenderer {
    constructor(parameters?: WebGLRendererParameters);
    outputColorSpace: string;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setPixelRatio(value: number): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }
  export class Clock { getDelta(): number; getElapsedTime(): number }
  export class Light extends Object3D { constructor(color?: number | string, intensity?: number) }
  export class DirectionalLight extends Light { constructor(color?: number | string, intensity?: number) }
  export class AmbientLight extends Light { constructor(color?: number | string, intensity?: number) }
  export class IcosahedronGeometry { constructor(radius?: number, detail?: number); dispose(): void }
  export interface Material { dispose(): void }
  export class MeshStandardMaterial implements Material { constructor(parameters?: Record<string, unknown>); dispose(): void }
  export class Mesh extends Object3D {
    constructor(geometry: IcosahedronGeometry, material: Material | Material[]);
    geometry: IcosahedronGeometry;
    material: Material | Material[];
    rotation: { x: number; y: number; z: number };
  }
  export const SRGBColorSpace: string;
}
