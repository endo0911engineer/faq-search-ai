# Build Stage
FROM golang:1.22 AS builder

WORKDIR /app

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . ./
WORKDIR /app/cmd/server
RUN go build -o /faq-search-ai

# Run Stage
FROM gcr.io/distroless/base-debian11

WORKDIR /

COPY --from=builder /faq-search-ai .
COPY --from=builder /app/internal/config/sqlite.db ./sqlite.db

CMD ["/faq-search-ai"]