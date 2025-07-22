module.exports = {
  name: 'trackStuck',
  async execute(client, player, track, thresholdMs) {
    const channel = client.channels.cache.get(player.textChannelId);

    // Check if there are more songs in the queue
    if (player.queue.size > 0) {
      if (channel) {
        channel.send(
          `⚠️ The track \`${track.info.title}\` got stuck. Skipping to the next one.`
        );
      }
      // If the queue has songs, it's safe to skip.
      await player.skip();
    } else {
      if (channel) {
        channel.send(
          `⚠️ The track \`${track.info.title}\` was the last song and it got stuck. The player has been stopped.`
        );
      }
      // If the queue is empty, destroy the player to prevent errors.
      await player.destroy();
    }
  },
};
