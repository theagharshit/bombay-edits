'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Currency, CurrencyConfig } from '@/types/cart';
import { currencies } from '@/data/shipping';

interface CurrencyContextValue {
  currency: Currency;
  config: CurrencyConfig;
  setCurrency: (currency: Currency) => void;
  convert: (amountInNPR: number) => number;
  format: (amountInNPR: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('INR');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tbe-currency') as Currency | null;
      if (saved && currencies.find((c) => c.code === saved)) {
        setCurrencyState(saved);
      }
    } catch {
      // Ignore
    }
  }, []);

  const config = currencies.find((c) => c.code === currency) || currencies[0];

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('tbe-currency', c);
  }, []);

  const convert = useCallback(
    (amountInNPR: number) => Math.round(amountInNPR * config.rate),
    [config.rate]
  );

  const format = useCallback(
    (amountInNPR: number) => {
      const converted = Math.round(amountInNPR * config.rate);
      if (currency === 'NPR') return `Rs. ${converted.toLocaleString()}`;
      if (currency === 'INR') return `₹${converted.toLocaleString('en-IN')}`;
      return `$${converted.toLocaleString('en-US')}`;
    },
    [config.rate, currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, config, setCurrency, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
}
