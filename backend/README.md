# Build the image without starting services
docker-compose build sandbox

# Start all services EXCEPT sandbox
docker-compose up -d postgres redis celery_worker web


RUNTIME_CELERY=true celery -A config.celery:app worker -l info -Q execution_queue


http://127.0.0.1:8000/engine/execute/  

uvicorn config.asgi:application --reload --host 0.0.0.0 --port 8000

gunicorn config.wsgi:application --bind 127.0.0.1:8001 --keep-alive 60

data['date'] = pd.to_datetime(data['date'])  # Convert to datetime if necessary
data.set_index('date', inplace=True)  # Set the 'date' column as the index