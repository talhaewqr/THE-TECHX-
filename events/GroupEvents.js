// === GroupEvents.js ===
const { isJidGroup } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

// ========== TRACK DUPLICATE MESSAGES ==========
const sentMessages = new Set();

// ========== SETTINGS FILES ==========
const SETTINGS_DIR = './database';
const WELCOME_FILE = path.join(SETTINGS_DIR, 'welcome.json');
const GOODBYE_FILE = path.join(SETTINGS_DIR, 'goodbye.json');

// Ensure database directory exists
if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
}

// Load welcome settings
function loadWelcomeSettings() {
    try {
        if (fs.existsSync(WELCOME_FILE)) {
            return JSON.parse(fs.readFileSync(WELCOME_FILE, 'utf8'));
        }
    } catch (e) {}
    return {};
}

// Load goodbye settings
function loadGoodbyeSettings() {
    try {
        if (fs.existsSync(GOODBYE_FILE)) {
            return JSON.parse(fs.readFileSync(GOODBYE_FILE, 'utf8'));
        }
    } catch (e) {}
    return {};
}

// Check if welcome is enabled for this group
function isWelcomeEnabled(groupId) {
    const settings = loadWelcomeSettings();
    return settings[groupId] === true;
}

// Check if goodbye is enabled for this group
function isGoodbyeEnabled(groupId) {
    const settings = loadGoodbyeSettings();
    return settings[groupId] === true;
}

// Default profile pictures
const defaultProfilePics = [
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
    'https://i.ibb.co/KhYC4FY/1221bc0bdd2354b42b293317ff2adbcf-icon.png',
];

// Newsletter context
const getContextInfo = (mentionedJids) => ({
    mentionedJid: mentionedJids,
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: '120363425629935700@newsletter',
        newsletterName: "𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓",
        serverMessageId: 200,
    },
});

module.exports = async (conn, update) => {
    try {
        const { id, participants, action } = update;
        if (!id || !isJidGroup(id) || !participants) return;

        const groupMetadata = await conn.groupMetadata(id);
        const groupName = groupMetadata.subject || "Group";
        const desc = groupMetadata.desc || "No Description available.";
        const groupMembersCount = groupMetadata.participants?.length || 0;
        const timestamp = new Date().toLocaleString();

        for (const participant of participants) {
            const userName = participant.split("@")[0];
            
            // 🔥 CHECK FOR DUPLICATE MESSAGES
            const msgKey = `${id}_${action}_${participant}`;
            
            if (sentMessages.has(msgKey)) {
                console.log(`⏭️ Already sent ${action} for ${participant}, skipping...`);
                continue;
            }

            // Get profile picture
            let userPpUrl;
            try {
                userPpUrl = await conn.profilePictureUrl(participant, "image");
            } catch {
                userPpUrl = defaultProfilePics[Math.floor(Math.random() * defaultProfilePics.length)];
            }

            // ========== WELCOME ==========
            if (action === "add") {
                // 🔥 CHECK IF WELCOME IS ENABLED
                if (!isWelcomeEnabled(id)) {
                    console.log(`⏭️ Welcome disabled for ${id}, skipping...`);
                    continue;
                }
                
                sentMessages.add(msgKey);
                setTimeout(() => sentMessages.delete(msgKey), 5000);

                const welcomeText = `
╭───❖ 🎒 *WELCOME HOMIE* ❖───
│ 👋 Hey @${userName}!
│ 🏠 Welcome to: *${groupName}*
│ 🔢 Member #: *${groupMembersCount}*
╰❖ *_ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓_*❖─
                `.trim();

                await conn.sendMessage(id, {
                    image: { url: userPpUrl },
                    caption: welcomeText,
                    mentions: [participant],
                    contextInfo: getContextInfo([participant]),
                });
                
                console.log(`✅ Welcome sent to ${userName} in ${groupName}`);
            }

            // ========== GOODBYE ==========
            else if (action === "remove") {
                // 🔥 CHECK IF GOODBYE IS ENABLED
                if (!isGoodbyeEnabled(id)) {
                    console.log(`⏭️ Goodbye disabled for ${id}, skipping...`);
                    continue;
                }
                
                sentMessages.add(msgKey);
                setTimeout(() => sentMessages.delete(msgKey), 5000);

                const goodbyeText = `
╭───❖ 😢 *GOODBYE* ❖───
│ 👋 Farewell @${userName}!
│ 🏠 You left: *${groupName}*
╰❖ *_ᴘᴏᴡᴇʀᴇᴅ ʙʏ 𝙏𝙝𝙚 𝙏𝙚𝙘𝙝𝙓_* ❖─
                `.trim();

                await conn.sendMessage(id, {
                    image: { url: userPpUrl },
                    caption: goodbyeText,
                    mentions: [participant],
                    contextInfo: getContextInfo([participant]),
                });
                
                console.log(`✅ Goodbye sent to ${userName} from ${groupName}`);
            }
        }

    } catch (err) {
        console.error("GroupEvents error:", err);
    }
};