export type InstallChangeListener = (available: boolean) => void;

export function canInstall(): boolean;
export function isStandalone(): boolean;
export function onInstallChange(listener: InstallChangeListener): () => void;
export function promptInstall(): Promise<boolean>;
