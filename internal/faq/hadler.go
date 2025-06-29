package faq

import (
	"database/sql"
	"encoding/json"
	"fmt"
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

// faq/handler.go
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
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil || payload.Question == "" {
			http.Error(w, "Invalid question", http.StatusBadRequest)
			return
		}

		// 1. ユーザーの全FAQを取得
		faqs, err := GetFAQsByUser(db, userID)
		if err != nil {
			http.Error(w, "Failed to retrieve FAQs", http.StatusInternalServerError)
			return
		}
		if len(faqs) == 0 {
			http.Error(w, "No FAQs available", http.StatusNotFound)
			return
		}

		// 2. 類似FAQを選ぶ（最も単純に質問に対して部分一致するもの）
		var topMatch FAQ
		var bestScore float64
		for _, faq := range faqs {
			score := simpleSimilarity(payload.Question, faq.Question)
			if score > bestScore {
				bestScore = score
				topMatch = faq
			}
		}

		// 3. LLM APIを呼び出して回答を生成（MVP用の疑似呼び出し）
		answer := callLLM(payload.Question, topMatch)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"answer": answer,
		})
	}
}

// 疑似類似度計算（将来的にはEmbeddingに切り替え）
func simpleSimilarity(q1, q2 string) float64 {
	q1 = strings.ToLower(q1)
	q2 = strings.ToLower(q2)
	common := 0
	for _, word := range strings.Fields(q1) {
		if strings.Contains(q2, word) {
			common++
		}
	}
	return float64(common) / float64(len(strings.Fields(q1))+1)
}

// 疑似LLM回答
func callLLM(question string, faq FAQ) string {
	return fmt.Sprintf("あなたの質問に最も近いFAQは以下です:\nQ: %s\nA: %s", faq.Question, faq.Answer)
}
