export interface Entry {
    id: string;
    marketNomi: string;
    marketRaqami: string;
    mahsulotTuri: string;
    miqdori: string;
    narx: string; // price
    tolovHolati: 'to\'langan' | 'to\'lanmagan' | 'kutilmoqda';
    sana: string;
    marketId?: string;
}

export interface Market {
    id: string;
    name: string;
    phone: string;
}

export interface Product {
    id: string;
    name: string;
}
