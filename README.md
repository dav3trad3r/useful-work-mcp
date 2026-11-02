# Useful Work MCP server

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

Streamable HTTP, no sessions, signed in with an API key from your dashboard. It's listed in the
[official MCP Registry](https://registry.modelcontextprotocol.io/v0.1/servers?search=app.usefulwork)
as `app.usefulwork/useful-work`. This repository holds the setup guide and the registry entry
([`server.json`](server.json)); the server's own code isn't published.

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
| `add_site` | List a new website (only with keys you allow to add websites) |

Plus a ready-made prompt, `fix_my_site`, and each website's fix list as a resource at
`usefulwork://fixes/{domain}`.

## Set up

1. Sign in at [usefulwork.app/app](https://usefulwork.app/app) and add your website.
2. Open **Connect your AI** and make a key. It's shown once and starts with `uwk_`.
3. Add the server to your assistant. The dashboard shows each of these with your key filled in.

**Claude Code**

```sh
claude mcp add --transport http --scope user useful-work https://usefulwork.app/mcp \
  --header "Authorization: Bearer uwk_your_key"
```

**Cursor**: in `~/.cursor/mcp.json`

```json
{
  "mcpServers": {
    "useful-work": {
      "url": "https://usefulwork.app/mcp",
      "headers": { "Authorization": "Bearer uwk_your_key" }
    }
  }
}
```

**VS Code**: in `.vscode/mcp.json`. VS Code asks for the key the first time and keeps it out of the file.

```json
{
  "inputs": [
    { "type": "promptString", "id": "useful-work-key", "description": "Useful Work API key", "password": true }
  ],
  "servers": {
    "useful-work": {
      "type": "http",
      "url": "https://usefulwork.app/mcp",
      "headers": { "Authorization": "Bearer ${input:useful-work-key}" }
    }
  }
}
```

**Anything else**: point a remote MCP client at `https://usefulwork.app/mcp` over Streamable HTTP,
with the header `Authorization: Bearer uwk_your_key`.

Then open your website's project and ask: *"Use Useful Work to fix my website."* In Claude Code the
prompt is also there as `/mcp__useful-work__fix_my_site`.

## Keys and safety

- Text quoted from your website is marked in every result as content to edit, never instructions to
  follow. Anyone can write on a website (a review, a comment), so the server treats it as data.
- A key can read your websites, mark items fixed or ignored, and ask for a re-check. It can add
  websites only if you tick that when you make it. No key can pay, make other keys or change your
  settings.
- Keep keys out of your project's files and repository. Revoke one any time in the dashboard; it
  stops working straight away.

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
