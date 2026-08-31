import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';
import te from './te.json';

const translations = { en, hi, ta, te };

/**
 * Get translated text for a key and language
 * @param {string} key
 * @param {string} lang
 * @returns {string}
 */
export function getMessage(key, lang = 'en') {
  if (!key) return '';
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

export default translations;
