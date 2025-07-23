const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resumes the current song.'),
  async execute(interaction) {
    const player = interaction.client.lavalink.players.get(interaction.guild.id);

    if (!player || !player.paused) {
      return interaction.reply({
        content: '❌ Nothing is currently paused.',
        ephemeral: true,
      });
    }

    if (player.voiceChannelId !== interaction.member.voice.channel?.id) {
        return interaction.reply({
            content: '❌ You must be in the same voice channel as the bot.',
            ephemeral: true
        });
    }

    await player.resume();
    return interaction.reply({ content: '▶️ Playback resumed.' });
  },
};
