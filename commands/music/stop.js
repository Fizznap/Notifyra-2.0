const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stops the music and clears the queue.'),
  async execute(interaction) {
    const player = interaction.client.lavalink.players.get(interaction.guild.id);

    if (!player) {
      return interaction.reply({
        content: '❌ Nothing is playing.',
        ephemeral: true,
      });
    }

    if (player.voiceChannelId !== interaction.member.voice.channel?.id) {
        return interaction.reply({
            content: '❌ You must be in the same voice channel as the bot.',
            ephemeral: true
        });
    }

    player.queue.clear();
    await player.stop();
    return interaction.reply({ content: '⏹️ Music stopped and queue cleared.' });
  },
};
