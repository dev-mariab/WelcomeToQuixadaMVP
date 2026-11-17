import { LinearGradient } from 'expo-linear-gradient'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import { useTheme } from '../theme'
import Icon from './Icon'

export default function PrimaryButton({ label, onPress, icon, style, disabled = false }) {
  const theme = useTheme()
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[styles.wrap, { borderColor: theme.forestDark }, style]}
    >
      <LinearGradient
        colors={[theme.forest, theme.forestDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, disabled ? styles.disabled : null]}
      >
        {icon ? <Icon name={icon} size={17} color={theme.lime} /> : null}
        <Text style={[styles.label, { color: theme.lime }]}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  gradient: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
})
