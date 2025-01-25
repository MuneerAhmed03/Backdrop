FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user
RUN useradd -m -s /bin/bash sandbox_user

# Create working directory
WORKDIR /sandbox

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the sandbox worker
COPY sandbox_server.py .

# Switch to non-root user
USER sandbox_user

# Run the worker
CMD ["python", "sandbox_server.py"] 