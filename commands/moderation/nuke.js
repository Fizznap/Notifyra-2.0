const {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} = require('discord.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nuke')
    .setDescription(
      'Nuke the current text channel by cloning it and deleting the original.'
    ),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ManageChannels')) {
      return interaction.reply({
        content: 'You do not have `ManageChannels` permission!',
        ephemeral: true,
      });
    }
    const channelToNuke = interaction.channel;

    if (channelToNuke.type !== 0) {
      // 0 represents a GUILD_TEXT channel
      return interaction.reply({
        content: 'This command can only be used in text channels.',
        ephemeral: true,
      });
    }

    try {
      const channelPosition = channelToNuke.position;
      const newChannel = await channelToNuke.clone({
        position: channelPosition,
        reason: `Channel nuked by ${interaction.user.tag}`,
      });

      await channelToNuke.delete(`Nuked by ${interaction.user.tag}`);

      const attachment = new AttachmentBuilder(
        path.join(__dirname, '../../utils/nuke.gif')
      );
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('💣 Channel Nuked! 💣')
        .setImage('attachment://nuke.gif')
        .setFooter({ text: `Nuked by ${interaction.user.tag}` })
        .setTimestamp();

      const nukeMessage = await newChannel.send({
        embeds: [embed],
        files: [attachment],
      });

      // Deletes the "Channel Nuked!" message after 30 seconds
      setTimeout(async () => {
        try {
          await nukeMessage.delete();
        } catch (error) {
          // Ignores the error if the message is already deleted (Error Code 10008)
          if (error.code !== 10008) {
            console.error(
              'Failed to delete the nuke confirmation message:',
              error
            );
          }
        }
      }, 30000);
    } catch (error) {
      console.error('Error during nuke operation:', error);
      await interaction.reply({
        content: 'There was an error trying to nuke this channel.',
        ephemeral: true,
      });
    }
  },
};
