import RNBlobUtil from "react-native-blob-util";

export function getFileNameFromUrl(url: string): string {
  return new URL(url).pathname.split("/").pop() || "";
}

export async function getClassFolder(className: string): Promise<string> {
  const base = `${RNBlobUtil.fs.dirs.DocumentDir}/atikul`;
  const folderPath = `${base}/${className}`;

  await ensureDir(base);
  await ensureDir(folderPath);

  return folderPath;
}

async function ensureDir(path: string): Promise<void> {
  try {
    const exists = await RNBlobUtil.fs.isDir(path);
    if (!exists) {
      await RNBlobUtil.fs.mkdir(path);
    }
  } catch (e: any) {
    if (/already exists/i.test(e?.message ?? "")) {
      return;
    }
    throw e;
  }
}

export async function getLocalPdfPath(
  pdfUrl: string,
  className: string
): Promise<string> {
  const folder = await getClassFolder(className);
  const fileName = getFileNameFromUrl(pdfUrl);
  return `${folder}/${fileName}`;
}