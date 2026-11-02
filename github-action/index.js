// Useful Work preview check, a GitHub Action with no dependencies. It asks Useful Work to compare a
// pull request's preview deploy with the live site, then posts what the change would put live
// (missing pages, new broken links and images, placeholder text, a stray noindex and the like) as
// one comment on the pull request, updated in place on each new preview.
const fs = require("node:fs");

const MARKER = "<!-- useful-work-preview-check -->";
const input = (name, fallback = "") => (process.env[`INPUT_${name.toUpperCase()}`] ?? fallback).trim();
const output = (key, value) => process.env.GITHUB_OUTPUT && fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
const fail = (message) => {
  console.log(`::error::${message}`);
  process.exit(1);
};

async function github(path, init = {}) {
  const res = await fetch(`${process.env.GITHUB_API_URL || "https://api.github.com"}${path}`, {
    ...init,
    headers: { authorization: `Bearer ${input("github_token")}`, accept: "application/vnd.github+json", "content-type": "application/json", "user-agent": "useful-work-preview-check" },
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status} for ${path}: ${(await res.text()).slice(0, 200)}`);
  return res.status === 204 ? null : res.json();
}

/** The pull request this run belongs to: from the event, or the open one for a deployment's commit. */
async function pullRequest(event, repo) {
  const direct = event.pull_request?.number ?? (event.issue?.pull_request ? event.issue.number : undefined);
  if (direct) return direct;
  const sha = event.deployment?.sha;
  if (!sha || !repo || !input("github_token")) return undefined;
  const prs = await github(`/repos/${repo}/commits/${sha}/pulls`);
  return prs.find((p) => p.state === "open")?.number;
}

async function main() {
  const apiKey = input("api_key");
  const site = input("site");
  if (!apiKey || !site) fail("Set api_key (a Useful Work API key that can re-check sites) and site (your live domain).");
  const event = process.env.GITHUB_EVENT_PATH && fs.existsSync(process.env.GITHUB_EVENT_PATH) ? JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8")) : {};
  if (event.deployment_status && event.deployment_status.state !== "success") return console.log("The preview isn't ready yet, so there's nothing to check.");
  const previewUrl = input("preview_url") || event.deployment_status?.environment_url || event.deployment_status?.target_url || "";
  if (!previewUrl) fail("No preview address: set preview_url, or run this on deployment_status events from Vercel or Netlify.");

  const paths = input("paths").split(/[\n,]/).map((p) => p.trim()).filter(Boolean);
  const res = await fetch(`${input("api_base", "https://usefulwork.app").replace(/\/$/, "")}/api/pr-check`, {
    method: "POST",
    headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({ site, previewUrl, paths: paths.length ? paths : undefined, mode: input("mode", "changed") || "changed", bypassToken: input("vercel_bypass") || undefined }),
  });
  const result = await res.json().catch(() => ({}));
  if (!res.ok) fail(`Useful Work couldn't check the preview: ${typeof result.error === "string" ? result.error : (result.error?.message ?? res.status)}`);

  console.log(result.markdown);
  output("problems", result.problems.length);
  output("pages_changed", result.pages.filter((p) => p.change !== "same").length);

  const repo = process.env.GITHUB_REPOSITORY;
  const pr = await pullRequest(event, repo).catch((err) => console.log(`::warning::${err.message}`));
  if (!pr || !repo) {
    console.log("Not running on a pull request, so no comment was posted.");
  } else {
    const comments = await github(`/repos/${repo}/issues/${pr}/comments?per_page=100`);
    const mine = comments.find((c) => c.body?.includes(MARKER));
    if (mine) await github(`/repos/${repo}/issues/comments/${mine.id}`, { method: "PATCH", body: JSON.stringify({ body: result.markdown }) });
    else await github(`/repos/${repo}/issues/${pr}/comments`, { method: "POST", body: JSON.stringify({ body: result.markdown }) });
    console.log(`${mine ? "Updated" : "Posted"} the comment on pull request #${pr}.`);
  }
  if (input("fail_on_problems") === "true" && result.problems.length) fail(`This change would put ${result.problems.length} problem${result.problems.length === 1 ? "" : "s"} live.`);
}

main().catch((err) => fail(err.message));
