package faq_test

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"latency-lens/internal/auth"
	"latency-lens/internal/faq"
	"net/http"
	"net/http/httptest"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func setupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("failed to open db: %v", err)
	}
	_, err = db.Exec(`CREATE TABLE faqs (
		id TEXT PRIMARY KEY,
		user_id INTEGER,
		question TEXT,
		answer TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	)`)
	if err != nil {
		t.Fatalf("failed to create table: %v", err)
	}
	return db
}

func TestHandleFAQListOrCreate_Get(t *testing.T) {
	db := setupTestDB(t)

	// 事前にデータを挿入
	_, err := db.Exec(`INSERT INTO faqs (id, user_id, question, answer) VALUES (?, ?, ?, ?)`,
		"faq-1", 1, "What is Go?", "Go is a programming language.")
	if err != nil {
		t.Fatalf("failed to insert test data: %v", err)
	}

	handler := faq.HandleFAQListOrCreate(db)

	req := httptest.NewRequest("GET", "/faqs", nil)
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, int64(1))
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", rr.Code)
	}
	var faqs []faq.FAQ
	if err := json.NewDecoder(rr.Body).Decode(&faqs); err != nil {
		t.Errorf("failed to decode response: %v", err)
	}
	if len(faqs) != 1 {
		t.Errorf("expected 1 faq, got %d", len(faqs))
	}
}

func TestHandleFAQListOrCreate_Post_Validation(t *testing.T) {
	db := setupTestDB(t)

	handler := faq.HandleFAQListOrCreate(db)

	payload := `{"question": "", "answer": ""}`
	req := httptest.NewRequest("POST", "/faqs", bytes.NewBufferString(payload))
	req.Header.Set("Content-Type", "application/json")
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, int64(1))
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Errorf("expected 400 for empty question/answer, got %d", rr.Code)
	}
}
