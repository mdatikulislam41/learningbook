import DeviceInfo from "react-native-device-info";
import { supabase } from "../lib/supabase";
import { UPDATE_TABLE } from "./constants";
import { UpdateInfo } from "./types";
import { isUpdateAvailable } from "./versionCompare";

export interface UpdateResult {
  hasUpdate: boolean;
  forceUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  updateInfo?: UpdateInfo;
}

export async function checkForUpdate(): Promise<UpdateResult> {
  try {
    const currentVersion = DeviceInfo.getVersion();

    const { data, error } = await supabase
      .from(UPDATE_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    const latest = data as UpdateInfo;

    const hasUpdate = isUpdateAvailable(
      currentVersion,
      latest.version
    );

    return {
      hasUpdate,
      forceUpdate: latest.force_update,
      currentVersion,
      latestVersion: latest.version,
      updateInfo: latest,
    };
  } catch (e) {
    console.log("Update Check Error", e);

    return {
      hasUpdate: false,
      forceUpdate: false,
      currentVersion: DeviceInfo.getVersion(),
      latestVersion: DeviceInfo.getVersion(),
    };
  }
}