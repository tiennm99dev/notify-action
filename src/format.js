/** @typedef {import('./context.js').RunContext} RunContext */

const STATUS_EMOJI = {
  success: '✅',
  failure: '❌',
  cancelled: '⚪',
};

/**
 * Pick the emoji shown for a workflow status.
 * @param {string} status Workflow status.
 * @returns {string} Emoji for the status, or a bell for anything else.
 */
function statusEmoji(status) {
  return STATUS_EMOJI[status] || '🔔';
}

/**
 * Escape text for Telegram's HTML parse mode.
 * @param {string} text Raw text.
 * @returns {string} Text safe to embed in Telegram HTML.
 */
export function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Build the default notification in the markup each platform understands.
 * @param {'telegram' | 'discord'} platform Target platform.
 * @param {string} status Workflow status.
 * @param {RunContext} ctx Workflow run details.
 * @returns {string} Formatted message.
 */
export function defaultMessage(platform, status, ctx) {
  const emoji = statusEmoji(status);

  if (platform === 'telegram') {
    const e = escapeHtml;
    return [
      `${emoji} <b>GitHub Action</b>: ${e(ctx.workflow)} #${e(ctx.runNumber)}`,
      `<b>Repository</b>: ${e(ctx.repo)}`,
      `<b>Status</b>: ${e(status)}`,
      `<b>Commit</b>: ${e(ctx.sha)}`,
      `<a href="${e(ctx.runUrl)}">View Run Details</a>`,
    ].join('\n');
  }

  return [
    `${emoji} **GitHub Action**: ${ctx.workflow} #${ctx.runNumber}`,
    `**Repository**: ${ctx.repo}`,
    `**Status**: ${status}`,
    `**Commit**: \`${ctx.sha}\``,
    `[View Run Details](<${ctx.runUrl}>)`,
  ].join('\n');
}
