# notify-action

A GitHub Action that sends notifications to messaging platforms when your workflows run.

![GitHub release](https://img.shields.io/github/v/release/tiennm99dev/notify-action)
![GitHub](https://img.shields.io/github/license/tiennm99dev/notify-action)

## Features

- Send a notification from any workflow step
- Default message summarizes the run (workflow, repository, status, commit, run link), formatted for each platform
- Supported platforms:
  - ✅ Telegram
  - ✅ Discord

## Setup

### Telegram

1. Create a Telegram bot using [@BotFather](https://t.me/botfather) and obtain the bot token
2. Get your chat ID:
   - Add [@userinfobot](https://t.me/userinfobot) to your chat
   - Start the chat, and it will display your chat ID
3. Store these as repository secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`

### Discord

1. In the Discord channel settings, open **Integrations → Webhooks** and create a webhook
2. Copy the webhook URL and store it as the repository secret `DISCORD_WEBHOOK_URL`

## Usage

```yaml
steps:
  # Your workflow steps here...

  - name: Send Notification
    uses: tiennm99dev/notify-action@v1
    with:
      platform: telegram
      telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
      telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
      message: "🚀 Deployment completed successfully!"
```

### Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `platform` | Messaging platform to use (`telegram`, `discord`) | Yes | `telegram` |
| `message` | The message content to send | No | Run summary formatted for the platform |
| `status` | Workflow status shown in the default message (`success`, `failure`, `cancelled`, or custom text) | No | `success` |
| `telegram_bot_token` | Telegram Bot API token | For Telegram | - |
| `telegram_chat_id` | Telegram chat ID to send the message to | For Telegram | - |
| `discord_webhook_url` | Discord channel webhook URL | For Discord | - |

### Message formatting

A custom `message` is sent as-is, so use the markup the platform understands:

- **Telegram**: HTML (`<b>`, `<i>`, `<a href="...">`). Escape literal `<`, `>`, and `&` as `&lt;`, `&gt;`, `&amp;`.
- **Discord**: Markdown (`**bold**`, `*italic*`, `[text](url)`). Messages are limited to 2000 characters.

## Examples

### Report the job outcome

`job.status` is `success`, `failure`, or `cancelled`; `if: always()` makes the step run in every case.

```yaml
- name: Notify
  if: always()
  uses: tiennm99dev/notify-action@v1
  with:
    platform: telegram
    status: ${{ job.status }}
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

### Custom HTML message (Telegram)

```yaml
- name: Notify with Custom Message
  uses: tiennm99dev/notify-action@v1
  with:
    platform: telegram
    message: "<b>Release v1.0.0</b> has been <i>deployed</i> to production! 🎉"
    telegram_bot_token: ${{ secrets.TELEGRAM_BOT_TOKEN }}
    telegram_chat_id: ${{ secrets.TELEGRAM_CHAT_ID }}
```

### Discord on failure

```yaml
- name: Notify on Failure
  if: failure()
  uses: tiennm99dev/notify-action@v1
  with:
    platform: discord
    status: failure
    discord_webhook_url: ${{ secrets.DISCORD_WEBHOOK_URL }}
```

## Development

Requires Node.js 24 and npm.

```bash
git clone https://github.com/tiennm99dev/notify-action.git
cd notify-action
npm ci

npm run lint   # ESLint with JSDoc rules
npm test       # node:test unit tests
npm run build  # bundle into dist/ with ncc
```

The action runs from the bundled `dist/index.js`, so commit `dist/` together with source changes. CI fails when `dist/` does not match a fresh build.

### Releasing

Publish a GitHub release with a `vX.Y.Z` tag. The release workflow moves the matching major tag (for example `v1`) to that release, which is what `uses: tiennm99dev/notify-action@v1` resolves to.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.
