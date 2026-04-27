// === purpose.js ===
module.exports = {
    pattern: "purpose",
    desc: "Send a romantic purpose line to someone",
    category: "fun",
    react: "💗",
    use: ".purpose @user or .purpose name",
    filename: __filename,

    execute: async (conn, message, m, { q, reply, from, isGroup, sender, args }) => {
        try {
            // Only works in groups
            if (!isGroup) {
                return reply("❌ This command only works in groups!");
            }

            // Target user (mention or reply or text)
            let target = m.mentionedJid?.[0] || m.quoted?.sender || null;
            let name = q ? q.trim() : '';

            // If no target and no name
            if (!target && !name) {
                return reply(`💗 *Example:*\n${global.prefix || '.'}purpose @user\n${global.prefix || '.'}purpose John`);
            }

            // Purpose lines
            const lines = [
                "*_Ao Hide and seek khely mein apko Pkrunga ga andhery mein🥹👀💋_*",
                "*_Ao apko sb sy Dor ly jaon jha ap mujh pr chrna or mein ap pr🥹👀_*",
                "*_Kash Tum Meri Bandi hoti or aesa he ek Gc uh k or apny Naam pr bnata🥹💋👀_*",
                "*_Jawn I love you From My Chota Heart🥹💋💗_*"
            ];

            // Random selection
            const randomLine = lines[Math.floor(Math.random() * lines.length)];

            let purposeText = '';

            // If target JID is available
            if (target) {
                const targetName = target.split('@')[0];
                purposeText = `@${targetName} ${randomLine}`;
                await conn.sendMessage(from, {
                    text: purposeText,
                    mentions: [target]
                }, { quoted: message });
            } 
            // If only name provided
            else if (name) {
                purposeText = `${name} ${randomLine}`;
                await reply(purposeText);
            }

        } catch (err) {
            console.error("Purpose command error:", err);
            reply("❌ Failed to send purpose line.");
        }
    }
};
