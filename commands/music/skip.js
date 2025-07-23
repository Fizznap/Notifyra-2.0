const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skips the current song.'),
  async execute(interaction) {
    const player = interaction.client.lavalink.players.get(interaction.guild.id);

    if (!player || !player.queue.current) {
      return interaction.reply({
        content: '❌ There is nothing to skip.',
        ephemeral: true,
      });
    }

    if (player.voiceChannelId !== interaction.member.voice.channel?.id) {
        return interaction.reply({
            content: '❌ You must be in the same voice channel as the bot.',
            ephemeral: true
        });
    }

    await player.skip();
    return interaction.reply({ content: '⏭️ Song skipped.' });
  },
};
