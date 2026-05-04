import { useEffect, useState } from 'react';
import type { CompanyProfile } from '../types';

const STORAGE_KEY = 'phc-company-v1';

const defaultProfile = (): CompanyProfile => ({
  name: '',
  registration: '',
  vatNumber: '',
  address: '',
  phone: '',
  email: '',
});

const loadFromStorage = (): CompanyProfile => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw) as Partial<CompanyProfile>;
    return {
      name: parsed.name ?? '',
      registration: parsed.registration ?? '',
      vatNumber: parsed.vatNumber ?? '',
      address: parsed.address ?? '',
      phone: parsed.phone ?? '',
      email: parsed.email ?? '',
    };
  } catch {
    return defaultProfile();
  }
};

export const useCompanyProfile = () => {
  const [profile, setProfile] = useState<CompanyProfile>(defaultProfile());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProfile(loadFromStorage());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile, loaded]);

  return { profile, setProfile };
};
