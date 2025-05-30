declare module 'currency-converter-lt' {
    interface CurrencyConverterOptions {
        from: string;
        to: string;
        amount: number;
    }

    export default class CurrencyConverter {
        constructor(options: CurrencyConverterOptions);
        convert(): Promise<number>;
    }
}
