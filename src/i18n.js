import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: require('./locales/en/translation.json')
            },
            ja: {
                translation: require('./locales/ja/translation.json')
            }
        },
        lng: 'ja', // デフォルト言語
        preload: ['en', 'ja'], // プリロードする言語
        fallbackLng: 'ja', // 言語が見つからない場合のデフォルト
        interpolation: {
            escapeValue: false // Reactではエスケープ不要
        }
    });

export default i18n;
