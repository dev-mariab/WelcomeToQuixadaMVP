import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '../theme'
import Icon from './Icon'
import IconButton from './IconButton'

export default function Header({
  title,
  subtitle,
  onBack,
  onNotifications,
  unread = 0,
  titleLines = 1,
  titleStyle,
  subtitleStyle,
}) {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.wrap,
        { backgroundColor: theme.paper, borderBottomColor: theme.line },
      ]}
    >
      {onBack ? (
        <IconButton
          icon="ArrowLeft"
          label="Voltar"
          onPress={onBack}
          background={theme.sand}
        />
      ) : null}
      <View style={styles.copy}>
        {title ? (
          <Text
            style={[styles.title, titleStyle, { color: theme.ink }]}
            numberOfLines={titleLines}
          >
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text
            style={[styles.subtitle, subtitleStyle, { color: theme.muted }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Notificações${unread ? `, ${unread} não lidas` : ''}`}
        onPress={onNotifications}
        activeOpacity={0.8}
        style={[styles.bell, { backgroundColor: theme.sand }]}
      >
        <Icon name="Bell" size={20} color={theme.ink} />
        {unread > 0 ? (
          <View
            style={[
              styles.dot,
              { backgroundColor: theme.orange, borderColor: theme.paper },
            ]}
          />
        ) : null}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 7,
    height: 7,
    right: 9,
    top: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
})
