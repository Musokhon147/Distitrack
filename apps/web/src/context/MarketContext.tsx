import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Market } from '@distitrack/common';

interface MarketContextType {
    markets: Market[];
    addMarket: (market: Omit<Market, 'id'>) => void;
    deleteMarket: (id: string) => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [markets, setMarkets] = useState<Market[]>(() => {
        const saved = localStorage.getItem('markets');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('markets', JSON.stringify(markets));
    }, [markets]);

    const addMarket = (market: Omit<Market, 'id'>) => {
        const newMarket: Market = {
            ...market,
            id: Date.now().toString(),
        };
        setMarkets(prev => [...prev, newMarket]);
    };

    const deleteMarket = (id: string) => {
        setMarkets(prev => prev.filter(m => m.id !== id));
    };

    return (
        <MarketContext.Provider value={{ markets, addMarket, deleteMarket }}>
            {children}
        </MarketContext.Provider>
    );
};

export const useMarkets = () => {
    const context = useContext(MarketContext);
    if (!context) {
        throw new Error('useMarkets must be used within a MarketProvider');
    }
    return context;
};
