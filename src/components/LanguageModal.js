import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { languages, useTranslation } from '../i18n'
import { useTheme } from '../theme'
import AppModal from './AppModal'
import Icon from './Icon'

export default function LanguageModal({ visible, onClose }) {
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const { language, setLanguage, t } = useTranslation()

  return (
    <AppModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.backdrop, { backgroundColor: theme.overlay }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityLabel="Fechar seleção de idioma"
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.paper,
              paddingBottom: Math.max(insets.bottom, 24),
            },
          ]}
        >
          <View style={styles.head}>
            <View style={styles.headCopy}>
              <Text style={[styles.kicker, { color: theme.kicker }]}>LANGUAGE</Text>
              <Text style={[styles.title, { color: theme.ink }]}>{t('language.title')}</Text>
              <Text style={[styles.subtitle, { color: theme.muted }]}>
                {t('language.subtitle')}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onClose}
              style={[styles.close, { backgroundColor: theme.sand }]}
            >
              <Icon name="X" size={18} color={theme.ink} />
            </TouchableOpacity>
          </View>

          {languages.map((item) => {
            const active = item.code === language
            return (
              <TouchableOpacity
                key={item.code}
                activeOpacity={0.85}
                onPress={() => {
                  setLanguage(item.code)
                  onClose()
                }}
                style={[
                  styles.option,
                  {
                    backgroundColor: active ? theme.sand : theme.surface,
                    borderColor: active ? theme.forest : theme.line,
                  },
                ]}
              >
                <View
                  style={[
                    styles.code,
                    { backgroundColor: active ? theme.forest : theme.sand },
                  ]}
                >
                  <Text
                    style={[
                      styles.codeText,
                      { color: active ? theme.lime : theme.forest },
                    ]}
                  >
                    {item.short}
                  </Text>
                </View>
                <Text style={[styles.label, { color: theme.ink }]}>{item.label}</Text>
                {active ? <Icon name="Check" size={18} color={theme.forest} /> : null}
              </TouchableOpacity>
            )
          })}
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
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
    gap: 8,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  headCopy: {
    flex: 1,
  },
  kicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  title: {
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 9,
    lineHeight: 14,
    marginTop: 4,
  },
  close: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
  },
  code: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  label: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
})
