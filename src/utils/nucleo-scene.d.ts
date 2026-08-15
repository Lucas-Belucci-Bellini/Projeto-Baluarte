export interface NucleoSceneController {
  pulse(milliseconds?: number): void;
  setHeartRate(beatsPerMinute: number): void;
  destroy(): void;
}

export function mountNucleoScene(container: HTMLElement): Promise<NucleoSceneController>;
