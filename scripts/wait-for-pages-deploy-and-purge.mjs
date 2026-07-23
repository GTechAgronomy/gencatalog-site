const required = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ZONE_ID",
  "GITHUB_TOKEN",
  "GITHUB_REPOSITORY",
  "GITHUB_SHA",
];

for (const name of required) {
  if (!process.env[name]) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

const {
  CLOUDFLARE_API_TOKEN: cloudflareToken,
  CLOUDFLARE_ZONE_ID: zoneId,
  GITHUB_TOKEN: githubToken,
  GITHUB_REPOSITORY: repository,
  GITHUB_SHA: commit,
} = process.env;

const checkRunsUrl =
  `https://api.github.com/repos/${repository}/commits/${commit}/check-runs`;

let deployed = false;
for (let attempt = 1; attempt <= 40; attempt += 1) {
  const response = await fetch(checkRunsUrl, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${githubToken}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}: ${JSON.stringify(body)}`);
  }

  const pages = body.check_runs?.find(
    (run) =>
      run.name === "Cloudflare Pages" &&
      run.app?.name === "Cloudflare Workers and Pages"
  );

  if (pages?.status === "completed" && pages.conclusion === "success") {
    console.log(`Cloudflare Pages deployment succeeded: ${pages.details_url}`);
    deployed = true;
    break;
  }

  if (pages?.status === "completed" && pages.conclusion !== "success") {
    throw new Error(
      `Cloudflare Pages deployment concluded with ${pages.conclusion}`
    );
  }

  console.log(`Waiting for Cloudflare Pages check (${attempt}/40)...`);
  await new Promise((resolve) => setTimeout(resolve, 15_000));
}

if (!deployed) {
  throw new Error(`Timed out waiting for Cloudflare Pages deployment of ${commit}`);
}

const purgeResponse = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cloudflareToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ purge_everything: true }),
  }
);
const purgeBody = await purgeResponse.json();

if (!purgeResponse.ok || !purgeBody.success) {
  throw new Error(
    `Cloudflare purge failed: ${JSON.stringify(purgeBody.errors || purgeBody)}`
  );
}

console.log(`Cloudflare cache purged for zone ${zoneId}.`);
