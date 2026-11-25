/** Tiny haptic tap on phones that support it. */
export function tap(ms = 10) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* not supported */
  }
}

/**
 * Optional sound effects. Drop short files at public/sfx/paper-swish.mp3 and public/sfx/stamp.mp3
 * (record real paper; it's on theme). Missing files fail silently.
 */
const cache = new Map<string, HTMLAudioElement>();
export function play(name: 'paper-swish' | 'stamp') {
  try {
    let audio = cache.get(name);
    if (!audio) {
      audio = new Audio(`/sfx/${name}.mp3`);
      audio.volume = 0.5;
      cache.set(name, audio);
    }
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch {
    /* ignore */
  }
}
