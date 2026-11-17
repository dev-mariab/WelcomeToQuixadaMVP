import { StyleSheet, Text, View } from 'react-native'
import { useTheme } from '../theme'
import Icon from './Icon'

export default function Toast({ text }) {
  const theme = useTheme()
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <View style={[styles.toast, { backgroundColor: theme.ink }]}>
        <Icon name="Check" size={17} color={theme.paper} />
        <Text style={[styles.text, { color: theme.paper }]} numberOfLines={2}>
          {text}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 96,
    alignItems: 'center',
    zIndex: 40,
  },
  toast: {
    maxWidth: '100%',
    borderRadius: 13,
    paddingHorizontal: 15,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    flexShrink: 1,
  },
})
