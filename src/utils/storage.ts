import AsyncStorageInstance from '@react-native-async-storage/async-storage';
import { User } from '../types';

export interface AuthSession {
  user: User;
  token: string;
}

// In-memory fallback in case AsyncStorage fails or is unavailable (e.g. Web environment/hydration)
const memoryStorage = new Map<string, string>();

/**
 * Helper to wait for a given duration (used in retry backoff)
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Perform a storage operation with retry logic (exponential backoff)
 */
async function retryOperation<T>(
  operationName: string,
  op: () => Promise<T>,
  retries = 3,
  delay = 100
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await op();
    } catch (error) {
      attempt++;
      console.warn(
        `[Storage] Attempt ${attempt} failed for operation "${operationName}":`,
        error
      );
      if (attempt >= retries) {
        throw error;
      }
      // Exponential backoff
      await sleep(delay * Math.pow(2, attempt));
    }
  }
}

/**
 * Safely set a value in AsyncStorage, falling back to in-memory storage if it fails.
 */
export async function setItem(key: string, value: string): Promise<boolean> {
  try {
    await retryOperation(`setItem:${key}`, () =>
      AsyncStorageInstance.setItem(key, value)
    );
    // Sync with memory storage as backup
    memoryStorage.set(key, value);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to save key "${key}" to AsyncStorage. Falling back to in-memory storage.`, error);
    memoryStorage.set(key, value);
    return false;
  }
}

/**
 * Safely retrieve a value from AsyncStorage, falling back to in-memory if needed.
 */
export async function getItem(key: string): Promise<string | null> {
  try {
    const value = await retryOperation(`getItem:${key}`, () =>
      AsyncStorageInstance.getItem(key)
    );
    if (value !== null) {
      // Sync memory storage with retrieved value
      memoryStorage.set(key, value);
      return value;
    }
  } catch (error) {
    console.error(`[Storage] Failed to load key "${key}" from AsyncStorage. Attempting in-memory retrieval.`, error);
  }
  // Return memory storage fallback if AsyncStorage failed or returned null
  return memoryStorage.get(key) || null;
}

/**
 * Safely remove a value from AsyncStorage.
 */
export async function removeItem(key: string): Promise<boolean> {
  try {
    await retryOperation(`removeItem:${key}`, () =>
      AsyncStorageInstance.removeItem(key)
    );
    memoryStorage.delete(key);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to remove key "${key}" from AsyncStorage.`, error);
    memoryStorage.delete(key);
    return false;
  }
}

// ─── Typed Session Specific Helpers ────────────────────────────────────────

const SESSION_KEY = 'blinkbox_auth';

/**
 * Save user authentication session
 */
export async function saveSession(session: AuthSession): Promise<boolean> {
  try {
    const serialized = JSON.stringify(session);
    return await setItem(SESSION_KEY, serialized);
  } catch (error) {
    console.error('[Storage] Serializing session failed:', error);
    return false;
  }
}

/**
 * Load user authentication session
 */
export async function loadSession(): Promise<AuthSession | null> {
  try {
    const serialized = await getItem(SESSION_KEY);
    if (!serialized) {
      return null;
    }
    const session: AuthSession = JSON.parse(serialized);
    if (session && session.user && session.token) {
      return session;
    }
    console.warn('[Storage] Loaded session was invalid or incomplete.');
    return null;
  } catch (error) {
    console.error('[Storage] Parsing session failed:', error);
    return null;
  }
}

/**
 * Clear user authentication session
 */
export async function clearSession(): Promise<boolean> {
  return await removeItem(SESSION_KEY);
}
