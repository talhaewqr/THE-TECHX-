// === forxa.js ===
module.exports = {
  pattern: "forxa",
  desc: "Get .voltron reply",
  category: "fun",
  react: "🤖",
  filename: __filename,
  use: ".forxa",

  execute: async (conn, message, m, { from, reply }) => {
    try {
      await conn.sendMessage(from, { react: { text: "⚡", key: message.key } });
      await reply(".voltron");
    } catch (err) {
      console.error("Forxa error:", err);
      await conn.sendMessage(from, { react: { text: "❌", key: message.key } });
    }
  }
};
