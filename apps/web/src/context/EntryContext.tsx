import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Entry, mockEntries } from '@distitrack/common';

interface EntryContextType {
    entries: Entry[];
    addEntry: (entry: Omit<Entry, 'id' | 'sana'>) => void;
    updateEntry: (id: string, updatedEntry: Partial<Entry>) => void;
    deleteEntry: (id: string) => void;
}

const EntryContext = createContext<EntryContextType | undefined>(undefined);

export const EntryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [entries, setEntries] = useState<Entry[]>(mockEntries);

    const addEntry = (entry: Omit<Entry, 'id' | 'sana'>) => {
        const newEntry: Entry = {
            ...entry,
            id: Date.now().toString(),
            sana: new Date().toISOString().split('T')[0]
        };
        setEntries([newEntry, ...entries]);
    };

    const updateEntry = (id: string, updatedEntry: Partial<Entry>) => {
        setEntries(entries.map(e => e.id === id ? { ...e, ...updatedEntry } : e));
    };

    const deleteEntry = (id: string) => {
        setEntries(entries.filter(e => e.id !== id));
    };

    return (
        <EntryContext.Provider value={{ entries, addEntry, updateEntry, deleteEntry }}>
            {children}
        </EntryContext.Provider>
    );
};

export const useEntryContext = () => {
    const context = useContext(EntryContext);
    if (!context) {
        throw new Error('useEntryContext must be used within an EntryProvider');
    }
    return context;
};
