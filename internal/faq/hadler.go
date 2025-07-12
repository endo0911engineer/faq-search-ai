package faq

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"faq-search-ai/internal/auth"
	"faq-search-ai/internal/llm"
	"faq-search-ai/internal/model"
	"faq-search-ai/internal/vector"
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

			if err := CreateFAQWithVector(db, userID, input.Question, input.Answer); err != nil {
				log.Printf("CreateFAQWithVector error: %v", err)
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
		id := strings.TrimPrefix(r.URL.Path, "/faqs/")
		if id == "" {
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
			var updatedFAQ model.FAQ
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

func HandleAskFAQ(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(auth.UserIDContextKey).(int64)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var payload struct {
			Question string `json:"question"`
		}
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || strings.TrimSpace(payload.Question) == "" {
			http.Error(w, "Invalid question", http.StatusBadRequest)
			return
		}

		// 1. 質問をEmbeddingに変換
		vectorData, err := vector.GenerateEmbedding(payload.Question)
		if err != nil {
			http.Error(w, "Failed to embed question", http.StatusInternalServerError)
			return
		}

		// 2. Qdrantで類似FAQの検索（上位5件取得）
		similarQuestions, err := vector.SearchSimilarFAQs(vectorData, userID, 5)
		if err != nil {
			http.Error(w, "Vector search failed", http.StatusInternalServerError)
			return
		}
		if len(similarQuestions) == 0 {
			http.Error(w, "No relevant FAQs found", http.StatusNotFound)
			return
		}

		// 3. 類似質問をもとにLLMで回答生成
		answer, err := llm.GenerateAnswerWithMistral(payload.Question, similarQuestions)
		if err != nil {
			http.Error(w, "LLM generation failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"answer": answer,
		})
	}
}
