# Build the image without starting services
docker-compose build sandbox

# Start all services EXCEPT sandbox
docker-compose up -d postgres redis celery_worker web

