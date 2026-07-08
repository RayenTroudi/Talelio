import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';

/**
 * Fallback used until the Settings collection exists (provision it via the
 * "First-time setup" button on /admin/settings) or if it's temporarily
 * unreachable.
 */
export const DEFAULT_COMMISSION_RATE = 4.5;

export const SETTINGS_COLLECTION_ID = 'settings';
export const SETTINGS_DOC_ID = 'appSettings';

function settingsCollection() {
  return appwriteConfig.settingsCollectionId || SETTINGS_COLLECTION_ID;
}

/**
 * Per-item TND commission paid to a standard seller (and to a referred
 * seller once past the referral threshold). Admin-editable via
 * /admin/settings — falls back to DEFAULT_COMMISSION_RATE if unset.
 */
export async function getCommissionRate(): Promise<number> {
  try {
    const databases = getServerDatabases();
    const doc = await databases.getDocument(
      appwriteConfig.databaseId,
      settingsCollection(),
      SETTINGS_DOC_ID
    );
    const rate = Number(doc.referralCommissionAmount);
    return Number.isFinite(rate) && rate > 0 ? rate : DEFAULT_COMMISSION_RATE;
  } catch {
    return DEFAULT_COMMISSION_RATE;
  }
}

export async function setCommissionRate(rate: number): Promise<number> {
  const databases = getServerDatabases();
  const col = settingsCollection();

  try {
    const updated = await databases.updateDocument(
      appwriteConfig.databaseId,
      col,
      SETTINGS_DOC_ID,
      { referralCommissionAmount: rate }
    );
    return Number(updated.referralCommissionAmount);
  } catch {
    const created = await databases.createDocument(
      appwriteConfig.databaseId,
      col,
      SETTINGS_DOC_ID,
      { referralCommissionAmount: rate }
    );
    return Number(created.referralCommissionAmount);
  }
}
