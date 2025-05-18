import { Stack } from 'expo-router';
import { Buffer } from 'buffer';

console.log('[AppLayout] Layout file loaded');

if (typeof global !== 'undefined') {
  if (!global.Buffer) {
    console.log('[AppLayout] Buffer not found — applying polyfill');
    global.Buffer = Buffer;
  } else {
    console.log('[AppLayout] Buffer already defined');
  }
} else {
  console.warn('[AppLayout] global is not defined');
}

export default function Layout() {
  console.log('[AppLayout] Rendering Layout component');

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}