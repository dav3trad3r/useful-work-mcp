# Useful Work MCP server

[![mcptry](https://mcptry.com/badge/app.usefulwork/useful-work)](https://mcptry.com/servers/app.usefulwork/useful-work)

Fix your website from your own AI assistant. [Useful Work](https://usefulwork.app) checks websites
for typos, wrong facts, out-of-date text, broken links and images, slow pages, and security
certificates and domains that are about to run out. A problem is only reported once at least two
agents agree on it.

Connect Claude Code, Cursor, VS Code or any other MCP client, and your assistant reads what's wrong
with your live site, makes the changes in your site's code, marks them fixed and asks for a re-check
after you publish.

The server is hosted. Connect to it at:

```
https://usefulwork.app/mcp
```

Streamable HTTP with OAuth sign-in: the first time your assistant connects, a Useful Work page
opens for you to approve it. It's listed in the
[official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=app.usefulwork)
as `app.usefulwork/useful-work`. This repository holds the setup guide, the registry entry
([`server.json`](server.json)) and an agent plugin; the server's own code isn't published.

## What your assistant can do

| Tool | What it does |
| --- | --- |
| `list_sites` | Your websites, what each is doing, and how many problems each has to fix |
| `site_health` | A website's health score out of 100 and what took points off |
| `get_fixes` | Everything still to fix, with where it is on the page and the suggested change |
| `mark_fixed` | Clear wording you've fixed, by the IDs from `get_fixes` |
| `ignore` | Clear anything that isn't really a problem |
| `recheck` | Read the website again after you publish; fixed items confirm themselves |
| `credit` | Your checking credit, and where to add more |
| `add_site` | List a new website (only if you allowed it when you connected) |

Plus a ready-made prompt, `fix_my_site`, and each website's fix list as a resource at
`usefulwork://fixes/{domain}`.

## Set up

1. Sign in at [usefulwork.app/app](https://usefulwork.app/app) and add your website.
2. Add the server to your assistant.
3. Approve it on the Useful Work page that opens the first time it connects. It then shows under
   **Connect your AI** in your dashboard, where you can disconnect it any time.

**Claude Code**: run this, then type `/mcp` and choose Authenticate.

```sh
claude mcp add --transport http --scope user useful-work https://usefulwork.app/mcp
```

**Cursor**: in `~/.cursor/mcp.json`, then click Needs login next to Useful Work.

```json
{
  "mcpServers": {
    "useful-work": { "url": "https://usefulwork.app/mcp" }
  }
}
```

**VS Code**: in `.vscode/mcp.json`. VS Code asks you to sign in the first time it connects.

```json
{
  "servers": {
    "useful-work": { "type": "http", "url": "https://usefulwork.app/mcp" }
  }
}
```

**Cline**: in `cline_mcp_settings.json`, with an API key from **Connect your AI** (see
[llms-install.md](llms-install.md)).

```json
{
  "mcpServers": {
    "useful-work": { "type": "streamableHttp", "url": "https://usefulwork.app/mcp", "headers": { "Authorization": "Bearer uwk_YOUR_KEY" } }
  }
}
```

**Claude.ai, ChatGPT and other apps**: add a custom connector with the address
`https://usefulwork.app/mcp`.

**Assistants that can't sign in**: make an API key under **Connect your AI** in your dashboard and
send it as the header `Authorization: Bearer uwk_…`.

Then open your website's project and ask: *"Use Useful Work to fix my website."* In Claude Code the
prompt is also there as `/mcp__useful-work__fix_my_site`.

## Pull-request checks

[`github-action`](github-action) is a GitHub Action for teams that look after websites: on every pull
request it compares the preview deploy with the live site and comments with any page, link, image or
launch problem the change would put live. Setup is in its [README](github-action/README.md).

## As an agent plugin

This repository is also an [Agent Plugin](https://open-plugins.com): [`plugin.json`](plugin.json),
the server in [`mcp.json`](mcp.json), and one skill, [`fix-website`](skills/fix-website/SKILL.md),
which gets the fix list, changes the code, marks items fixed and asks for a re-check after you
publish. The server signs in on its own, so the plugin carries no secrets.

## Safety

- Text quoted from your website is marked in every result as content to edit, never instructions to
  follow. Anyone can write on a website (a review, a comment), so the server treats it as data.
- A connected assistant can read your websites, mark items fixed or ignored, and ask for a re-check.
  It can add websites only if you tick that when you approve it. It can't pay or change your
  settings.
- Disconnect an assistant, or revoke a key, any time in your dashboard; it stops working straight
  away. Keep keys out of your project's files and repository.

## What it costs

Connecting is free. Checking is paid from prepaid card credit, at $0.003 a check: each paragraph
gets three checks, each link or image two. A 30-page website costs about $3.37 to check in full;
after that only new or changed text is checked. Re-reading pages is free. There's no subscription.
See [pricing](https://usefulwork.app/#pricing).

## Links

- Website: [usefulwork.app](https://usefulwork.app)
- Setup for builders: [usefulwork.app/builders](https://usefulwork.app/builders#mcp)
- Terms: [usefulwork.app/terms](https://usefulwork.app/terms) · Privacy: [usefulwork.app/privacy](https://usefulwork.app/privacy)
- Contact: hello@usefulwork.app

Useful Work is made by Tokenise Pty Ltd. The documentation in this repository is MIT licensed.
