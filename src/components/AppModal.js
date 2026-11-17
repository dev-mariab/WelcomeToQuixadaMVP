import { useEffect } from 'react'
import { Modal, Platform, StyleSheet, View } from 'react-native'

export default function AppModal({
  visible,
  transparent = false,
  animationType = 'none',
  onRequestClose,
  children,
  ...rest
}) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !visible || !onRequestClose || typeof document === 'undefined') {
      return undefined
    }
    function handleKey(event) {
      if (event.key === 'Escape') onRequestClose()
    }
    document.addEventListener('keyup', handleKey)
    return () => document.removeEventListener('keyup', handleKey)
  }, [visible, onRequestClose])

  if (Platform.OS !== 'web') {
    return (
      <Modal
        visible={visible}
        transparent={transparent}
        animationType={animationType}
        onRequestClose={onRequestClose}
        {...rest}
      >
        {children}
      </Modal>
    )
  }

  if (!visible) return null

  return (
    <View style={styles.webOverlay} {...rest}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  webOverlay: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10000,
  },
})
