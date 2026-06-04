/**
 * Global type augmentations for third-party libraries.
 *
 * IMPORTANT: The `import {}` lines below are required to make these
 * "module augmentations" (extending existing types) rather than
 * "ambient module declarations" (which would erase all existing exports).
 */

// Augment react-native-safe-area-context to re-add the `style` prop
// which was removed from NativeSafeAreaViewProps in v5.x types.
import {} from 'react-native-safe-area-context';
declare module 'react-native-safe-area-context' {
  interface NativeSafeAreaViewProps {
    style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
    children?: import('react').ReactNode;
  }
}

// Augment react-native-gesture-handler to re-add the `style` prop
// which was removed from GestureHandlerRootViewProps in newer types.
import {} from 'react-native-gesture-handler';
declare module 'react-native-gesture-handler' {
  interface GestureHandlerRootViewProps {
    style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
    children?: import('react').ReactNode;
  }
}

export {};
