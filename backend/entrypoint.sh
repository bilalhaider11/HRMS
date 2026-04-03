#!/bin/sh
set -e

echo "Waiting for database..."
while ! python -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('db', 5432))
    s.close()
    exit(0)
except:
    exit(1)
" 2>/dev/null; do
    sleep 1
done
echo "Database is ready."

# Generate migration if none exists
if [ -z "$(ls -A alembic/versions/*.py 2>/dev/null)" ]; then
    echo "No migrations found. Generating initial migration..."
    alembic revision --autogenerate -m "initial_schema"
fi

echo "Running migrations..."
alembic upgrade head

echo "Running seeders..."
python seeders.py

echo "Starting server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
