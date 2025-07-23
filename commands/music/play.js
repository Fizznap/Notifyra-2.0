const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { formatTime } = require('../../utils/utils');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song or playlist')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Song name or URL')
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName('source')
        .setDescription('The source to search from')
        .addChoices(
          { name: 'Youtube', value: 'ytsearch' },
          { name: 'Spotify', value: 'spsearch' },
          { name: 'Soundcloud', value: 'scsearch' }
        )
    ),

  async autocomplete(interaction) {
    // Your existing autocomplete logic is good and can remain here.
    // This example will just use a simplified version for clarity.
    try {
      const query = interaction.options.getFocused();
      if (!query) return await interaction.respond([]);

      const player = interaction.client.lavalink.createPlayer({ guildId: interaction.guild.id });
      const results = await player.search({ query, source: 'ytsearch' });

      return await interaction.respond(
        results.tracks.slice(0, 25).map((track) => ({
          name: `🎵 ${track.info.title} - ${track.info.author}`.slice(0, 100),
          value: track.info.uri,
        }))
      );
    } catch (e) {
      return await interaction.respond([]);
    }
  },

  async execute(interaction) {
    const { client, member, guild, channel } = interaction;
    const query = interaction.options.getString('query');
    const source = interaction.options.getString('source') || 'ytsearch';

    if (!member.voice.channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel to play music.', ephemeral: true });
    }

    const player = client.lavalink.createPlayer({
      guildId: guild.id,
      voiceChannelId: member.voice.channel.id,
      textChannelId: channel.id,
      selfDeaf: true,
      volume: 80,
    });

    if (player.state !== 'CONNECTED') await player.connect();

    await interaction.deferReply();

    const search = await player.search({ query, source }, interaction.user);

    if (search.loadType === 'NO_MATCHES') {
      return interaction.editReply({ content: '❌ No results found for your query.' });
    } else if (search.loadType === 'LOAD_FAILED') {
      return interaction.editReply({ content: `❌ Error loading track: ${search.exception?.message}` });
    }

    const addedEmbed = new EmbedBuilder().setColor('#2ecc71'); // Green for success

    if (search.loadType === 'PLAYLIST_LOADED') {
      player.queue.add(search.tracks);
      addedEmbed
        .setTitle('✅ Playlist Added to Queue')
        .setDescription(`**${search.playlist?.title}** with ${search.tracks.length} tracks.`)
        .setThumbnail(search.tracks[0].info.artworkUrl);
    } else {
      const track = search.tracks[0];
      player.queue.add(track);
      addedEmbed
        .setTitle('✅ Added to Queue')
        .setDescription(`**[${track.info.title}](${track.info.uri})**`)
        .setThumbnail(track.info.artworkUrl)
        .addFields(
          { name: 'Author', value: track.info.author, inline: true },
          { name: 'Duration', value: `\`${formatTime(track.info.duration)}\``, inline: true }
        );
    }

    await interaction.editReply({ embeds: [addedEmbed] });

    if (!player.playing && !player.paused) await player.play();
  },
};
