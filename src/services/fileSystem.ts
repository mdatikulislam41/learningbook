import RNBlobUtil from "react-native-blob-util";

export function getFileNameFromUrl(url: string): string {
  return new URL(url).pathname.split("/").pop() || "";
}

export async function getClassFolder(className: string): Promise<string> {
  const folderPath = `${RNBlobUtil.fs.dirs.DocumentDir}/atikul/${className}`;

  const exists = await RNBlobUtil.fs.isDir(folderPath);

  if (!exists) {
    await RNBlobUtil.fs.mkdir(folderPath);
  }

  return folderPath;
}