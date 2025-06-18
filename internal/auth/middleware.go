package auth

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
)

type contextKey string

const (
	UserIDContextKey   = contextKey("user_id")
	UsernameContextKey = contextKey("username")
)

func JWTAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		userID, username, err := ParseJWT(tokenStr)
		if err != nil {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDContextKey, userID)
		ctx = context.WithValue(ctx, UsernameContextKey, username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (h *AuthHandler) APIKeyAuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		apiKey := r.Header.Get("X-API-Key")
		if apiKey == "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Missing API Key"})
			return
		}

		user, err := h.Repo.GetUserByAPIKey(apiKey)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			json.NewEncoder(w).Encode(map[string]string{"error": "Invalid API Key"})
			return
		}

		ctx := context.WithValue(r.Context(), UserIDContextKey, user.ID)
		ctx = context.WithValue(ctx, UsernameContextKey, user.Username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
