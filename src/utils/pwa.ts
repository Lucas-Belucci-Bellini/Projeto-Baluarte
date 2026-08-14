interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

export type InstallChangeListener = (available: boolean) => void;

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<InstallChangeListener>();

function notify(): void {
  listeners.forEach((listener) => {
    try {
      listener(canInstall());
    } catch {
      // Um listener não deve impedir os demais de receberem a mudança.
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event: Event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notify();
  });
}

export function canInstall(): boolean {
  return deferredPrompt !== null;
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const standaloneNavigator = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)').matches === true ||
    standaloneNavigator.standalone === true;
}

export function onInstallChange(listener: InstallChangeListener): () => void {
  listeners.add(listener);
  return (): void => {
    listeners.delete(listener);
  };
}

export async function promptInstall(): Promise<boolean> {
  const prompt = deferredPrompt;
  if (!prompt) return false;

  await prompt.prompt();
  let outcome: 'accepted' | 'dismissed' = 'dismissed';
  try {
    outcome = (await prompt.userChoice).outcome;
  } catch {
    // O navegador pode rejeitar a leitura sem invalidar o estado do adapter.
  }
  deferredPrompt = null;
  notify();
  return outcome === 'accepted';
}
