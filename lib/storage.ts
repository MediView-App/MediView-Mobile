import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * 토큰 보관소. 네이티브는 SecureStore(암호화 저장), 웹은 localStorage 로 폴백.
 */
const web = Platform.OS === "web";

export async function setItem(key: string, value: string): Promise<void> {
  if (web) {
    try {
      window.localStorage.setItem(key, value);
    } catch {}
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getItem(key: string): Promise<string | null> {
  if (web) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key);
}

export async function deleteItem(key: string): Promise<void> {
  if (web) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export const KEYS = {
  accessToken: "mv.accessToken",
  refreshToken: "mv.refreshToken",
} as const;
