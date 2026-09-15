export interface HxBeaconOptions {
  readonly consent?: boolean;
}

export function hxBeacon(options?: HxBeaconOptions | null): Promise<void>;
