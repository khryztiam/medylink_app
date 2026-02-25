export const enviarNotificacionTelegram = async (chatId, mensaje) => {
  const token = process.env.TELEGRAM_TOKEN;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: mensaje,
        parse_mode: "Markdown", // Permite negritas y formato
      }),
    });

    if (!response.ok) throw new Error("Error al enviar mensaje");
    console.log("Notificación enviada con éxito");
  } catch (error) {
    console.error("Error Telegram:", error);
  }
};