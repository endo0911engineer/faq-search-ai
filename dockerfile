# Build Stage
FROM golang:1.22 AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . ./
WORKDIR /app/cmd/server
RUN go build -o /latency-lens

# Run Stage
FROM gcr.io/distroless/base-debian11

WORKDIR /

COPY --from=builder /latency-lens .
COPY --from=builder /app/internal/config/sqlite.db ./sqlite.db

ENV PORT=8080
ENV JWT_SECRET=${JWT_SECRET}

EXPOSE 8080

CMD ["/latency-lens"]