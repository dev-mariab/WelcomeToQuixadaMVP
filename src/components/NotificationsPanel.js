import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { notifications } from '../data'
import { useTheme } from '../theme'
import AppModal from './AppModal'
import Icon from './Icon'
import IconButton from './IconButton'

const typeStyles = {
  event: { icon: 'CalendarDays', bg: 'softOrange', fg: 'onOrange' },
  weather: { icon: 'Wind', bg: 'softBlue', fg: 'onBlue' },
  trail: { icon: 'Mountain', bg: 'softGreen', fg: 'onGreen' },
}

export default function NotificationsPanel({
  visible,
  items = notifications,
  city,
  read,
  onRead,
  onReadAll,
  onClose,
}) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const unread = items.filter((item) => !read.includes(item.id)).length

  return (
    <AppModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Fechar notificações"
        />
        <View
          style={[
            styles.panel,
            {
              backgroundColor: theme.paper,
              paddingBottom: Math.max(insets.bottom, 25),
            },
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.heading}>
              <View style={styles.headingCopy}>
                <Text style={[styles.kicker, { color: theme.kicker }]}>CENTRAL DE AVISOS</Text>
                <Text style={[styles.title, { color: theme.ink }]}>Notificações</Text>
                <Text style={[styles.subtitle, { color: theme.muted }]}>
                  {unread
                    ? `${unread} ${unread === 1 ? 'nova mensagem' : 'novas mensagens'}`
                    : 'Você está em dia'}
                </Text>
              </View>
              <IconButton
                icon="X"
                label="Fechar notificações"
                onPress={onClose}
                background={theme.sand}
              />
            </View>

            {unread > 0 ? (
              <TouchableOpacity
                onPress={onReadAll}
                activeOpacity={0.7}
                style={styles.readAll}
              >
                <Icon name="Check" size={15} color={theme.forest} />
                <Text style={[styles.readAllText, { color: theme.forest }]}>
                  Marcar todas como lidas
                </Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.list}>
              {items.length === 0 ? (
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.line,
                      flexDirection: 'column',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <Icon name="Bell" size={22} color={theme.muted} />
                  <Text style={[styles.cardText, { color: theme.muted, textAlign: 'center' }]}>
                    Nenhuma notificação para {city} no momento.
                  </Text>
                </View>
              ) : null}
              {items.map((item) => {
                const isRead = read.includes(item.id)
                const config = typeStyles[item.type] ?? typeStyles.event
                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    onPress={() => onRead(item.id)}
                    style={[
                      styles.card,
                      {
                        backgroundColor: isRead ? theme.surface : theme.paper,
                        borderColor: theme.line,
                        opacity: isRead ? 0.72 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: theme[config.bg] },
                      ]}
                    >
                      <Icon name={config.icon} size={18} color={theme[config.fg]} />
                    </View>
                    <View style={styles.copy}>
                      <Text style={[styles.state, { color: theme.kicker }]}>
                        {isRead ? 'LIDA' : 'NOVA'} · {item.time}
                      </Text>
                      <Text style={[styles.cardTitle, { color: theme.ink }]}>{item.title}</Text>
                      <Text style={[styles.cardText, { color: theme.muted }]}>{item.text}</Text>
                    </View>
                    {!isRead ? (
                      <View style={[styles.unreadDot, { backgroundColor: theme.orange }]} />
                    ) : null}
                  </TouchableOpacity>
                )
              })}
            </View>

            <View style={[styles.footer, { backgroundColor: theme.sand }]}>
              <Icon name="Bell" size={18} color={theme.forest} />
              <View style={styles.footerCopy}>
                <Text style={[styles.footerTitle, { color: theme.ink }]}>
                  Alertas locais ativados
                </Text>
                <Text style={[styles.footerText, { color: theme.muted }]}>
                  Eventos, clima e segurança em trilhas
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </AppModal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  panel: {
    maxHeight: '88%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headingCopy: {
    flex: 1,
  },
  kicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 23,
    fontWeight: '800',
    marginVertical: 3,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 10,
  },
  readAll: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    marginTop: 18,
    marginBottom: 10,
  },
  readAllText: {
    fontSize: 10,
    fontWeight: '700',
  },
  list: {
    gap: 9,
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  iconBox: {
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  state: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 3,
    marginBottom: 4,
  },
  cardText: {
    fontSize: 9,
    lineHeight: 13,
  },
  unreadDot: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 4,
    right: 11,
    top: 11,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
  },
  footerCopy: {
    flex: 1,
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: '800',
  },
  footerText: {
    fontSize: 8,
    marginTop: 2,
  },
})
