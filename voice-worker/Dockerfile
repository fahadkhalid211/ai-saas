FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/models/hf \
    PIPER_VOICE_DIR=/models/piper

WORKDIR /srv

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY worker ./worker
COPY scripts ./scripts

# Speech models live in a volume so they are downloaded once. See README for the first-run step.
VOLUME ["/models"]

EXPOSE 8765
CMD ["python", "-m", "worker"]
