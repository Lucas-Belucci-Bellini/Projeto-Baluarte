export interface VisionPoint {
  readonly x: number;
  readonly y: number;
  readonly z?: number;
}

export interface VisionKeypoint extends VisionPoint {
  readonly score?: number;
}

export interface VisionPose {
  readonly keypoints: readonly VisionKeypoint[];
}

export interface VisionHandsResults {
  readonly multiHandLandmarks?: readonly (readonly VisionPoint[])[];
}

export interface VisionDetector {
  estimatePoses(video: HTMLVideoElement, options: { flipHorizontal: boolean; maxPoses: number }): Promise<VisionPose[]>;
  dispose(): void;
}

export interface VisionHands {
  setOptions(options: { maxNumHands: number; modelComplexity: number; minDetectionConfidence: number; minTrackingConfidence: number }): void;
  onResults(callback: (results: VisionHandsResults) => void): void;
  initialize(): Promise<void>;
  send(input: { image: HTMLVideoElement }): void;
  close(): void;
}

export interface VisionTf {
  setBackend(name: string): Promise<boolean>;
  ready(): Promise<void>;
  disposeVariables(): void;
}

export interface VisionPoseDetection {
  SupportedModels: { MoveNet: unknown };
  movenet: { modelType: { MULTIPOSE_LIGHTNING: unknown } };
  TrackerType: { BoundingBox: unknown };
  createDetector(model: unknown, options: { modelType: unknown; enableTracking: boolean; trackerType: unknown }): Promise<VisionDetector>;
}

declare global {
  interface Window {
    tf?: VisionTf;
    poseDetection?: VisionPoseDetection;
    Hands?: new (options: { locateFile: (file: string) => string }) => VisionHands;
  }
}

export {};
