import fs from 'fs/promises';
import cron from 'node-cron';
import path from 'path';

interface ExchangeRateEntry {
  key: string;
  currentExchangeRate: number;
  unit: number;
}

interface BOIResponse {
  exchangeRates: ExchangeRateEntry[];
  lastUpdate?: string;
}

const API_URL = 'https://boi.org.il/PublicApi/GetExchangeRates';
const CACHE_PATH = path.resolve(__dirname, '../data/boi-exchange-cache.json');

export const cacheExchangeRates = async () => {
  const now = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
  console.log(`🌐📥 [Exchange] Starting fetch from Bank of Israel... (${now})`);

  try {
    const fetch = (await import('node-fetch')).default;

    const response = await fetch(API_URL, {
      headers: { Accept: 'application/json' },
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      console.error('⚠️ [Exchange] Invalid response format (not JSON).');
      throw new Error('Response is not JSON');
    }

    const data = await response.json();
    await fs.writeFile(CACHE_PATH, JSON.stringify(data, null, 2), 'utf-8');

    console.log('✅ [Exchange] Exchange rates updated successfully.');
  } catch (error) {
    console.error('❌ [Exchange] Failed to update exchange rates:', error);
  }
};

export const convertCurrencyToILS = async (amount: number, fromCurrency: string): Promise<number> => {
  try {
    const file = await fs.readFile(CACHE_PATH, 'utf-8');
    const data = JSON.parse(file) as BOIResponse;

    const currencyCode = fromCurrency.toUpperCase();
    const match = data.exchangeRates.find((rate) => rate.key === currencyCode);

    if (!match) {
      throw new Error(`❗ Exchange rate for currency "${currencyCode}" not found.`);
    }

    const { currentExchangeRate, unit } = match;
    return (amount * currentExchangeRate) / unit;
  } catch (error) {
    console.error('💥 [Exchange] Failed to convert currency from file:', error);
    throw new Error('Failed to convert currency to ILS');
  }
};

// 🕒 הרצת קרון קבועה
cron.schedule('35 13 * * *', () => {
  cacheExchangeRates();
});

// 🟢 הרצה מיידית עטופה ב־async IIFE
(async () => {
  await cacheExchangeRates();
})();