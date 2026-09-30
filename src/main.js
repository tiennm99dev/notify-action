import * as core from '@actions/core';
import { readRunContext } from './context.js';
import { defaultMessage } from './format.js';
import { senders } from './platforms.js';

/**
 * Run the action: resolve the message and send it to the selected platform.
 * @returns {Promise<void>}
 */
export async function run() {
  try {
    const platform = core.getInput('platform').toLowerCase();
    const status = core.getInput('status') || 'success';

    const send = senders[platform];
    if (!send) {
      throw new Error(`Unsupported platform: ${platform} (expected one of ${Object.keys(senders).join(', ')})`);
    }

    const message = core.getInput('message') || defaultMessage(platform, status, readRunContext());
    await send(message, (name) => core.getInput(name));

    core.info(`Notification sent to ${platform}.`);
  } catch (error) {
    core.setFailed(`Action failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
