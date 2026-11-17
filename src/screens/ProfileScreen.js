import { useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { languages, useTranslation } from '../i18n'
import { useTheme } from '../theme'
import { imageSource } from '../utils'
import Header from '../components/Header'
import Icon from '../components/Icon'
import LanguageModal from '../components/LanguageModal'

export default function ProfileScreen({
  name,
  role,
  city,
  dark,
  onToggleDark,
  savedPlaces,
  onOpenPlace,
  onToggleSave,
  onOpenOfflineMap,
  onLogout,
  onAdmin,
  onToast,
  onOpenPhotos,
  onOpenRecords,
  photosCount = 0,
  recordsCount = 0,
  onNotifications,
  unread,
  onBack,
  trailsCount = 0,
  eventsCount = 0,
}) {
  const theme = useTheme()
  const { t, language } = useTranslation()
  const [languageOpen, setLanguageOpen] = useState(false)
  const initials = (name || 'Visitante')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  const isAdmin = role === 'admin'

  return (
    <View style={{ flex: 1 }}>
      <Header
        title={t('profile.title')}
        subtitle={t('profile.subtitle')}
        onBack={onBack}
        onNotifications={onNotifications}
        unread={unread}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View
          style={[
            styles.identity,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.forest }]}>
            <Text style={[styles.initials, { color: theme.lime }]}>{initials}</Text>
          </View>
          <View style={styles.identityCopy}>
            <Text style={[styles.name, { color: theme.ink }]}>{name || 'Visitante'}</Text>
            <View style={[styles.badge, { backgroundColor: theme.sand }]}>
              <Icon
                name={isAdmin ? 'ShieldCheck' : 'UserRound'}
                size={12}
                color={theme.forest}
              />
              <Text style={[styles.badgeText, { color: theme.forest }]}>
                {isAdmin ? 'Administrador' : 'Visitante'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: theme.sand }]}>
            <Text style={[styles.statValue, { color: theme.ink }]}>{savedPlaces.length}</Text>
            <Text style={[styles.statLabel, { color: theme.muted }]}>
              {t('profile.favorites')}
            </Text>
          </View>
          <View style={[styles.stat, { backgroundColor: theme.sand }]}>
            <Text style={[styles.statValue, { color: theme.ink }]}>{trailsCount}</Text>
            <Text style={[styles.statLabel, { color: theme.muted }]}>
              {t('profile.trails')}
            </Text>
          </View>
          <View style={[styles.stat, { backgroundColor: theme.sand }]}>
            <Text style={[styles.statValue, { color: theme.ink }]}>{eventsCount}</Text>
            <Text style={[styles.statLabel, { color: theme.muted }]}>
              {t('profile.events')}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: theme.kicker }]}>
          {t('profile.journey')}
        </Text>

        {savedPlaces.length ? (
          <View style={styles.savedList}>
            {savedPlaces.map((place) => (
              <TouchableOpacity
                key={place.id}
                activeOpacity={0.85}
                onPress={() => onOpenPlace(place)}
                style={[
                  styles.savedItem,
                  { backgroundColor: theme.surface, borderColor: theme.line },
                ]}
              >
                <Image
                  source={imageSource(place.image)}
                  style={styles.savedImage}
                  resizeMode="cover"
                />
                <View style={styles.savedCopy}>
                  <Text style={[styles.savedName, { color: theme.ink }]} numberOfLines={1}>
                    {place.name}
                  </Text>
                  <Text style={[styles.savedMeta, { color: theme.muted }]} numberOfLines={1}>
                    {place.category} · {place.city}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onToggleSave(place)}
                  style={[styles.savedAction, { backgroundColor: theme.sand }]}
                  accessibilityLabel="Remover dos favoritos"
                >
                  <Icon name="Heart" size={16} color={theme.heart} filled />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: theme.sand }]}>
            <Icon name="Heart" size={22} color={theme.forest} />
            <Text style={[styles.emptyText, { color: theme.muted }]}>
              Toque no coração de um atrativo para salvar aqui.
            </Text>
          </View>
        )}

        <Text style={[styles.sectionLabel, { color: theme.kicker }]}>
          {t('profile.later')}
        </Text>

        <View
          style={[
            styles.preferences,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenPhotos}
            style={[styles.row, { borderBottomColor: theme.line }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
              <Icon name="Camera" size={17} color={theme.forest} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: theme.ink }]}>
                {t('profile.myPhotos')}
              </Text>
              <Text style={[styles.rowText, { color: theme.muted }]}>
                {photosCount
                  ? `${photosCount} ${photosCount === 1 ? 'foto salva' : 'fotos salvas'}`
                  : 'Registros da sua viagem'}
              </Text>
            </View>
            <Icon name="ChevronRight" size={18} color={theme.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenRecords}
            style={[styles.row, { borderBottomColor: theme.line }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
              <Icon name="Bookmark" size={17} color={theme.forest} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: theme.ink }]}>
                {t('profile.records')}
              </Text>
              <Text style={[styles.rowText, { color: theme.muted }]}>
                {recordsCount
                  ? `${recordsCount} ${
                      recordsCount === 1 ? 'registro na jornada' : 'registros na jornada'
                    }`
                  : 'Lugares e experiências salvas'}
              </Text>
            </View>
            <Icon name="ChevronRight" size={18} color={theme.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onOpenOfflineMap}
            style={styles.row}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
              <Icon name="Map" size={17} color={theme.forest} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: theme.ink }]}>
                {t('profile.offline')}
              </Text>
              <Text style={[styles.rowText, { color: theme.muted }]}>
                Mapas salvos para usar sem conexão
              </Text>
            </View>
            <Icon name="ChevronRight" size={18} color={theme.muted} />
          </TouchableOpacity>
        </View>

        {isAdmin ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onAdmin}
            style={[styles.admin, { backgroundColor: theme.forest }]}
          >
            <View style={[styles.adminIcon, { backgroundColor: 'rgba(255,255,255,0.12)' }]}>
              <Icon name="LayoutDashboard" size={20} color={theme.lime} />
            </View>
            <View style={styles.adminCopy}>
              <Text style={[styles.adminTitle, { color: '#ffffff' }]}>
                {t('profile.admin')}
              </Text>
              <Text style={styles.adminText}>{t('profile.adminText')}</Text>
            </View>
            <Icon name="ChevronRight" size={19} color={theme.lime} />
          </TouchableOpacity>
        ) : null}

        <Text style={[styles.sectionLabel, { color: theme.kicker }]}>
          {t('profile.preferences')}
        </Text>

        <View
          style={[
            styles.preferences,
            { backgroundColor: theme.surface, borderColor: theme.line },
          ]}
        >
          <View style={[styles.row, { borderBottomColor: theme.line }]}>
            <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
              <Icon name={dark ? 'Moon' : 'Sun'} size={17} color={theme.forest} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: theme.ink }]}>
                {t('profile.dark')}
              </Text>
              <Text style={[styles.rowText, { color: theme.muted }]}>
                {dark ? t('profile.active') : t('profile.disabled')}
              </Text>
            </View>
            <Switch
              value={dark}
              onValueChange={onToggleDark}
              trackColor={{ false: theme.line, true: theme.forest }}
              thumbColor={dark ? theme.lime : theme.surface}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setLanguageOpen(true)}
            style={[styles.row, { borderBottomColor: theme.line }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
              <Icon name="Languages" size={17} color={theme.forest} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: theme.ink }]}>
                {t('profile.language')}
              </Text>
              <Text style={[styles.rowText, { color: theme.muted }]}>
                {languages.find((item) => item.code === language)?.label ?? 'Português (Brasil)'}
              </Text>
            </View>
            <Icon name="ChevronRight" size={18} color={theme.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onNotifications}
            style={[styles.row, { borderBottomColor: theme.line }]}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
              <Icon name="Bell" size={17} color={theme.forest} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: theme.ink }]}>
                {t('profile.notifications')}
              </Text>
              <Text style={[styles.rowText, { color: theme.muted }]}>
                {t('profile.notificationsText')}
              </Text>
            </View>
            <Icon name="ChevronRight" size={18} color={theme.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => onToast('Obrigado por usar o aplicativo! Versão 1.0.0')}
            style={styles.row}
          >
            <View style={[styles.rowIcon, { backgroundColor: theme.sand }]}>
              <Icon name="Sparkles" size={17} color={theme.forest} />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: theme.ink }]}>
                {t('profile.about')}
              </Text>
              <Text style={[styles.rowText, { color: theme.muted }]}>
                {t('profile.version', { city })}
              </Text>
            </View>
            <Icon name="ChevronRight" size={18} color={theme.muted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onLogout}
          style={[styles.logout, { borderColor: theme.line }]}
        >
          <Icon name="LogOut" size={17} color={theme.heart} />
          <Text style={[styles.logoutText, { color: theme.heart }]}>
            {t('profile.logout')}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: theme.muted }]}>
          Sertão Central · CE
        </Text>
      </ScrollView>

      <LanguageModal
        visible={languageOpen}
        onClose={() => setLanguageOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 104,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  identityCopy: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '800',
  },
  stats: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 22,
    marginBottom: 10,
  },
  savedList: {
    gap: 9,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
  savedImage: {
    width: 48,
    height: 48,
    borderRadius: 11,
  },
  savedCopy: {
    flex: 1,
    minWidth: 0,
  },
  savedName: {
    fontSize: 12,
    fontWeight: '800',
  },
  savedMeta: {
    fontSize: 8,
    marginTop: 3,
  },
  savedAction: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
  },
  emptyText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 14,
  },
  admin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 16,
    padding: 13,
    marginTop: 14,
  },
  adminIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminCopy: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  adminText: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 8,
    marginTop: 2,
  },
  preferences: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  rowText: {
    fontSize: 8,
    marginTop: 2,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    marginTop: 18,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '800',
  },
  footer: {
    fontSize: 8,
    textAlign: 'center',
    marginTop: 18,
  },
})
