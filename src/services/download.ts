import RNBlobUtil from "react-native-blob-util";
import { getClassFolder, getFileNameFromUrl } from "./fileSystem";

export async function downloadPdf(
  pdfUrl: string,
  className: string
): Promise<string> {
  const folder = await getClassFolder(className);
  const fileName = getFileNameFromUrl(pdfUrl);
  const filePath = `${folder}/${fileName}`;

  const exists = await RNBlobUtil.fs.exists(filePath);
  if (exists) {
    await RNBlobUtil.fs.unlink(filePath);
  }

  // Use RN's built-in fetch (no native download manager) for reliability
  const response = await fetch(pdfUrl);
  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  await RNBlobUtil.fs.writeFile(filePath, base64, "base64");
  console.log("✅ Saved:", filePath, "bytes:", blob.size);

  return filePath;
}