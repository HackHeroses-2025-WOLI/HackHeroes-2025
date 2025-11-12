#!/bin/bash
exec > /tmp/fastapi.log 2>&1

env

# You may need to add here things like : source .../.bashrc

echo "Starting FastAPI..."

source /home/pi/fastapi-test/venv/bin/activate && /home/pi/fastapi-test/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --ssl-keyfile /home/pi/fastapi-test/key.pem --ssl-certfile /home/pi/fastapi-test/cert.pem

