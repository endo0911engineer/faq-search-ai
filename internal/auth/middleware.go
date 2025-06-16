package auth

import (
	"context"
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
			http.Error(w, "Missing API Key", http.StatusUnauthorized)
			return
		}

		user, err := h.Repo.GetUserByAPIKey(apiKey)
		if err != nil {
			http.Error(w, "Invalid API Key", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserIDContextKey, user.ID)
		ctx = context.WithValue(ctx, UsernameContextKey, user.Username)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
