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
	mux.Handle("/metrics", api.WithCORS(auth.JWTAuthMiddleware(api.HandleMetrics())))
	mux.Handle("/record", api.WithCORS(auth.JWTAuthMiddleware(api.HandleRecord())))

	return mux
}
