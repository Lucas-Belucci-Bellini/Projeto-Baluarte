export interface OfflineTrack {
  id: string;
  name: string;
  type: string;
  size: number;
  addedAt: number;
}

export declare function offlineAudioSupported(): boolean;
export declare function addFiles(files: FileList | readonly File[]): Promise<OfflineTrack[]>;
export declare function listTracks(): Promise<OfflineTrack[]>;
export declare function getBlob(id: string): Promise<Blob | null>;
export declare function removeTrack(id: string): Promise<unknown>;
export declare function clearAll(): Promise<unknown>;
export declare function formatSize(bytes: number): string;
