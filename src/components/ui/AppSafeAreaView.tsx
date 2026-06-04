/**
 * AppSafeAreaView — a typed wrapper around react-native-safe-area-context's SafeAreaView
 * that re-adds the `style` prop which was removed from the TS types in v5.
 */
import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import {
  SafeAreaView,
  SafeAreaViewProps,
} from 'react-native-safe-area-context';

interface AppSafeAreaViewProps extends Omit<SafeAreaViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const AppSafeAreaView: React.FC<AppSafeAreaViewProps> = ({
  style,
  children,
  ...props
}) => {
  // @ts-ignore — safe-area-context v5 types removed style, but the prop works at runtime
  return (
    <SafeAreaView style={style} {...props}>
      {children}
    </SafeAreaView>
  );
};
