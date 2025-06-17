package main

import (
	"database/sql"
	"latency-lens/internal/api"
	"latency-lens/internal/auth"
	"net/http"
)

func SetupRouter(db *sql.DB) http.Handler {
	mux := http.NewServeMux()
	authHandler := auth.NewAuthHandler(db)

	// Public
	mux.Handle("/signup", api.WithCORS(http.HandlerFunc(authHandler.Signup)))
	mux.Handle("/login", api.WithCORS(http.HandlerFunc(authHandler.Login)))

	// Protect
	mux.Handle("/me", api.WithCORS(auth.JWTAuthMiddleware(http.HandlerFunc(authHandler.Me))))
	mux.Handle("/me/apikey", api.WithCORS(auth.JWTAuthMiddleware(http.HandlerFunc(authHandler.APIKey))))

	mux.Handle("/metrics", api.WithCORS(authHandler.APIKeyAuthMiddleware(api.HandleMetrics())))
	mux.Handle("/record", api.WithCORS(authHandler.APIKeyAuthMiddleware(api.HandleRecord())))

	return mux
}
