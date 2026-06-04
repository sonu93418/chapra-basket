import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, TextStyles, Radius, Shadows } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        variant === 'primary' && !isDisabled && Shadows.primaryGlow,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`text_${variant}`], styles[`textSize_${size}`], textStyle]}>
            {label}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: Radius.button,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },

  // Variants
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary },
  ghost: { backgroundColor: Colors.primaryContainer },
  danger: { backgroundColor: Colors.error },

  // Sizes
  size_sm: { paddingHorizontal: 16, paddingVertical: 8 },
  size_md: { paddingHorizontal: 24, paddingVertical: 13 },
  size_lg: { paddingHorizontal: 32, paddingVertical: 17 },

  // Text base
  text: { ...TextStyles.bodyLgSemiBold },

  // Text variants
  text_primary: { color: Colors.white },
  text_secondary: { color: Colors.primary },
  text_ghost: { color: Colors.primary },
  text_danger: { color: Colors.white },

  // Text sizes
  textSize_sm: { fontSize: 13 },
  textSize_md: { fontSize: 15 },
  textSize_lg: { fontSize: 17 },
});
