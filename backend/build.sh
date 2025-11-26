#!/usr/bin/env bash
# Exit on error
set -o errexit

# Print commands for debugging
set -x

echo "=== Starting Build Process ==="

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --no-input --clear

# Apply database migrations
echo "Applying database migrations..."
python manage.py migrate

echo "=== Build Completed Successfully ==="