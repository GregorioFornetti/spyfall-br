import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import pt from './locales/pt'
import en from './locales/en'

export const SUPPORTED_LANGUAGES = ['pt', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]
export const LANGUAGE_STORAGE_KEY = 'spyfall-language'

export function detectLanguage(): SupportedLanguage {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (stored === 'pt' || stored === 'en') {
      return stored
    }
  } catch {
    // storage unavailable (e.g. private mode); fall through to browser language
  }
  return window.navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'pt'
}

i18n.use(initReactI18next).init({
  resources: {
    pt: { translation: pt },
    en: { translation: en },
  },
  lng: detectLanguage(),
  fallbackLng: 'pt',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng === 'en' ? 'en' : 'pt-BR'
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng)
  } catch {
    // ignore storage failures; the switch still applies to this session
  }
})
document.documentElement.lang = i18n.language === 'en' ? 'en' : 'pt-BR'

export function translateServerMessage(message: string): string {
  const translated = i18n.t(`serverMessages.${message}`, { defaultValue: message })
  return translated
}

export default i18n
