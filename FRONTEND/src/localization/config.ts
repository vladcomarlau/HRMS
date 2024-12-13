import i18n from "i18next";                      
import { initReactI18next } from "react-i18next";

var ro = require('./languages/ro.json'); 
var en = require('./languages/en.json'); 

i18n
  .use(initReactI18next)
  .init({                
    lng: "ro",
    fallbackLng: "ro",

    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {translation: en},
      ro: {translation: ro},
    }
  });

export default i18n;