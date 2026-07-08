import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { appwriteConfig, getServerDatabases } from '@/lib/appwrite-config';
import { Permission, Role } from 'node-appwrite';
import { DEFAULT_COMMISSION_RATE, SETTINGS_COLLECTION_ID, SETTINGS_DOC_ID } from '@/lib/settings';

/**
 * POST: One-time (idempotent) provisioning of the Settings collection in
 * Appwrite. Safe to call more than once — each step is caught individually
 * so re-running just fills in whatever is still missing. Admin only.
 */
export async function POST() {
  // @ts-ignore - authOptions is compatible
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // @ts-ignore - role exists on user object
  if (session.user?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  const databases = getServerDatabases();
  const log: string[] = [];

  try {
    await databases.createCollection(
      appwriteConfig.databaseId,
      SETTINGS_COLLECTION_ID,
      'Settings',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ]
    );
    log.push('Created Settings collection');
    // Give Appwrite a moment before attaching attributes to a brand-new collection
    await new Promise((r) => setTimeout(r, 1500));
  } catch (e: any) {
    log.push(`Collection: ${e.message}`);
  }

  try {
    await databases.createFloatAttribute(
      appwriteConfig.databaseId,
      SETTINGS_COLLECTION_ID,
      'referralCommissionAmount',
      true,
      0,
      999999
    );
    log.push('Created referralCommissionAmount attribute');
    await new Promise((r) => setTimeout(r, 2000));
  } catch (e: any) {
    log.push(`Attribute: ${e.message}`);
  }

  try {
    await databases.createDocument(
      appwriteConfig.databaseId,
      SETTINGS_COLLECTION_ID,
      SETTINGS_DOC_ID,
      { referralCommissionAmount: DEFAULT_COMMISSION_RATE }
    );
    log.push(`Created appSettings document (${DEFAULT_COMMISSION_RATE} TND)`);
  } catch (e: any) {
    log.push(`Document: ${e.message}`);
  }

  return NextResponse.json({ done: true, log });
}
