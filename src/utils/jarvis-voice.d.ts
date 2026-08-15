export declare const VOICE_LANGS: readonly string[];
export declare function speak(text: string): void;
export declare function stopSpeaking(): void;
export declare function voiceEnabled(): boolean;
export declare function setVoiceEnabled(enabled: boolean): void;
export declare function voiceLang(): string;
export declare function setVoiceLang(language: string): string | null;
export declare function setElevenKey(key: string): void;
export declare function hasElevenKey(): boolean;
