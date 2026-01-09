import { OptimizedResult } from '../types';

const STORAGE_PREFIX = 'pf_';
const PROFILES_KEY = `${STORAGE_PREFIX}profiles`;
const CURRENT_PROFILE_KEY = `${STORAGE_PREFIX}current_profile`;

export const storage = {
  getProfiles: (): string[] => {
    try {
      const stored = localStorage.getItem(PROFILES_KEY);
      return stored ? JSON.parse(stored) : ['Default'];
    } catch {
      return ['Default'];
    }
  },

  getCurrentProfile: (): string => {
    return localStorage.getItem(CURRENT_PROFILE_KEY) || 'Default';
  },

  setCurrentProfile: (name: string) => {
    localStorage.setItem(CURRENT_PROFILE_KEY, name);
  },

  addProfile: (name: string) => {
    const profiles = storage.getProfiles();
    if (!profiles.includes(name)) {
      profiles.push(name);
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
    storage.setCurrentProfile(name);
  },

  getHistory: (profileName: string): OptimizedResult[] => {
    try {
      const key = `${STORAGE_PREFIX}history_${profileName}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveHistoryItem: (profileName: string, item: OptimizedResult) => {
    const history = storage.getHistory(profileName);
    const newHistory = [item, ...history].slice(0, 50); // Keep last 50
    localStorage.setItem(`${STORAGE_PREFIX}history_${profileName}`, JSON.stringify(newHistory));
    return newHistory;
  },
  
  clearHistory: (profileName: string) => {
      localStorage.removeItem(`${STORAGE_PREFIX}history_${profileName}`);
      return [];
  }
};