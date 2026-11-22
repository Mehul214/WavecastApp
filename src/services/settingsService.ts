import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@wavecast_settings';

export interface AppSettings {
  isDarkMode: boolean;
  skipForwardSeconds: number;
  skipBackwardSeconds: number;
  autoPlayNext: boolean;
  streamOnWifiOnly: boolean;
  audioQuality: 'standard' | 'high';
  defaultPlaybackSpeed: number;
}

export const defaultSettings: AppSettings = {
  isDarkMode: true,
  skipForwardSeconds: 15,
  skipBackwardSeconds: 15,
  autoPlayNext: true,
  streamOnWifiOnly: false,
  audioQuality: 'high',
  defaultPlaybackSpeed: 1.0,
};

let memorySettings: AppSettings = { ...defaultSettings };

export async function getSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      memorySettings = { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch (error) {
    console.warn('Error reading settings from AsyncStorage:', error);
  }
  return memorySettings;
}

export async function saveSettings(
  partial: Partial<AppSettings>
): Promise<AppSettings> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...partial };
    memorySettings = updated;
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('Error saving settings to AsyncStorage:', error);
    return memorySettings;
  }
}
