import { useState } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useTheme } from '../theme'
import { useTranslation } from '../i18n'
import AppModal from './AppModal'
import Icon from './Icon'

export default function CityPicker({ cities = [], city, onChangeCity }) {
  const theme = useTheme()
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Text style={[styles.filterLabel, { color: theme.muted }]}>
        {t('explore.city')}
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setOpen(true)}
        style={[
          styles.citySelector,
          { backgroundColor: theme.surface, borderColor: theme.line },
        ]}
      >
        <View style={[styles.citySelectorIcon, { backgroundColor: theme.sand }]}>
          <Icon name="MapPin" size={19} color={theme.forest} />
        </View>
        <View style={styles.citySelectorCopy}>
          <Text style={[styles.citySelectorLabel, { color: theme.muted }]}>
            {t('home.cityLabel')}
          </Text>
          <Text style={[styles.citySelectorName, { color: theme.ink }]}>{city}</Text>
        </View>
        <Text style={[styles.citySelectorAction, { color: theme.forest }]}>
          {t('home.change')}
        </Text>
        <Icon name="ChevronDown" size={16} color={theme.forest} />
      </TouchableOpacity>

      <AppModal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={[styles.modalBackdrop, { backgroundColor: theme.overlay }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setOpen(false)}
            accessibilityLabel="Fechar seleção de cidade"
          />
          <View style={[styles.modalSheet, { backgroundColor: theme.paper }]}>
            <View style={styles.modalHead}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalKicker, { color: theme.kicker }]}>
                  SERTÃO CENTRAL
                </Text>
                <Text style={[styles.modalTitle, { color: theme.ink }]}>
                  Escolha a cidade
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setOpen(false)}
                activeOpacity={0.8}
                style={[styles.modalClose, { backgroundColor: theme.sand }]}
              >
                <Icon name="X" size={18} color={theme.ink} />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.modalList}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalListContent}
            >
              {cities.map((item) => {
                const active = item === city
                return (
                  <TouchableOpacity
                    key={item}
                    activeOpacity={0.85}
                    onPress={() => {
                      onChangeCity?.(item)
                      setOpen(false)
                    }}
                    style={[
                      styles.cityOption,
                      {
                        backgroundColor: active ? theme.sand : theme.surface,
                        borderColor: active ? theme.forest : theme.line,
                      },
                    ]}
                  >
                    <Icon name="MapPin" size={18} color={theme.forest} />
                    <Text style={[styles.cityOptionText, { color: theme.ink }]}>
                      {item}
                    </Text>
                    {active ? <Icon name="Check" size={18} color={theme.forest} /> : null}
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </AppModal>
    </>
  )
}

const styles = StyleSheet.create({
  filterLabel: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 6,
  },
  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    padding: 11,
    marginTop: 6,
  },
  citySelectorIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  citySelectorCopy: {
    flex: 1,
  },
  citySelectorLabel: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  citySelectorName: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  citySelectorAction: {
    fontSize: 9,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 28,
    gap: 8,
  },
  modalList: {
    maxHeight: 380,
  },
  modalListContent: {
    gap: 8,
    paddingBottom: 4,
  },
  modalHead: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  modalKicker: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  modalClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 13,
  },
  cityOptionText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
})
