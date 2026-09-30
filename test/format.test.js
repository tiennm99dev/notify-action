import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readRunContext } from '../src/context.js';
import { defaultMessage, escapeHtml } from '../src/format.js';

const ctx = readRunContext({
  GITHUB_SERVER_URL: 'https://github.com',
  GITHUB_REPOSITORY: 'owner/repo',
  GITHUB_WORKFLOW: 'CI <main>',
  GITHUB_RUN_ID: '42',
  GITHUB_RUN_NUMBER: '7',
  GITHUB_SHA: 'abcdef1234567890',
});

test('readRunContext builds the run URL and short SHA', () => {
  assert.equal(ctx.runUrl, 'https://github.com/owner/repo/actions/runs/42');
  assert.equal(ctx.sha, 'abcdef1');
});

test('escapeHtml escapes Telegram HTML metacharacters', () => {
  assert.equal(escapeHtml('a & <b> "c"'), 'a &amp; &lt;b&gt; &quot;c&quot;');
});

test('telegram default message is HTML with escaped values', () => {
  const msg = defaultMessage('telegram', 'success', ctx);
  assert.match(msg, /^✅ <b>GitHub Action<\/b>: CI &lt;main&gt; #7/);
  assert.match(msg, /<a href="https:\/\/github.com\/owner\/repo\/actions\/runs\/42">/);
});

test('discord default message uses markdown', () => {
  const msg = defaultMessage('discord', 'failure', ctx);
  assert.match(msg, /^❌ \*\*GitHub Action\*\*/);
  assert.match(msg, /\[View Run Details\]\(<https:\/\/github.com\/owner\/repo\/actions\/runs\/42>\)/);
});

test('cancelled status has its own emoji', () => {
  assert.match(defaultMessage('discord', 'cancelled', ctx), /^⚪/);
});
