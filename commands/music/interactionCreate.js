const { InteractionType, EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    const { client } = interaction;

    // --- Slash Command Handler ---
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
      return;
    }

    // --- Autocomplete Handler ---
    if (interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName);
        if (!command || !command.autocomplete) return;
        try {
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(`Error in autocomplete for ${interaction.commandName}:`, error);
        }
        return;
    }


    // --- Button Handler ---
    if (interaction.isButton()) {
      const player = client.lavalink.players.get(interaction.guild.id);
      if (!player || !interaction.member.voice.channel || player.voiceChannelId !== interaction.member.voice.channel.id) {
        return interaction.reply({
          content: '❌ You must be in the same voice channel as the bot to use these buttons.',
          ephemeral: true,
        });
      }

      // Defer update to acknowledge the button press immediately
      await interaction.deferUpdate();

      switch (interaction.customId) {
        case 'np_pause_resume':
          if (player.paused) {
            await player.resume();
          } else {
            await player.pause();
          }
          // Re-run the nowplaying command to update the message with the new button state
          const nowPlayingCommand = client.commands.get('nowplaying');
          if (nowPlayingCommand) {
              await interaction.message.delete(); // Delete old message
              await nowPlayingCommand.execute(interaction); // Send new one
          }
          break;

        case 'np_skip':
          await player.skip();
          await interaction.message.delete(); // Delete the nowplaying message as it's no longer relevant
          break;

        case 'np_stop':
          player.queue.clear();
          await player.stop();
          await interaction.message.delete(); // Delete the nowplaying message
          break;

        case 'np_loop':
          const currentMode = player.repeatMode;
          if (currentMode === 'off') player.setRepeatMode('track');
          else if (currentMode === 'track') player.setRepeatMode('queue');
          else player.setRepeatMode('off');
          
          // Re-run nowplaying to show updated loop status (optional)
          const npCommand = client.commands.get('nowplaying');
          if (npCommand) {
              await interaction.message.delete();
              await npCommand.execute(interaction);
          }
          break;
      }
      return;
    }

    // --- Select Menu Handler (if you have any) ---
    if (interaction.isStringSelectMenu()) {
        // Your select menu logic would go here
        return;
    }
  },
};
