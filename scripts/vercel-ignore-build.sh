#!/bin/bash
# Vercel runs this before every build (vercel.json "ignoreCommand"): exit 0 = skip the build, exit 1 = build.
#
# A push that only touches the mobile app, scripts, ops notes, the WordPress plugin source, the phone worker, load tests, CI
# files or Markdown changes nothing the website is built from, so building it only spends build time. Every build used about
# 15 build-CPU minutes, and one was started for every push.
#
# It compares with the last commit that was BUILT (VERCEL_GIT_PREVIOUS_SHA), not just the one before, so a push of several
# commits is judged as a whole. When that commit is unknown (first build, a new branch, a shallow copy that lacks it) it builds.

if [ -z "$VERCEL_GIT_PREVIOUS_SHA" ] || ! git cat-file -e "$VERCEL_GIT_PREVIOUS_SHA" 2>/dev/null; then
  echo "No earlier build to compare with: building."
  exit 1
fi

if git diff --quiet "$VERCEL_GIT_PREVIOUS_SHA" "${VERCEL_GIT_COMMIT_SHA:-HEAD}" -- . \
  ':(exclude)mobile' ':(exclude)scripts' ':(exclude)ops' ':(exclude)wordpress' ':(exclude)shopify' ':(exclude)voice-worker' \
  ':(exclude)load-tests' ':(exclude).github' ':(exclude).cursor' ':(exclude).claude' ':(exclude).reticle' \
  ':(exclude)docs' ':(exclude)eval' ':(exclude)supabase' ':(exclude)public/instagram' \
  ':(exclude)crescelo-platform-overview.html' ':(exclude,glob)**/*.md' \
  ':(exclude,glob)**/*.test.*' ':(exclude,glob)**/*.spec.*'; then
  echo "Only files the website is not built from changed since the last build: skipping."
  exit 0
fi
echo "Site files changed: building."
exit 1
