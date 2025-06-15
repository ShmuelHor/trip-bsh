import fetch from 'node-fetch';

export const convertCurrencyToILS = async (amount: number, fromCurrency: string): Promise<number> => {
    const currencyCode = fromCurrency.trim().toUpperCase();
    if (currencyCode === 'ILS' || currencyCode === 'ש"ח' || currencyCode === 'NIS' || currencyCode === '₪') {
        return amount;
    }

    const url = `https://api.frankfurter.app/latest?amount=${amount}&from=${currencyCode}&to=ILS`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch exchange rate: ${response.statusText}`);
        }
        const data = (await response.json()) as { rates?: { ILS?: number } };
        if (!data.rates || typeof data.rates.ILS !== 'number') {
            console.error('💥 [Exchange] Invalid API response:', data);
            throw new Error(`Invalid response from exchange rate API for currency "${currencyCode}"`);
        }
        return data.rates.ILS;
    } catch (error) {
        console.error('💥 [Exchange] Failed to convert currency:', error);
        throw new Error('Failed to convert currency to ILS');
    }
};
