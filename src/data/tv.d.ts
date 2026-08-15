export interface TvChannel {
  readonly num: number;
  readonly name: string;
  readonly playlistId: string;
  readonly videoIds?: readonly string[];
}

export interface TvScheduleSlot {
  readonly hour: number;
  readonly channel: TvChannel;
}

export const TV_CHANNELS: readonly TvChannel[];
export const TOTAL_CHANNELS: number;
export function channelForHour(hour: number): TvChannel;
export function dailySchedule(): TvScheduleSlot[];
