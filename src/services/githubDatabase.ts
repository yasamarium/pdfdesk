import type { AppUser, CloudDocument } from '../types';

export const REPO_OWNER = 'yasamarium';
export const DATABASE_REPO = 'pdfdatabase';

// Resolve database auth token securely
function getDbToken(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GITHUB_DATABASE_TOKEN) {
    return (import.meta.env.VITE_GITHUB_DATABASE_TOKEN as string).trim();
  }
  return localStorage.getItem('pdfdesk_db_token') || '';
}

export function setDatabaseToken(token: string): void {
  localStorage.setItem('pdfdesk_db_token', token.trim());
}

const STORAGE_KEY = 'pdfdesk_current_user';

/**
 * Hash password using Web Crypto SHA-256
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = 'pdfdesk_salt_2026_db';
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Reads users.json from cloud database
 */
async function fetchUsersFromDb(): Promise<{ users: any[]; sha?: string }> {
  const token = getDbToken();
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/users.json`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    }
  );

  if (!res.ok) {
    return { users: [] };
  }

  const data = await res.json();
  try {
    const decoded = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
    const parsed = JSON.parse(decoded);
    return { users: parsed.users || [], sha: data.sha };
  } catch {
    return { users: [], sha: data.sha };
  }
}

/**
 * Commits updated users.json back to database
 */
async function saveUsersToDb(users: any[], sha?: string): Promise<void> {
  const token = getDbToken();
  const payload = JSON.stringify({ version: '1.0.0', updatedAt: new Date().toISOString(), users }, null, 2);
  const b64 = btoa(unescape(encodeURIComponent(payload)));

  await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/users.json`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'sync: update user account records',
        content: b64,
        sha,
      }),
    }
  );
}

/**
 * Register a new user
 */
export async function signUpUser(
  username: string,
  password: string,
  displayName?: string
): Promise<AppUser> {
  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    throw new Error('Username must be at least 3 characters.');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
    throw new Error('Username can only contain letters, numbers, hyphens, and underscores.');
  }
  if (!password || password.length < 4) {
    throw new Error('Password must be at least 4 characters.');
  }

  // 1. Check if user already exists
  const { users, sha } = await fetchUsersFromDb();
  const exists = users.some((u) => u.username.toLowerCase() === cleanUsername);
  if (exists) {
    throw new Error(`Username "${cleanUsername}" is already taken. Please choose another.`);
  }

  // 2. Hash password and create record
  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const newUserRecord = {
    id: `usr_${Date.now().toString(36)}`,
    username: cleanUsername,
    displayName: (displayName && displayName.trim()) || cleanUsername,
    passwordHash,
    createdAt: now,
    lastLoginAt: now,
  };

  users.push(newUserRecord);

  // 3. Save to database
  await saveUsersToDb(users, sha);

  const appUser: AppUser = {
    id: newUserRecord.id,
    username: newUserRecord.username,
    displayName: newUserRecord.displayName,
    createdAt: newUserRecord.createdAt,
    lastLoginAt: newUserRecord.lastLoginAt,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
  return appUser;
}

/**
 * Sign in existing user with username and password
 */
export async function signInUser(username: string, password: string): Promise<AppUser> {
  const cleanUsername = username.trim().toLowerCase();
  if (!cleanUsername || !password) {
    throw new Error('Please enter both username and password.');
  }

  const { users, sha } = await fetchUsersFromDb();
  const userRecord = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!userRecord) {
    throw new Error(`Account "${cleanUsername}" not found. Please create an account.`);
  }

  const inputHash = await hashPassword(password);
  if (inputHash !== userRecord.passwordHash) {
    throw new Error('Incorrect password. Please try again.');
  }

  // Update last login
  const now = new Date().toISOString();
  userRecord.lastLoginAt = now;
  saveUsersToDb(users, sha).catch((e) => console.warn('Could not update last login:', e));

  const appUser: AppUser = {
    id: userRecord.id,
    username: userRecord.username,
    displayName: userRecord.displayName || userRecord.username,
    createdAt: userRecord.createdAt,
    lastLoginAt: now,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(appUser));
  return appUser;
}

/**
 * Get active user from local storage
 */
export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Sign out
 */
export function signOutUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get cloud vault storage bucket
 */
async function getOrCreateVaultRelease(): Promise<{ id: number; upload_url: string; html_url: string }> {
  const token = getDbToken();
  const listRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/releases`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (listRes.ok) {
    const releases = await listRes.json();
    const vaultRelease = releases.find((r: any) => r.tag_name === 'vault-storage') || releases[0];
    if (vaultRelease) {
      return {
        id: vaultRelease.id,
        upload_url: vaultRelease.upload_url,
        html_url: vaultRelease.html_url,
      };
    }
  }

  // Create release if not present
  const createRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/releases`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tag_name: 'vault-storage',
      name: 'PDFDesk Cloud Vault',
      body: 'Private cloud storage bucket for user documents',
      draft: false,
      prerelease: false,
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to connect to Cloud Storage Vault.');
  }

  const newRelease = await createRes.json();
  return {
    id: newRelease.id,
    upload_url: newRelease.upload_url,
    html_url: newRelease.html_url,
  };
}

/**
 * Uploads PDF strictly tagged with the authenticated user's username
 */
export async function uploadPdfToCloud(
  blob: Blob,
  filename: string,
  user: AppUser,
  onProgress?: (msg: string) => void
): Promise<CloudDocument> {
  const token = getDbToken();
  const username = user.username.toLowerCase();

  if (onProgress) onProgress('Securing Cloud Vault connection...');
  const release = await getOrCreateVaultRelease();

  // Create unique filename tagged with user
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now().toString().slice(-6);
  const uploadName = cleanName.toLowerCase().endsWith('.pdf')
    ? cleanName.replace(/\.pdf$/i, `_${username}_${timestamp}.pdf`)
    : `${cleanName}_${username}_${timestamp}.pdf`;

  if (onProgress) onProgress(`Syncing ${filename} to your Cloud Drive...`);

  const uploadEndpoint = `https://uploads.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/releases/${release.id}/assets?name=${encodeURIComponent(
    uploadName
  )}`;

  const uploadRes = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/pdf',
    },
    body: blob,
  });

  if (!uploadRes.ok) {
    throw new Error('Failed to sync document with Cloud Drive.');
  }

  const asset = await uploadRes.json();

  const cloudDoc: CloudDocument = {
    id: asset.id,
    name: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
    size: asset.size,
    downloadUrl: asset.browser_download_url,
    uploadedAt: asset.created_at || new Date().toISOString(),
    uploadedBy: username,
    releaseId: release.id,
    assetId: asset.id,
    browserUrl: asset.browser_download_url,
  };

  // Record document into documents.json
  if (onProgress) onProgress('Securing document in your private index...');
  recordDocumentInCatalog(cloudDoc).catch((e) => console.warn('Catalog record error:', e));

  return cloudDoc;
}

/**
 * Appends document metadata to documents catalog
 */
async function recordDocumentInCatalog(doc: CloudDocument): Promise<void> {
  const token = getDbToken();
  try {
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/documents.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    let sha: string | undefined;
    let documentsList: any[] = [];

    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
      const decoded = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
      try {
        const parsed = JSON.parse(decoded);
        documentsList = parsed.documents || [];
      } catch {
        documentsList = [];
      }
    }

    documentsList.unshift(doc);

    const payload = JSON.stringify({ version: '1.0.0', updatedAt: new Date().toISOString(), documents: documentsList }, null, 2);
    const b64 = btoa(unescape(encodeURIComponent(payload)));

    await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/documents.json`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'vault: sync new document entry',
          content: b64,
          sha,
        }),
      }
    );
  } catch (err) {
    console.warn('Failed to record catalog in repo:', err);
  }
}

/**
 * STRICT USER ISOLATION: Lists ONLY the documents uploaded by this specific user
 */
export async function listUserCloudDocuments(username: string): Promise<CloudDocument[]> {
  const token = getDbToken();
  const targetUser = username.trim().toLowerCase();

  try {
    const catRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/documents.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    let catalogDocs: CloudDocument[] = [];
    if (catRes.ok) {
      const catData = await catRes.json();
      const decoded = decodeURIComponent(escape(atob(catData.content.replace(/\s/g, ''))));
      const parsed = JSON.parse(decoded);
      catalogDocs = parsed.documents || [];
    }

    // STRICT FILTER: Only return documents where uploadedBy matches targetUser
    const userDocs = catalogDocs.filter(
      (d) => (d.uploadedBy || '').toLowerCase() === targetUser
    );

    return userDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (err) {
    console.error('Failed to list user cloud documents:', err);
    return [];
  }
}

/**
 * Deletes a PDF document from cloud vault
 */
export async function deleteCloudDocument(assetId: number, username: string): Promise<boolean> {
  const token = getDbToken();
  const cleanUsername = username.toLowerCase();

  try {
    // 1. Delete asset from cloud storage
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/releases/assets/${assetId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    // 2. Remove from documents.json
    try {
      const getRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/documents.json`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );

      if (getRes.ok) {
        const data = await getRes.json();
        const decoded = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
        const parsed = JSON.parse(decoded);
        const updatedList = (parsed.documents || []).filter(
          (d: CloudDocument) => !(d.assetId === assetId && (d.uploadedBy || '').toLowerCase() === cleanUsername)
        );

        const payload = JSON.stringify({ version: '1.0.0', updatedAt: new Date().toISOString(), documents: updatedList }, null, 2);
        const b64 = btoa(unescape(encodeURIComponent(payload)));

        await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/documents.json`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github+json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: 'vault: delete document entry',
              content: b64,
              sha: data.sha,
            }),
          }
        );
      }
    } catch (e) {
      console.warn('Could not update documents catalog on delete:', e);
    }

    return res.status === 204 || res.ok;
  } catch (err) {
    console.error('Failed to delete cloud document:', err);
    return false;
  }
}
