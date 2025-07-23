const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { formatTime } = require('../../utils/utils');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the music queue.'),
    async execute(interaction) {
        const { client, guild } = interaction;
        const player = client.lavalink.players.get(guild.id);

        if (!player || !player.queue.current) {
            return interaction.reply({ content: '🎵 The queue is empty.', ephemeral: true });
        }

        const queue = player.queue.tracks;
        const tracksPerPage = 10;
        const totalPages = Math.ceil(queue.length / tracksPerPage) || 1;
        let currentPage = 0;

        const generateEmbed = (page) => {
            const start = page * tracksPerPage;
            const end = start + tracksPerPage;
            const currentTracks = queue.slice(start, end);

            const description = currentTracks.map((track, i) =>
                `**${start + i + 1}.** [${track.info.title}](${track.info.uri}) - \`${formatTime(track.info.duration)}\``
            ).join('\n');

            return new EmbedBuilder()
                .setColor('#9b59b6')
                .setTitle('🎵 Music Queue')
                .setDescription(`**Now Playing:** [${player.queue.current.info.title}](${player.queue.current.info.uri})\n\n${description || 'No more tracks in the queue.'}`)
                .setFooter({ text: `Page ${page + 1}/${totalPages} | Total Tracks: ${player.queue.size}` });
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('q_prev')
                .setLabel('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage === 0),
            new ButtonBuilder()
                .setCustomId('q_next')
                .setLabel('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(currentPage >= totalPages - 1)
        );

        const message = await interaction.reply({
            embeds: [generateEmbed(currentPage)],
            components: totalPages > 1 ? [row] : [],
            fetchReply: true,
        });

        if (totalPages <= 1) return;

        const collector = message.createMessageComponentCollector({
            filter: (i) => i.user.id === interaction.user.id,
            time: 60000,
        });

        collector.on('collect', async (i) => {
            if (i.customId === 'q_prev') {
                currentPage--;
            } else if (i.customId === 'q_next') {
                currentPage++;
            }

            const updatedRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('q_prev').setLabel('◀️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage === 0),
                new ButtonBuilder().setCustomId('q_next').setLabel('▶️').setStyle(ButtonStyle.Secondary).setDisabled(currentPage >= totalPages - 1)
            );

            await i.update({
                embeds: [generateEmbed(currentPage)],
                components: [updatedRow],
            });
        });

        collector.on('end', () => message.edit({ components: [] }));
    }
};
