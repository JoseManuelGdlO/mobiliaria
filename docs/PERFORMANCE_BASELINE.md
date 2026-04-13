# Performance baseline (Mobiliaria)

## Backend

1. Set `LOG_REQUEST_MS=1` when starting the API to log `METHOD path status duration` for each request.
2. Note p95 latency for: login, `GET /events/getEvents`, `GET /events/getDetail`, inventory list endpoints.
3. After changes, compare the same endpoints under similar load.

## Mobile app

1. Use Flipper Network tab to inspect duplicate calls and payload sizes.
2. Record time-to-interactive for: cold start, Home events list, Event detail screen.

## MySQL

Monitor active connections on RDS before/after deploying the connection pool.
