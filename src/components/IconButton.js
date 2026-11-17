import { StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '../theme'
import Icon from './Icon'

export default function IconButton({
  icon,
  label,
  onPress,
  size = 21,
  color,
  background,
  style,
  filled = false,
  activeOpacity = 0.8,
}) {
  const theme = useTheme()
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      activeOpacity={activeOpacity}
      style={[styles.base, { backgroundColor: background ?? theme.surface }, style]}
    >
      <Icon name={icon} size={size} color={color ?? theme.ink} filled={filled} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
