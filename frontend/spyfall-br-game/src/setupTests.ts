import '@testing-library/jest-dom'
import i18n from './i18n'

// Existing tests assert the original Portuguese strings; keep them deterministic.
void i18n.changeLanguage('pt')
