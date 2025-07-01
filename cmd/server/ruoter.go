package main

import (
	"database/sql"
	"latency-lens/internal/auth"
	"latency-lens/internal/faq"
	"latency-lens/internal/middleware"
	"net/http"
)

func SetupRouter(db *sql.DB) http.Handler {
	mux := http.NewServeMux()
	authHandler := auth.NewAuthHandler(db)

	// Public
	mux.Handle("/signup", middleware.WithCORS(http.HandlerFunc(authHandler.Signup)))
	mux.Handle("/login", middleware.WithCORS(http.HandlerFunc(authHandler.Login)))

	// Protect
	mux.Handle("/me", middleware.WithCORS(auth.JWTAuthMiddleware(http.HandlerFunc(authHandler.Me))))

	mux.Handle("/faqs/ask", middleware.WithCORS(auth.JWTAuthMiddleware(http.HandlerFunc(faq.HandleAskFAQ(db)))))
	mux.Handle("/faqs", middleware.WithCORS(auth.JWTAuthMiddleware(http.HandlerFunc(faq.HandleFAQListOrCreate(db)))))
	mux.Handle("/faqs/", middleware.WithCORS(auth.JWTAuthMiddleware(http.HandlerFunc(faq.HandleFAQDetail(db)))))

	return mux
}
