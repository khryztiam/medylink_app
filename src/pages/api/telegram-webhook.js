// pages/api/telegram-webhook.js
import { supabase } from "../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const { message } = req.body;

    // Telegram envía el comando como "/start 10315007"
    if (message && message.text && message.text.startsWith("/start")) {
      const parts = message.text.split(" ");
      const sapId = parts[1]; // Aquí capturamos el 10315007
      const telegramId = message.chat.id; // El ID real del chat de Telegram

      if (sapId) {
        // Actualizamos la tabla app_users
        const { error } = await supabase
          .from("app_users")
          .update({ telegram_id: telegramId.toString() })
          .eq("idsap", sapId);

        if (!error) {
          // Opcional: Responderle al usuario por Telegram que ya está vinculado
          await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: telegramId,
              text: "✅ *¡MedyLink vinculado!*\n\nAhora recibirás aquí las notificaciones de tus citas de forma automática.",
              parse_mode: "Markdown",
            }),
          });
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error en Webhook:", error);
    return res.status(500).json({ error: error.message });
  }
}