module.exports = {
  command: ["tagall"],
  desc: "Mention all group members",
  category: "Group",

  run: async ({ trashcore, chat, m, xreply, isOwner, text }) => {
    try {
      if (!chat.endsWith("@g.us"))
        return xreply("⚠️ This command is only for groups.");

      if (!isOwner) return xreply("⚠️ Only the bot owner can use .tagall");

      const group = await trashcore.groupMetadata(chat);
      const participants = group.participants;

      if (!participants || participants.length === 0)
        return xreply("⚠️ Could not fetch group members.");
      const mentionText = text ? text + "\n\n" : "";
      const message = mentionText + participants.map(p => `@${p.id.split("@")[0]}`).join(" ");

      await trashcore.sendMessage(chat, {
        text: message,
        mentions: participants.map(p => p.id),
      });

    } catch (err) {
      console.error("TagAll Error:", err);
      return xreply("❌ Failed to mention all members.");
    }
  },
};