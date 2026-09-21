#!/bin/sh
# Downloads a Piper voice (model + config) into the models volume.
# Usage: docker compose run --rm worker sh scripts/download-voice.sh en_US-lessac-medium
# Voice names follow <lang>_<REGION>-<name>-<quality>; browse https://huggingface.co/rhasspy/piper-voices
# and check each voice's licence before using it commercially.
set -eu

VOICE="${1:?voice name, e.g. en_US-lessac-medium}"
DIR="${PIPER_VOICE_DIR:-/models/piper}"
LANG_CODE="${VOICE%%-*}"        # en_US
LANG_SHORT="${LANG_CODE%%_*}"   # en
REST="${VOICE#*-}"              # lessac-medium
NAME="${REST%-*}"               # lessac
QUALITY="${REST##*-}"           # medium
BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/${LANG_SHORT}/${LANG_CODE}/${NAME}/${QUALITY}/${VOICE}"

mkdir -p "$DIR"
curl -fL "${BASE}.onnx" -o "${DIR}/${VOICE}.onnx"
curl -fL "${BASE}.onnx.json" -o "${DIR}/${VOICE}.onnx.json"
echo "Installed ${VOICE} in ${DIR}"
