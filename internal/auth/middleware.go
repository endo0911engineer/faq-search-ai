package auth

import (
	"context"
	"net/http"
	"os"
	"strings"
)

var validAPIKey = os.Getenv("API_KEY") // 環境変数からAPIキーを読む

func WithAPIKey(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("X-API-Key")
		if key == "" || key != validAPIKey {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}

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
