import { useEffect, useState } from 'react';
import type { CatalogueItem } from '../types';

const STORAGE_KEY = 'phc-catalogue-v1';

const loadFromStorage = (): CatalogueItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CatalogueItem[];
  } catch {
    return [];
  }
};

const saveToStorage = (items: CatalogueItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const useCatalogue = () => {
  const [catalogue, setCatalogue] = useState<CatalogueItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCatalogue(loadFromStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveToStorage(catalogue);
  }, [catalogue, loaded]);

  const addCatalogueItem = (name: string, rate: number) => {
    if (!name.trim() || rate <= 0) return;
    const item: CatalogueItem = {
      id: Date.now().toString(),
      name: name.trim(),
      rate,
      usageCount: 0,
    };
    setCatalogue((prev) => [...prev, item]);
  };

  const updateCatalogueItem = (id: string, updates: Partial<Pick<CatalogueItem, 'name' | 'rate'>>) => {
    setCatalogue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeCatalogueItem = (id: string) => {
    setCatalogue((prev) => prev.filter((item) => item.id !== id));
  };

  const incrementUsage = (name: string) => {
    setCatalogue((prev) =>
      prev.map((item) =>
        item.name.toLowerCase() === name.toLowerCase()
          ? { ...item, usageCount: item.usageCount + 1 }
          : item
      )
    );
  };

  // Top 8 by usage count
  const quickItems = [...catalogue]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, 8);

  return {
    catalogue,
    quickItems,
    addCatalogueItem,
    updateCatalogueItem,
    removeCatalogueItem,
    incrementUsage,
  };
};
