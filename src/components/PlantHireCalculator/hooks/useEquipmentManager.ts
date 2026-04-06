import { useState } from 'react';
import type { Equipment, Rates } from '../types';
import { calculateRates } from '../utils/calculations';

export const useEquipmentManager = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([
    { 
      id: '1', 
      name: 'Dropside', 
      rates: calculateRates(5200), 
      idleDays: [] 
    } 
  ]);

  const addEquipment = (name: string, rate: string) => {
    if (!name || !rate) return;

    const baseRate = parseFloat(rate);
    const newItem: Equipment = {
      id: Date.now().toString(),
      name,
      rates: calculateRates(baseRate),
      idleDays: [],
    };

    setEquipment([...equipment, newItem]);
  };

  const removeEquipment = (id: string) => {
    setEquipment(equipment.filter((item) => item.id !== id));
  };

  const updateIdleDays = (id: string, days: Date[]) => {
    setEquipment(
      equipment.map((item) =>
        item.id === id ? { ...item, idleDays: days } : item
      )
    );
  };

  const updateRates = (id: string, newRates: Rates) => {
    setEquipment(
      equipment.map((item) => 
        item.id === id ? { ...item, rates: newRates } : item
      )
    );
  };

  return {
    equipment,
    addEquipment,
    removeEquipment,
    updateIdleDays,
    updateRates,
  };
};
