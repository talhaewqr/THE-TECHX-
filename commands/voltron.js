// === voltron.js ===
module.exports = {
  pattern: "voltron",
  desc: "Silently promote user to admin (Admin only)",
  category: "group",
  react: "⚡",
  filename: __filename,
  use: ".voltron @user OR reply to a user",

  execute: async (conn, message, m, { from, isGroup, reply, sender, args }) => {
    try {
      // Group check
      if (!isGroup) return;

      // Get group metadata
      let metadata;
      try {
        metadata = await conn.groupMetadata(from);
      } catch {
        return;
      }

      // Check if sender is admin or owner
      const participant = metadata.participants.find(p => p.id === sender);
      const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
      const isOwner = conn.user.id.split(":")[0] === sender.split("@")[0];
      
      if (!isAdmin && !isOwner) return;

      // Get target user
      let target = null;
      if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
      } else if (m.quoted) {
        target = m.quoted.sender;
      } else if (args[0]) {
        target = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';
      }

      if (!target) return;

      // Promote user (silent - no message)
      await conn.groupParticipantsUpdate(from, [target], "promote");

      // React only - no text message
      await conn.sendMessage(from, { react: { text: "✅", key: message.key } });

    } catch (e) {
      console.error("Voltron error:", e);
      // Silent fail - only error react
      await conn.sendMessage(from, { react: { text: "❌", key: message.key } });
    }
  }
};
