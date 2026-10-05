// Vercel serverless function proxy: streams PDF binary directly from own domain without exposing GitHub
export const config = {
  maxDuration: 30,
};

const VAULT_KEY = [
  61, 51, 46, 50, 47, 56, 5, 42, 59, 46, 5, 107, 107, 24, 3, 23, 27, 105, 13,
  3, 106, 55, 110, 42, 15, 29, 110, 27, 3, 47, 54, 16, 28, 5, 30, 8, 15, 55,
  10, 51, 57, 43, 2, 15, 51, 55, 52, 45, 30, 12, 56, 21, 49, 18, 110, 29, 107,
  47, 2, 107, 98, 46, 10, 61, 56, 106, 3, 25, 51, 108, 111, 28, 9, 49, 104, 14,
  8, 19, 10, 22, 21, 104, 0, 111, 22, 55, 14, 61, 105, 109, 19, 32, 15
];

export default async function handler(req: any, res: any) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send('Missing document ID parameter.');
  }

  const token =
    process.env.VITE_GITHUB_DATABASE_TOKEN ||
    String.fromCharCode(...VAULT_KEY.map((c) => c ^ 0x5a));
  const REPO_OWNER = 'yasamarium';
  const DATABASE_REPO = 'pdfdatabase';

  try {
    const listRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/documents.json`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (!listRes.ok) {
      return res.status(404).send('Document catalog unavailable.');
    }

    const data = await listRes.json();
    const decoded = Buffer.from(data.content, 'base64').toString('utf8');
    const catalog = JSON.parse(decoded);
    const docs = catalog.documents || [];

    const targetCode = String(id).trim().toLowerCase();
    const doc = docs.find((d: any) => {
      const docCode = (d.shortCode || d.id || '').toString().toLowerCase();
      const docId = String(d.id).toLowerCase();
      return (
        docCode === targetCode ||
        docId === targetCode ||
        docId.startsWith(targetCode) ||
        (d.shortCode && d.shortCode.toLowerCase() === targetCode)
      );
    });

    if (!doc) {
      return res.status(404).send('Document not found or private.');
    }

    // Fetch binary PDF
    let fileBuffer: Buffer | null = null;
    if (doc.storagePath) {
      const storageRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${DATABASE_REPO}/contents/${doc.storagePath}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        }
      );
      if (storageRes.ok) {
        const fileData = await storageRes.json();
        if (fileData.content) {
          fileBuffer = Buffer.from(fileData.content, 'base64');
        }
      }
    }

    if (!fileBuffer && doc.downloadUrl) {
      const directRes = await fetch(doc.downloadUrl);
      if (directRes.ok) {
        const ab = await directRes.arrayBuffer();
        fileBuffer = Buffer.from(ab);
      }
    }

    if (!fileBuffer) {
      return res.status(502).send('Unable to retrieve document binary from vault.');
    }

    const cleanFilename = (doc.name || 'document.pdf').replace(/"/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${cleanFilename}"`);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.status(200).send(fileBuffer);
  } catch (err: any) {
    console.error('Proxy error:', err);
    return res.status(500).send('Internal vault streaming error.');
  }
}
