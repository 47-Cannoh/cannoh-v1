const { getSetting } = require("../../database");
const { plugins } = require("../../pluginStore");

function formatUptime(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);

  return parts.join(" ");
}

function groupByCategory(pluginsMap) {
  const categories = {};
  for (const plugin of pluginsMap.values()) {
    const category = plugin.category || "🗂️ Uncategorized";
    if (!categories[category]) categories[category] = [];

    const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
    for (const cmd of cmds) {
      const formattedCmd = plugin.isOwner ? `${cmd} (owner)` : cmd;
      if (!categories[category].includes(formattedCmd)) {
        categories[category].push(formattedCmd);
      }
    }
  }
  return categories;
}

module.exports = {
  command: ["menu", "help"],
  desc: "⛩️ Show the command list and bot status",
  run: async ({ trashcore, chat, botStartTime }) => {
    const startTime = botStartTime || global.botStartTime || Date.now();
    const uptimeSeconds = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
    const uptime = formatUptime(uptimeSeconds);

    const prefix = await getSetting("prefix", ".");
    const privateMode = await getSetting("privateMode", false);
    const mode = privateMode ? "🔒 PRIVATE" : "🌐 PUBLIC";
    const totalPlugins = plugins.size;
    const groupedCommands = groupByCategory(plugins);

    // Header
    let menuText = `
╭───╼[ 🥷 *CANNOH-MD BOT MENU* ]
│
│ 🤖 *Creator:* CANNOH
│ 🛠️ *Mode:* ${mode}
│ 🧩 *Plugins:* ${totalPlugins}
│ ⏱️ *Uptime:* ${uptime}
│ ✨ *Prefix:* ${prefix}
╰━━━━━━━━━━━━━━━━━━━┅┅┅
`;

    // Commands
    for (const [category, cmds] of Object.entries(groupedCommands)) {
      cmds.sort();
      menuText += `\n╭───╼[ ${category.toUpperCase()} ]\n`;
      menuText += cmds.map(cmd => `│ ➤ ${prefix}${cmd}`).join("\n");
      menuText += `\n╰━━━━━━━━━━━━━━━━━━━┅┅┅\n`;
    }

    const botImageUrl = "https://files.catbox.moe/en2v4a.jpg";

    await trashcore.sendMessage(chat, {
      image: { url: botImageUrl },
      caption: menuText.trim(),
    });
  },
};
