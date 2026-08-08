// Web-only stub. expo-tracking-transparency's own JS unconditionally calls
// requireNativeModule('ExpoTrackingTransparency') at import time (no web
// target exists for it), which throws before the bundle can even mount —
// even though every actual function in the package already treats non-iOS
// platforms as "permission granted" and never needs the native module. See
// metro.config.js's resolveRequest override (platform === 'web' only).
const grantedResponse = {
  granted: true,
  expires: 'never',
  canAskAgain: true,
  status: 'granted',
};

export const PermissionStatus = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
};

export function getAdvertisingId() {
  return null;
}

export async function requestTrackingPermissionsAsync() {
  return grantedResponse;
}

export async function getTrackingPermissionsAsync() {
  return grantedResponse;
}

export function useTrackingPermissions() {
  return [grantedResponse, requestTrackingPermissionsAsync];
}

export function isAvailable() {
  return false;
}
