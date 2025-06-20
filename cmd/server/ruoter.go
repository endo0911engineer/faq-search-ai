package main

import (
	"database/sql"
	"latency-lens/internal/api"
	"latency-lens/internal/auth"
	"latency-lens/internal/llm"
	"latency-lens/internal/monitor"
	"net/http"
)

func SetupRouter(db *sql.DB, llmClient llm.Client) http.Handler {
	mux := http.NewServeMux()
	authHandler := auth.NewAuthHandler(db)

	// Public
	mux.Handle("/signup", api.WithCORS(http.HandlerFunc(authHandler.Signup)))
	mux.Handle("/login", api.WithCORS(http.HandlerFunc(authHandler.Login)))
	mux.Handle("/testapi", api.WithCORS(api.HandleTestAPI()))

	// Protect
	mux.Handle("/me", api.WithCORS(auth.JWTAuthMiddleware(http.HandlerFunc(authHandler.Me))))
	mux.Handle("/me/apikey", api.WithCORS(auth.JWTAuthMiddleware(http.HandlerFunc(authHandler.APIKey))))

	mux.Handle("/interpret", api.WithCORS(auth.JWTAuthMiddleware(api.HandleInterpret(llmClient, db))))
	mux.Handle("/metrics", api.WithCORS(authHandler.APIKeyAuthMiddleware(api.HandleMetrics())))
	mux.Handle("/record", api.WithCORS(authHandler.APIKeyAuthMiddleware(api.HandleRecord())))

	mux.Handle("/monitor/register", api.WithCORS(auth.JWTAuthMiddleware(monitor.HandleAddMonitoredURL(db))))
	mux.Handle("/monitor/delete", api.WithCORS(auth.JWTAuthMiddleware(monitor.HandleDeleteMonitoredURL(db))))
	mux.Handle("/monitor/list", api.WithCORS(auth.JWTAuthMiddleware(monitor.HandleListMonitoredURLs(db))))

	return mux
}
