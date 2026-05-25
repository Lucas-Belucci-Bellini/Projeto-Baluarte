# Backend de IA do Baluarte (modo Servidor do J.A.R.V.I.S.).
# Build context = pasta backend/. Funciona em Render, Railway, Fly, Cloud Run…
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Hosts injetam PORT; bind em 0.0.0.0 para ser acessível de fora do container.
ENV HOST=0.0.0.0 PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
