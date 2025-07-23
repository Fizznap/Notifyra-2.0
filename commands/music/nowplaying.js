const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { formatTime, createProgressBar } = require('../../utils/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('Shows the currently playing song with controls.'),

  async execute(interaction) {
    const { client, guild } = interaction;
    const player = client.lavalink.players.get(guild.id);

    if (!player || !player.queue.current) {
      return interaction.reply({ content: '🎵 Nothing is playing right now.', ephemeral: true });
    }

    const track = player.queue.current;
    const progressBar = createProgressBar(player.position, track.info.duration, 15);

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setAuthor({ name: 'Now Playing', iconURL: guild.iconURL() })
      .setTitle(track.info.title)
      .setURL(track.info.uri)
      .setThumbnail(track.info.artworkUrl)
      .setDescription(`**Author:** \`${track.info.author}\`\n**Requested by:** ${track.requester}\n\n\`${formatTime(player.position)}\` ${progressBar} \`${formatTime(track.info.duration)}\``);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('np_pause_resume')
        .setLabel(player.paused ? '▶️ Resume' : '⏸️ Pause')
        .setStyle(player.paused ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('np_skip')
        .setLabel('⏭️ Skip')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('np_stop')
        .setLabel('⏹️ Stop')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('np_loop')
        .setLabel('🔁 Loop')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};
