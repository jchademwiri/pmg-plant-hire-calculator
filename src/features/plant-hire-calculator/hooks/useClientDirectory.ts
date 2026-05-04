import { useEffect, useState } from 'react';
import type { Client } from '../types';

const STORAGE_KEY = 'phc-clients-v1';

const loadFromStorage = (): Client[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Client[];
  } catch {
    return [];
  }
};

const saveToStorage = (clients: Client[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch {
    // ignore
  }
};

export const useClientDirectory = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setClients(loadFromStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(clients);
  }, [clients, loaded]);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient: Client = { ...client, id: Date.now().toString() };
    setClients((prev) => [...prev, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Omit<Client, 'id'>>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  return { clients, addClient, updateClient, removeClient };
};
