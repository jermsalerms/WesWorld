/**
 * Graphics quality presets and auto-tuning system
 */

export type GraphicsQuality = 'auto' | 'ultra' | 'high' | 'medium' | 'low' | 'minimal';

export interface GraphicsSettings {
  quality: GraphicsQuality;
  shadows: boolean;
  shadowMapSize: number;
  fog: boolean;
  lightCount: 'full' | 'reduced' | 'minimal';
  geometryDetail: 'high' | 'medium' | 'low';
  maxPlayers: number;
  pixelRatio: number;
  antialias: boolean;
  physicsRate: number; // Hz
}

const PRESETS: Record<Exclude<GraphicsQuality, 'auto'>, GraphicsSettings> = {
  ultra: {
    quality: 'ultra',
    shadows: true,
    shadowMapSize: 2048,
    fog: true,
    lightCount: 'full',
    geometryDetail: 'high',
    maxPlayers: 50,
    pixelRatio: window.devicePixelRatio,
    antialias: true,
    physicsRate: 60,
  },
  high: {
    quality: 'high',
    shadows: true,
    shadowMapSize: 1024,
    fog: true,
    lightCount: 'full',
    geometryDetail: 'high',
    maxPlayers: 30,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    antialias: true,
    physicsRate: 60,
  },
  medium: {
    quality: 'medium',
    shadows: true,
    shadowMapSize: 512,
    fog: true,
    lightCount: 'reduced',
    geometryDetail: 'medium',
    maxPlayers: 20,
    pixelRatio: 1.5,
    antialias: false,
    physicsRate: 30,
  },
  low: {
    quality: 'low',
    shadows: false,
    shadowMapSize: 256,
    fog: false,
    lightCount: 'minimal',
    geometryDetail: 'low',
    maxPlayers: 10,
    pixelRatio: 1,
    antialias: false,
    physicsRate: 30,
  },
  minimal: {
    quality: 'minimal',
    shadows: false,
    shadowMapSize: 256,
    fog: false,
    lightCount: 'minimal',
    geometryDetail: 'low',
    maxPlayers: 5,
    pixelRatio: 1,
    antialias: false,
    physicsRate: 20,
  },
};

export class GraphicsManager {
  private static STORAGE_KEY = 'wesworld-graphics-settings';
  private static currentSettings: GraphicsSettings;
  private static attemptedQualities: GraphicsQuality[] = [];
  private static onSettingsChange?: (settings: GraphicsSettings) => void;

  static initialize(onChange?: (settings: GraphicsSettings) => void): GraphicsSettings {
    this.onSettingsChange = onChange;

    // Try to load saved preference
    const saved = this.loadSavedSettings();
    if (saved && saved.quality !== 'auto') {
      console.log('[Graphics] Using saved quality:', saved.quality);
      this.currentSettings = saved;
      return saved;
    }

    // Auto-detect appropriate quality level
    const detectedQuality = this.detectOptimalQuality();
    console.log('[Graphics] Auto-detected quality:', detectedQuality);
    this.currentSettings = PRESETS[detectedQuality];
    return this.currentSettings;
  }

  static detectOptimalQuality(): Exclude<GraphicsQuality, 'auto'> {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const memory = (performance as any).memory?.jsHeapSizeLimit || 0;
    const cores = navigator.hardwareConcurrency || 2;

    // iPhone 15 Pro Max and similar high-end devices
    if (isIOS && cores >= 6 && memory > 4000000000) {
      return 'high'; // Start with high, can upgrade to ultra if it works
    }

    // Other modern mobile devices
    if (isMobile && cores >= 4) {
      return 'medium';
    }

    // Older mobile devices
    if (isMobile) {
      return 'low';
    }

    // Desktop with good specs
    if (cores >= 8 && memory > 8000000000) {
      return 'ultra';
    }

    // Average desktop
    if (cores >= 4) {
      return 'high';
    }

    // Lower-end systems
    return 'medium';
  }

  static getSettings(): GraphicsSettings {
    return this.currentSettings || this.initialize();
  }

  static setQuality(quality: GraphicsQuality): GraphicsSettings {
    if (quality === 'auto') {
      const detected = this.detectOptimalQuality();
      this.currentSettings = PRESETS[detected];
    } else {
      this.currentSettings = PRESETS[quality];
    }

    this.saveSettings();
    this.onSettingsChange?.(this.currentSettings);
    return this.currentSettings;
  }

  static handleLoadError(error: Error): GraphicsSettings | null {
    const currentQuality = this.currentSettings.quality;
    this.attemptedQualities.push(currentQuality);

    console.warn(`[Graphics] Failed at ${currentQuality} quality:`, error.message);

    // Try downgrading
    const downgradePath: Array<Exclude<GraphicsQuality, 'auto'>> = [
      'ultra',
      'high',
      'medium',
      'low',
      'minimal',
    ];

    const currentIndex = downgradePath.indexOf(currentQuality as any);
    if (currentIndex < downgradePath.length - 1) {
      const nextQuality = downgradePath[currentIndex + 1];
      if (!this.attemptedQualities.includes(nextQuality)) {
        console.log(`[Graphics] Downgrading to ${nextQuality}...`);
        return this.setQuality(nextQuality);
      }
    }

    console.error('[Graphics] All quality levels failed');
    return null;
  }

  static upgradeIfPossible(): GraphicsSettings | null {
    const currentQuality = this.currentSettings.quality;
    const upgradePath: Array<Exclude<GraphicsQuality, 'auto'>> = [
      'minimal',
      'low',
      'medium',
      'high',
      'ultra',
    ];

    const currentIndex = upgradePath.indexOf(currentQuality as any);
    if (currentIndex < upgradePath.length - 1) {
      const nextQuality = upgradePath[currentIndex + 1];
      console.log(`[Graphics] Attempting upgrade to ${nextQuality}...`);
      return this.setQuality(nextQuality);
    }

    return null;
  }

  private static saveSettings(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify({
          quality: this.currentSettings.quality,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.warn('[Graphics] Failed to save settings:', err);
    }
  }

  private static loadSavedSettings(): GraphicsSettings | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const { quality } = JSON.parse(saved);
        if (quality in PRESETS) {
          return PRESETS[quality as Exclude<GraphicsQuality, 'auto'>];
        }
      }
    } catch (err) {
      console.warn('[Graphics] Failed to load settings:', err);
    }
    return null;
  }

  static resetAttempts(): void {
    this.attemptedQualities = [];
  }
}
