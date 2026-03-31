import React, { createContext, useContext, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign } from 'lucide-react';

const CURRENCIES = {
  USD: { symbol: '$', name: 'USD', rate: 1 },
  PEN: { symbol: 'S/', name: 'PEN', rate: 3.7 },
  EUR: { symbol: '€', name: 'EUR', rate: 0.92 },
  MXN: { symbol: '$', name: 'MXN', rate: 17 },
  COP: { symbol: '$', name: 'COP', rate: 4000 },
  ARS: { symbol: '$', name: 'ARS', rate: 850 },
  CLP: { symbol: '$', name: 'CLP', rate: 950 },
};

const COUNTRY_TO_CURRENCY = {
  PE: 'PEN',
  US: 'USD',
  MX: 'MXN',
  CO: 'COP',
  AR: 'ARS',
  CL: 'CLP',
  ES: 'EUR',
  FR: 'EUR',
  DE: 'EUR',
  IT: 'EUR',
};

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && CURRENCIES[savedCurrency]) {
      setCurrency(savedCurrency);
      setLoading(false);
    } else {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const detected = COUNTRY_TO_CURRENCY[data.country_code] || 'USD';
          setCurrency(detected);
          localStorage.setItem('currency', detected);
        })
        .catch(() => setCurrency('USD'))
        .finally(() => setLoading(false));
    }
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const convertPrice = (priceUSD) => {
    if (!priceUSD) return 0;
    return (priceUSD * CURRENCIES[currency].rate).toFixed(2);
  };

  const formatPrice = (priceUSD) => {
    const converted = convertPrice(priceUSD);
    return `${CURRENCIES[currency].symbol}${parseFloat(converted).toLocaleString()}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, convertPrice, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider');
  return context;
}

export default function CurrencySelector() {
  const { currency, changeCurrency } = useCurrency();

  return (
    <Select value={currency} onValueChange={changeCurrency}>
      <SelectTrigger className="w-24 h-9 bg-zinc-900 border-zinc-800 text-zinc-300">
        <DollarSign className="w-3 h-3 mr-1" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCIES).map(([code, { name }]) => (
          <SelectItem key={code} value={code}>
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}