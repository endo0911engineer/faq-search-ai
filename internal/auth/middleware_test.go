package auth

import (
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func TestWithAPIKey(t *testing.T) {
	t.Setenv("API_KEY", "test-api-key")
	validAPIKey = os.Getenv("API_KEY")

	called := false
	handler := WithAPIKey(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		called = true
	}))

	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("X-API-Key", "test-api-key")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if !called {
		t.Error("expected handler to be called")
	}
	if rr.Code != http.StatusOK {
		t.Errorf("expected status 200 OK, got %d", rr.Code)
	}
}

func TestJWTAuthMiddleware_ValidToken(t *testing.T) {
	secret := "test-secret"
	t.Setenv("JWT_SECRET", secret)

	token, err := GenerateJWT("123", "testuser")
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	handler := JWTAuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := r.Context().Value(UserIDContextKey)
		username := r.Context().Value(UsernameContextKey)
		if userID != "123" || username != "testuser" {
			t.Errorf("unexpected context values: userID=%v, username=%v", userID, username)
		}
	}))

	req := httptest.NewRequest("GET", "/", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status 200 OK, got %d", rr.Code)
	}
}
