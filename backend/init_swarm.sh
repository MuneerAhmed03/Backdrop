#!/bin/bash

if ! docker info | grep -q "Swarm: active"; then
    echo "Initializing Docker Swarm..."
    docker swarm init
else
    echo "Swarm is already initialized"
fi

# Deploy the stack
echo "Deploying the stack..."
docker stack deploy -c docker-compose.yml backdrop

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check service status
echo "Checking service status..."
docker service ls

echo "Setup complete! Your services should be running now."
echo "You can check the status of your services with: docker service ls" 