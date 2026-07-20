import RNBlobUtil from "react-native-blob-util";
import { getClassFolder, getFileNameFromUrl, getLocalPdfPath } from "./fileSystem";

export async function isPdfDownloaded(
  pdfUrl: string,
  className: string
): Promise<boolean> {
  const filePath = await getLocalPdfPath(pdfUrl, className);
  return RNBlobUtil.fs.exists(filePath);
}

export async function getOrDownloadPdf(
  pdfUrl: string,
  className: string,
  onProgress?: (percent: number) => void
): Promise<{ localFile: string; fromCache: boolean }> {
  const filePath = await getLocalPdfPath(pdfUrl, className);
  const exists = await RNBlobUtil.fs.exists(filePath);

  if (exists) {
    return { localFile: filePath, fromCache: true };
  }

  const localFile = await downloadPdf(pdfUrl, className, onProgress);
  return { localFile, fromCache: false };
}

export async function downloadPdf(
  pdfUrl: string,
  className: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const folder = await getClassFolder(className);
  const fileName = getFileNameFromUrl(pdfUrl);
  const filePath = `${folder}/${fileName}`;

  const exists = await RNBlobUtil.fs.exists(filePath);
  if (exists) {
    await RNBlobUtil.fs.unlink(filePath);
  }

  const res = await RNBlobUtil.fetch("GET", pdfUrl, {})
    .progress({ count: 10 }, (received, total) => {
      if (onProgress && total > 0) {
        onProgress(Math.floor((received / total) * 100));
      }
    })
    .then((response) => {
      if (response.info().status !== 200) {
        throw new Error(`Download failed with status ${response.info().status}`);
      }
      return response;
    });

  await RNBlobUtil.fs.writeFile(filePath, res.base64(), "base64");
  console.log("✅ Saved:", filePath, "bytes:", res.respInfo?.bytesWritten);

  if (onProgress) {
    onProgress(100);
  }

  return filePath;
}
