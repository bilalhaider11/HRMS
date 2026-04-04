#!/bin/sh
set -e

echo "Waiting for database..."
until python -c "
from sqlmodel import create_engine, text
import os
url = os.environ.get('data_base_url', '')
engine = create_engine(url)
with engine.connect() as conn:
    conn.execute(text('SELECT 1'))
print('connected')
" 2>/dev/null; do
    echo "  DB not ready, retrying in 2s..."
    sleep 2
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
