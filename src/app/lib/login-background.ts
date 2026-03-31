import { useEffect, useState } from 'react';
import type { GeneralSettingsLoginImageAsset, GeneralSettingsStorageData } from '../types';

const GENERAL_SETTINGS_STORAGE_PREFIX = 'brandup_general_settings';
export const GENERAL_SETTINGS_UPDATED_EVENT = 'brandup-general-settings-updated';

function createFallbackSettings(): GeneralSettingsStorageData {
  return {
    company: {
      companyName: '',
      address: '',
      phoneNumbers: '',
      identification: '',
    },
    basicConfig: {
      timezone: 'America/Mexico_City',
      backupEmail: '',
      supportEmail: '',
      billingEmail: '',
      validateIdentity: false,
    },
    notifications: {
      routerDownEmail: '',
      routerDownMobile: '',
      paymentReportEmail: '',
    },
    logos: {
      mainLogo: null,
      invoiceLogo: null,
    },
    loginImage: {
      selectedImageId: '',
      images: [],
    },
  };
}

function buildStorageKey(companyId?: string) {
  return `${GENERAL_SETTINGS_STORAGE_PREFIX}:${companyId ?? 'global'}`;
}

function loadStoredGeneralSettings(storageKey: string): GeneralSettingsStorageData {
  const fallback = createFallbackSettings();

  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return fallback;
    }

    const parsed = JSON.parse(rawValue) as Partial<GeneralSettingsStorageData>;

    return {
      company: {
        ...fallback.company,
        ...parsed.company,
      },
      basicConfig: {
        ...fallback.basicConfig,
        ...parsed.basicConfig,
      },
      notifications: {
        ...fallback.notifications,
        ...parsed.notifications,
      },
      logos: {
        mainLogo: parsed.logos?.mainLogo ?? fallback.logos.mainLogo,
        invoiceLogo: parsed.logos?.invoiceLogo ?? fallback.logos.invoiceLogo,
      },
      loginImage: {
        selectedImageId: parsed.loginImage?.selectedImageId ?? fallback.loginImage.selectedImageId,
        images: Array.isArray(parsed.loginImage?.images) ? parsed.loginImage.images : fallback.loginImage.images,
      },
    };
  } catch {
    return fallback;
  }
}

function getSelectedLoginImage(settings: GeneralSettingsStorageData): GeneralSettingsLoginImageAsset | null {
  return (
    settings.loginImage.images.find((image) => image.id === settings.loginImage.selectedImageId) ??
    settings.loginImage.images[0] ??
    null
  );
}

function getCandidateStorageKeys(companyId?: string) {
  const keys = [buildStorageKey(companyId)];

  if (companyId) {
    keys.push(buildStorageKey());
  }

  if (typeof window === 'undefined') {
    return keys;
  }

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith(`${GENERAL_SETTINGS_STORAGE_PREFIX}:`) || keys.includes(key)) {
      continue;
    }

    keys.push(key);
  }

  return keys;
}

export function getConfiguredLoginBackground(companyId?: string) {
  for (const key of getCandidateStorageKeys(companyId)) {
    const image = getSelectedLoginImage(loadStoredGeneralSettings(key));
    if (image?.previewUrl) {
      return image.previewUrl;
    }
  }

  return null;
}

export function notifyGeneralSettingsUpdated() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(GENERAL_SETTINGS_UPDATED_EVENT));
}

export function useConfiguredLoginBackground(companyId?: string) {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(() => getConfiguredLoginBackground(companyId));

  useEffect(() => {
    const refresh = () => {
      setBackgroundUrl(getConfiguredLoginBackground(companyId));
    };

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(GENERAL_SETTINGS_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(GENERAL_SETTINGS_UPDATED_EVENT, refresh);
    };
  }, [companyId]);

  return backgroundUrl;
}
