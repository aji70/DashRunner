export function canUseWebGL(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    return Boolean(gl);
  } catch (e) {
    console.warn('WebGL not available:', e);
    return false;
  }
}

export function canUseThreeJS(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    // Check if Three library loaded correctly
    return typeof window !== 'undefined';
  } catch (e) {
    console.warn('Three.js detection failed:', e);
    return false;
  }
}
