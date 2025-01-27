#!/bin/sh
set -e

echo "Starting Docker daemon..."
dockerd > /var/log/dockerd.log 2>&1 &


echo "Waiting for Docker daemon to start..."
while ! docker info >/dev/null 2>&1; do
  sleep 1
done
echo "Docker daemon started."

DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)

EXISTING_GROUP=$(getent group $DOCKER_GID | cut -d: -f1)

if [ -z "$EXISTING_GROUP" ]; then
  echo "Creating new group with GID ${DOCKER_GID}..."
  addgroup --gid $DOCKER_GID docker_host_group
  EXISTING_GROUP="docker_host_group"
fi

echo "Adding appuser to group ${EXISTING_GROUP}..."
adduser appuser $EXISTING_GROUP

echo "Starting Celery worker as appuser..."
exec gosu appuser "$@"