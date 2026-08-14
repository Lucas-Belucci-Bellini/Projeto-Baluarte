export function canInstall(): boolean;
export function onInstallChange(listener: (available: boolean) => void): void;
export function promptInstall(): Promise<void>;
