import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { sendTelegram, sendDiscord } from '../src/platforms.js';

const realFetch = globalThis.fetch;
/** @type {{ url: string, init: { body?: unknown } }[]} */
let calls;
/** @type {Response} */
let reply;

beforeEach(() => {
  calls = [];
  reply = new Response('{"ok":true}', { status: 200 });
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    return reply;
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

/**
 * Build an input reader backed by a plain object.
 * @param {Record<string, string>} values Input values.
 * @returns {(name: string) => string} Input reader.
 */
const inputs = (values) => (name) => values[name] || '';

test('telegram posts HTML message to the bot API', async () => {
  await sendTelegram('<b>hi</b>', inputs({ telegram_bot_token: 'T', telegram_chat_id: '123' }));
  assert.equal(calls[0].url, 'https://api.telegram.org/botT/sendMessage');
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { chat_id: '123', text: '<b>hi</b>', parse_mode: 'HTML' });
});

test('telegram requires token and chat id', async () => {
  await assert.rejects(sendTelegram('x', inputs({ telegram_chat_id: '1' })), /telegram_bot_token is required/);
  await assert.rejects(sendTelegram('x', inputs({ telegram_bot_token: 'T' })), /telegram_chat_id is required/);
});

test('telegram surfaces API errors', async () => {
  reply = new Response('{"ok":false,"description":"chat not found"}', { status: 400 });
  await assert.rejects(
    sendTelegram('x', inputs({ telegram_bot_token: 'T', telegram_chat_id: '1' })),
    /HTTP 400.*chat not found/,
  );
});

test('discord posts content to the webhook', async () => {
  reply = new Response(null, { status: 204 });
  await sendDiscord('hello', inputs({ discord_webhook_url: 'https://discord.com/api/webhooks/1/abc' }));
  assert.equal(calls[0].url, 'https://discord.com/api/webhooks/1/abc');
  assert.deepEqual(JSON.parse(String(calls[0].init.body)), { content: 'hello' });
});

test('discord requires a webhook url', async () => {
  await assert.rejects(sendDiscord('x', inputs({})), /discord_webhook_url is required/);
});
