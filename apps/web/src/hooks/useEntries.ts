import { useEntryContext } from '../context/EntryContext';

export const useEntries = () => {
    return useEntryContext();
};
