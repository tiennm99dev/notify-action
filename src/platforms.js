/**
 * @typedef {(name: string) => string} InputReader
 */

/**
 * Read an input that the selected platform cannot work without.
 * @param {InputReader} getInput Reads an action input by name.
 * @param {string} name Input name.
 * @param {string} platform Platform that needs the input.
 * @returns {string} Input value.
 */
function requireInput(getInput, name, platform) {
  const value = getInput(name);
  if (!value) {
    throw new Error(`${name} is required when platform is ${platform}`);
  }
  return value;
}

/**
 * POST a JSON body and fail with the API's own error text on a non-2xx reply.
 * @param {string} url Endpoint URL.
 * @param {object} body JSON body.
 * @param {string} label Platform name used in error messages.
 * @returns {Promise<string>} Raw response body.
 */
async function postJson(url, body, label) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${label} API error (HTTP ${response.status}): ${text}`);
  }
  return text;
}

/**
 * Send a message through the Telegram Bot API using HTML parse mode.
 * @param {string} message Message text.
 * @param {InputReader} getInput Reads an action input by name.
 * @returns {Promise<void>}
 */
export async function sendTelegram(message, getInput) {
  const token = requireInput(getInput, 'telegram_bot_token', 'telegram');
  const chatId = requireInput(getInput, 'telegram_chat_id', 'telegram');

  const text = await postJson(
    `https://api.telegram.org/bot${token}/sendMessage`,
    { chat_id: chatId, text: message, parse_mode: 'HTML' },
    'Telegram',
  );
  if (JSON.parse(text).ok !== true) {
    throw new Error(`Telegram API error: ${text}`);
  }
}

/**
 * Send a message through a Discord channel webhook.
 * @param {string} message Message text (Discord markdown).
 * @param {InputReader} getInput Reads an action input by name.
 * @returns {Promise<void>}
 */
export async function sendDiscord(message, getInput) {
  const webhookUrl = requireInput(getInput, 'discord_webhook_url', 'discord');
  await postJson(webhookUrl, { content: message }, 'Discord');
}

export const senders = {
  telegram: sendTelegram,
  discord: sendDiscord,
};
