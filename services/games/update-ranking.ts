import api from "@/lib/axios";

export const updateRanking = async (
  entertainmentNids: number[]
): Promise<boolean> => {
  try {
    await api.post("/api/ranking/update", {
      entertainment_nids: entertainmentNids,
    });

    return true;
  } catch (error) {
    console.error("Error updating ranking:", error);
    return false;
  }
};
