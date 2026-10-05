import type { CloudUser, CloudDocument } from '../types';

export const REPO_OWNER = 'yasamarium';
export const DATABASE_REPO = 'pdfdatabase';
export const DEFAULT_TOKEN = (import.meta.env.VITE_GITHUB_TOKEN as string) || '';
const STORAGE_KEY = 'pdfdesk_cloud_user';

/**
 * Gets cached signed-in user from localStorage
 */
export function getStoredUser(): CloudUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Signs in user with GitHub token, verifies user identity, and registers user in pdfdatabase repo
 */
export async function signInWithToken(token: string): Promise<CloudUser> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    throw new Error('Please provide a valid GitHub token.');
  }

  // Verify token with GitHub API
  const res = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'PDFDesk-App',
    },
  });

  if (!res.ok) {
    throw new Error('Authentication failed. Please verify your token permissions (requires repo scope).');
  }

  const userData = await res.json();
  const user: CloudUser = {
    username: userData.login,
    name: userData.name || userData.login,
    avatarUrl: userData.avatar_url || '',
    token: cleanToken,
    signedInAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

  // Store user record in pdfdatabase repository asynchronously
  recordUserInRepo(user).catch((e) => console.warn('Could not record user in repo:', e));

  return user;
}

/**
 * Clears current user session
 */
export function signOutUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Records or updates user login profile in pdfdatabase/users.json
 */
async function recordUserInRepo(user: CloudUser): Promise<void> {
  const token = user.token || DEFAULT_TOKEN;
  try {
    // 1. Fetch current users.json
    const getRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/users.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    let sha: string | undefined;
    let usersList: any[] = [];

    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
      const decoded = atob(data.content.replace(/\s/g, ''));
      try {
        const parsed = JSON.parse(decoded);
        usersList = parsed.users || [];
      } catch {
        usersList = [];
      }
    }

    // Check if user already exists
    const existingIdx = usersList.findIndex((u) => u.username === user.username);
    const userRecord = {
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.signedInAt,
    };

    if (existingIdx >= 0) {
      usersList[existingIdx] = { ...usersList[existingIdx], ...userRecord };
    } else {
      usersList.push(userRecord);
    }

    const payload = JSON.stringify({ version: '1.0.0', updatedAt: new Date().toISOString(), users: usersList }, null, 2);
    // Base64 encode UTF-8
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
          message: `chore: update user record for ${user.username}`,
          content: b64,
          sha,
        }),
      }
    );
  } catch (err) {
    console.warn('Failed to record user record:', err);
  }
}

/**
 * Ensures or retrieves the release in pdfdatabase for storing PDF assets
 */
async function getOrCreateVaultRelease(token: string): Promise<{ id: number; upload_url: string; html_url: string }> {
  // Check existing releases
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
      body: 'Cloud storage repository for saved PDF documents',
      draft: false,
      prerelease: false,
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to create storage release in pdfdatabase repository.');
  }

  const newRelease = await createRes.json();
  return {
    id: newRelease.id,
    upload_url: newRelease.upload_url,
    html_url: newRelease.html_url,
  };
}

/**
 * Uploads a PDF to GitHub Releases of pdfdatabase
 */
export async function uploadPdfToCloud(
  blob: Blob,
  filename: string,
  user?: CloudUser | null,
  onProgress?: (msg: string) => void
): Promise<CloudDocument> {
  const token = user?.token || DEFAULT_TOKEN;
  const username = user?.username || 'yasamarium';

  if (onProgress) onProgress('Connecting to PDF Cloud Vault...');
  const release = await getOrCreateVaultRelease(token);

  // Clean filename and ensure unique name
  const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now().toString().slice(-4);
  const uploadName = cleanName.toLowerCase().endsWith('.pdf')
    ? cleanName.replace(/\.pdf$/i, `_${timestamp}.pdf`)
    : `${cleanName}_${timestamp}.pdf`;

  if (onProgress) onProgress(`Uploading ${uploadName} to GitHub Cloud Releases...`);

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
    const errorText = await uploadRes.text();
    throw new Error(`Cloud upload failed: ${errorText}`);
  }

  const asset = await uploadRes.json();

  const cloudDoc: CloudDocument = {
    id: asset.id,
    name: asset.name,
    size: asset.size,
    downloadUrl: asset.browser_download_url,
    uploadedAt: asset.created_at || new Date().toISOString(),
    uploadedBy: username,
    releaseId: release.id,
    assetId: asset.id,
    browserUrl: asset.browser_download_url,
  };

  // Record document into documents.json
  if (onProgress) onProgress('Cataloging document in cloud vault index...');
  recordDocumentInCatalog(cloudDoc, token).catch((e) => console.warn('Catalog record error:', e));

  return cloudDoc;
}

/**
 * Appends document metadata to pdfdatabase/documents.json
 */
async function recordDocumentInCatalog(doc: CloudDocument, token: string): Promise<void> {
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
      const decoded = atob(data.content.replace(/\s/g, ''));
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
          message: `docs: store document ${doc.name}`,
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
 * Lists all PDFs stored in GitHub Releases of pdfdatabase
 */
export async function listCloudDocuments(user?: CloudUser | null): Promise<CloudDocument[]> {
  const token = user?.token || DEFAULT_TOKEN;

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/releases`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    if (!res.ok) return [];

    const releases = await res.json();
    const allDocs: CloudDocument[] = [];

    for (const rel of releases) {
      if (Array.isArray(rel.assets)) {
        for (const asset of rel.assets) {
          allDocs.push({
            id: asset.id,
            name: asset.name,
            size: asset.size,
            downloadUrl: asset.browser_download_url,
            uploadedAt: asset.created_at,
            uploadedBy: asset.uploader?.login || 'yasamarium',
            releaseId: rel.id,
            assetId: asset.id,
            browserUrl: asset.browser_download_url,
          });
        }
      }
    }

    // Sort by uploadedAt descending
    return allDocs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (err) {
    console.error('Failed to list cloud documents:', err);
    return [];
  }
}

/**
 * Deletes a PDF asset from GitHub Releases in pdfdatabase
 */
export async function deleteCloudDocument(assetId: number, user?: CloudUser | null): Promise<boolean> {
  const token = user?.token || DEFAULT_TOKEN;

  try {
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
    return res.status === 204 || res.ok;
  } catch (err) {
    console.error('Failed to delete cloud document:', err);
    return false;
  }
}
