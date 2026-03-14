import { useState, useEffect } from 'react';
import { storage, UserStorage } from './storage';

export function useUserStorage() {
    const [data, setData] = useState<UserStorage>(storage.get());

    useEffect(() => {
        const handleUpdate = () => setData(storage.get());

        // Listen for custom event from storage.ts
        window.addEventListener('storage-update', handleUpdate);
        // Listen for cross-tab updates
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('storage-update', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    return {
        data,
        update: storage.update,
    };
}
