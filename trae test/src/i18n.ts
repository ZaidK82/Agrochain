import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    common: {
      nav: {
        dashboard: 'Dashboard',
        yield: 'Yield Prediction',
        price: 'Price Forecast',
        resilience: 'Resilience Score',
        marketplace: 'Marketplace',
        traceability: 'Traceability',
      },
      wallet: {
        connect: 'Connect Wallet',
      },
      dashboard: {
        predictedYield: 'Predicted Yield',
        expectedPrice: 'Expected Market Price',
        resilienceScore: 'Resilience Score',
        nftStatus: 'Crop NFT Status',
        advisory: 'Advisory',
      },
    },
  },
  hi: {
    common: {
      nav: {
        dashboard: 'डैशबोर्ड',
        yield: 'उपज अनुमान',
        price: 'मूल्य पूर्वानुमान',
        resilience: 'लचीलापन स्कोर',
        marketplace: 'बाज़ार',
        traceability: 'ट्रेसबिलिटी',
      },
      wallet: {
        connect: 'वॉलेट कनेक्ट करें',
      },
      dashboard: {
        predictedYield: 'अनुमानित उपज',
        expectedPrice: 'अपेक्षित मूल्य',
        resilienceScore: 'लचीलापन स्कोर',
        nftStatus: 'फसल NFT स्थिति',
        advisory: 'सलाह',
      },
    },
  },
  mr: {
    common: {
      nav: {
        dashboard: 'डॅशबोर्ड',
        yield: 'उत्पन्न अंदाज',
        price: 'किंमत अंदाज',
        resilience: 'लवचिकता स्कोर',
        marketplace: 'बाजार',
        traceability: 'ट्रेसेबिलिटी',
      },
      wallet: {
        connect: 'वॉलेट कनेक्ट करा',
      },
      dashboard: {
        predictedYield: 'अनुमानित उत्पन्न',
        expectedPrice: 'अपेक्षित किंमत',
        resilienceScore: 'लवचिकता स्कोर',
        nftStatus: 'पिक NFT स्थिती',
        advisory: 'सलाह',
      },
    },
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
