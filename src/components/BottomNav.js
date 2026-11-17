import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { navItems } from '../data'
import { useTranslation } from '../i18n'
import { useTheme } from '../theme'
import Icon from './Icon'

export default function BottomNav({ tab, onChange, items = navItems }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.paper,
          borderTopColor: theme.line,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}
    >
      {items.map((item) => {
        const active = tab === item.id
        return (
          <TouchableOpacity
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            activeOpacity={0.8}
            onPress={() => onChange(item.id)}
            style={styles.item}
          >
            {active ? (
              <View style={[styles.indicator, { backgroundColor: theme.forest }]} />
            ) : null}
            <Icon
              name={item.icon}
              size={21}
              color={active ? theme.forest : '#8d7b6c'}
              filled={active}
            />
            <Text
              style={[
                styles.label,
                {
                  color: active ? theme.forest : '#8d7b6c',
                  fontWeight: active ? '700' : '600',
                },
              ]}
            >
              {t(`nav.${item.id}`, { defaultValue: item.label })}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    zIndex: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  indicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    borderRadius: 3,
  },
  label: {
    fontSize: 9,
  },
})
