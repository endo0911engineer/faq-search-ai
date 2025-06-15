package auth

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
)

func setupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}

	_, err = db.Exec(`
		CREATE TABLE users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT NOT NULL UNIQUE,
			username TEXT NOT NULL,
			password TEXT NOT NULL
		);
	`)
	if err != nil {
		t.Fatalf("failed to create users table: %v", err)
	}

	return db
}

func TestSignup(t *testing.T) {
	db := setupTestDB(t)
	h := NewAuthHandler(db)

	payload := map[string]string{
		"email":    "test@example.com",
		"username": "testuser",
		"password": "password123",
	}
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/signup", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.Signup(rr, req)

	if rr.Code != http.StatusCreated {
		t.Errorf("expected 201 Created, got %d", rr.Code)
	}
}

func TestLogin(t *testing.T) {
	db := setupTestDB(t)
	h := NewAuthHandler(db)

	// 事前にユーザー登録
	hashed, _ := HashPassword("password123")
	db.Exec("INSERT INTO users (email, username, password) VALUES (?, ?, ?)", "test@example.com", "testuser", hashed)

	payload := map[string]string{
		"email":    "test@example.com",
		"password": "password123",
	}
	body, _ := json.Marshal(payload)
	req := httptest.NewRequest(http.MethodPost, "/api/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	// JWT_SECRET を設定
	os.Setenv("JWT_SECRET", "testsecret")
	h.Login(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200 OK, got %d", rr.Code)
	}

	var res map[string]string
	if err := json.NewDecoder(rr.Body).Decode(&res); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if _, ok := res["token"]; !ok {
		t.Error("token not found in response")
	}
}
