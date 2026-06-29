# 1. Use an official lightweight Python base runtime image
FROM python:3.11-slim

# 2. Set strict system paths inside the isolated container execution matrix
WORKDIR /app

# 3. Copy my dependencies index first to leverage build-caching layers
COPY requirements.txt .

# 4. Install production binaries into the systems core
RUN pip install --no-cache-dir -r requirements.txt

# 5. Mirror my full codebase and static assets across to the container folder
COPY . .

# 6. Expose the standard cloud routing network interface port
EXPOSE 8080

# 7. Execute Gunicorn as the primary multi-threaded production worker engine
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app", "--workers", "2", "--threads", "2"]