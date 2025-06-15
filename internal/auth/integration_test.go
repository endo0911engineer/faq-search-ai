package auth_test

import (
	"bytes"
	"encoding/json"
	"latency-lens/internal/auth"
	"net/http"
	"net/http/httptest"
	"testing"

	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

type apiResponse struct {
	Token    string `json:"token"`
	Username string `json:"username"`
}

func setupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	_, err = db.Exec(`CREATE TABLE users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT,
		username TEXT,
		password TEXT
	)`)
	if err != nil {
		t.Fatalf("failed to create table: %v", err)
	}
	return db
}

func TestAuthFlow(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret")
	db := setupTestDB(t)
	h := auth.NewAuthHandler(db)

	// Signup
	signupBody := map[string]string{
		"email":    "a@example.com",
		"username": "testuser",
		"password": "pass123",
	}
	body, _ := json.Marshal(signupBody)
	req := httptest.NewRequest("POST", "/signup", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	h.Signup(rr, req)
	if rr.Code != http.StatusCreated {
		t.Fatalf("signup failed: %d", rr.Code)
	}

	// Login
	loginBody := map[string]string{
		"email":    "a@example.com",
		"password": "pass123",
	}
	body, _ = json.Marshal(loginBody)
	t.Logf("login response: %s", string(body))
	req = httptest.NewRequest("POST", "/login", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	rr = httptest.NewRecorder()
	h.Login(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("login failed: %d", rr.Code)
	}

	var res apiResponse
	json.NewDecoder(rr.Body).Decode(&res)
	if res.Token == "" {
		t.Fatal("expected token in login response")
	}

	// Me
	req = httptest.NewRequest("GET", "/me", nil)
	req.Header.Set("Authorization", "Bearer "+res.Token)
	rr = httptest.NewRecorder()
	hWithJWT := auth.JWTAuthMiddleware(http.HandlerFunc(h.Me))
	hWithJWT.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("me failed: %d", rr.Code)
	}
	json.NewDecoder(rr.Body).Decode(&res)
	if res.Username != "testuser" {
		t.Errorf("expected username testuser, got %s", res.Username)
	}
}
