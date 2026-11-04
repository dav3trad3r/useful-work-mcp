# Useful Work preview check

This Action has its own repository, [dav3trad3r/useful-work-preview-check](https://github.com/dav3trad3r/useful-work-preview-check); use it as `dav3trad3r/useful-work-preview-check@v1`. This copy stays so existing workflows keep working.

Checks each pull request's preview against your live site and posts one comment on the pull request with anything the change would put live:

- pages that work live but are missing from the preview
- new links and images that don't work
- placeholder text ("Lorem ipsum", "[COMPANY NAME — to be completed]")
- a `noindex` that would hide the page from Google
- scripts or images loaded over http on an https page
- a lost page title, description or mobile layout tag

Problems already on the live site aren't repeated: your Useful Work dashboard watches those. Wording is proofread once the change is live.

## Set up

1. Add the site to your [Useful Work](https://usefulwork.app/agencies) account.
2. In the dashboard, under **Connect your AI**, make an API key that can re-check sites. Save it as a repository secret named `USEFUL_WORK_API_KEY`.
3. Add a workflow.

### Vercel or Netlify (deployment_status)

Vercel and Netlify report each preview to GitHub as a deployment, with its address:

```yaml
name: Preview check
on: deployment_status
permissions:
  pull-requests: write
  contents: read
jobs:
  check:
    if: github.event.deployment_status.state == 'success' && github.event.deployment.environment != 'Production'
    runs-on: ubuntu-latest
    steps:
      - uses: dav3trad3r/useful-work-preview-check@v1
        with:
          api_key: ${{ secrets.USEFUL_WORK_API_KEY }}
          site: example.com
```

### Any host with a predictable preview address (pull_request)

```yaml
name: Preview check
on: pull_request
permissions:
  pull-requests: write
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: dav3trad3r/useful-work-preview-check@v1
        with:
          api_key: ${{ secrets.USEFUL_WORK_API_KEY }}
          site: example.com
          preview_url: https://deploy-preview-${{ github.event.number }}--example.netlify.app
```

## Options

| Input | What it does |
|---|---|
| `api_key` | Required. A Useful Work API key that can re-check sites. |
| `site` | Required. The live domain as listed in Useful Work. |
| `preview_url` | The preview's address. Read from the deployment when empty. |
| `paths` | Pages to compare, one per line. Empty: the site's known pages and the preview's sitemap. |
| `mode` | `changed` (default) reports what differs from the live site; `all` checks every listed page in full. |
| `vercel_bypass` | Vercel's Protection Bypass for Automation secret, if previews need a login. |
| `fail_on_problems` | `true` fails the check when there are problems. |

Outputs: `problems` (how many) and `pages_changed`.
