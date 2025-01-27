FROM python:3.10-slim AS builder

WORKDIR /app
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir pandas

# runtime stage
FROM python:3.10-slim
WORKDIR /app

# copy pandas from builder (correct path)
COPY --from=builder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# runtime essentials
RUN apt-get update && \
    apt-get install -y --no-install-recommends procps && \
    rm -rf /var/lib/apt/lists/* && \
    useradd -m sandboxuser

USER sandboxuser
COPY execute.py .
CMD ["sleep", "infinity"]
