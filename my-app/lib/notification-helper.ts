import Notification from "@/models/Notification";
import mongoose from "mongoose";

// 👇 Ini fungsi yang dicari-cari sama Task/Finance
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "success" | "info" | "warning" | "error" = "info"
) {
  try {
    // Validasi ID sebelum simpan
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      console.error("❌ Invalid User ID for notification");
      return;
    }

    await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      title,
      message,
      type,
      isRead: false,
    });
    
    console.log(`✅ Notifikasi dibuat: ${title}`);
  } catch (error) {
    console.error("❌ Gagal membuat notifikasi:", error);
  }
}