package faq

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"latency-lens/internal/auth"
)

func HandleFAQListOrCreate(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(auth.UserIDContextKey).(int64)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		switch r.Method {
		case http.MethodGet:
			faqs, err := GetFAQsByUser(db, userID)
			if err != nil {
				http.Error(w, "Failed to fetch FAQs", http.StatusInternalServerError)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(faqs)

		case http.MethodPost:
			var input struct {
				Question string `json:"question"`
				Answer   string `json:"answer"`
			}
			if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
				http.Error(w, "Invalid JSON", http.StatusBadRequest)
				return
			}
			if input.Question == "" || input.Answer == "" {
				http.Error(w, "Question and Answer are required", http.StatusBadRequest)
				return
			}

			if err := CreateFAQ(db, userID, input.Question, input.Answer); err != nil {
				http.Error(w, "Failed to create FAQ", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusCreated)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}

func HandleFAQDetail(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(auth.UserIDContextKey).(int64)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// URLからIDを抽出: /faqs/{id} の形式を想定
		path := strings.TrimPrefix(r.URL.Path, "/faqs/")
		id, err := strconv.ParseInt(path, 10, 64)
		if err != nil || id <= 0 {
			http.Error(w, "Invalid FAQ ID", http.StatusBadRequest)
			return
		}

		switch r.Method {
		case http.MethodGet:
			faq, err := GetFAQByID(db, id, userID)
			if err != nil {
				http.Error(w, "FAQ not found", http.StatusNotFound)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(faq)

		case http.MethodPut:
			var updatedFAQ FAQ
			if err := json.NewDecoder(r.Body).Decode(&updatedFAQ); err != nil {
				http.Error(w, "Invalid request body", http.StatusBadRequest)
				return
			}
			updatedFAQ.ID = id
			updatedFAQ.UserID = userID

			if err := UpdateFAQ(db, &updatedFAQ); err != nil {
				http.Error(w, "Failed to update FAQ", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusNoContent)

		case http.MethodDelete:
			if err := DeleteFAQ(db, id, userID); err != nil {
				http.Error(w, "Failed to delete FAQ", http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusNoContent)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	}
}
