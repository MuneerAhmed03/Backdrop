#!/bin/sh
set -e

# Start Docker daemon as root
echo "Starting Docker daemon..."
dockerd > /var/log/dockerd.log 2>&1 &

# Wait for Docker daemon to start
echo "Waiting for Docker daemon to start..."
while ! docker info >/dev/null 2>&1; do
  sleep 1
done
echo "Docker daemon started."

# Get Docker socket's GID
DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)

# Check if a group with this GID already exists
EXISTING_GROUP=$(getent group $DOCKER_GID | cut -d: -f1)

# Create a new group if needed
if [ -z "$EXISTING_GROUP" ]; then
  echo "Creating new group with GID ${DOCKER_GID}..."
  addgroup --gid $DOCKER_GID docker_host_group
  EXISTING_GROUP="docker_host_group"
fi

echo "Adding appuser to group ${EXISTING_GROUP}..."
adduser appuser $EXISTING_GROUP

# Switch to appuser and start Celery worker
echo "Starting Celery worker as appuser..."
exec gosu appuser "$@"