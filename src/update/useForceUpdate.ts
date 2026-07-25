import { useEffect, useState } from "react";
import { checkForUpdate } from "./updateService";
import { UpdateInfo } from "./types";

export function useForceUpdate() {
  const [loading, setLoading] = useState(true);

  const [visible, setVisible] = useState(false);

  const [updateInfo, setUpdateInfo] =
    useState<UpdateInfo | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const result = await checkForUpdate();

    if (result.hasUpdate) {
      setVisible(true);

      setUpdateInfo(result.updateInfo!);
    }

    setLoading(false);
  }

  return {
    loading,
    visible,
    updateInfo,
    dismiss: () => setVisible(false),
  };
}