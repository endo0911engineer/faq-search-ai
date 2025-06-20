package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"latency-lens/internal/auth"
	"latency-lens/internal/collector"
	"latency-lens/internal/llm"
	"latency-lens/internal/monitor"
	"latency-lens/internal/stats"
)

type Stat struct {
	Label string        `json:"label"`
	Count int           `json:"count"`
	P50   time.Duration `json:"p50"`
	P95   time.Duration `json:"p95"`
	P99   time.Duration `json:"p99"`
}

func HandleMetrics() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw := collector.GetMetrics()
		output := make([]Stat, 0)

		for label, data := range raw {
			p50, p95, p99 := stats.CalculateStats(data.Samples)
			output = append(output, Stat{
				Label: label,
				Count: data.Count,
				P50:   p50,
				P95:   p95,
				P99:   p99,
			})
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(output)
	})
}

func HandleRecord() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		type Payload struct {
			Label    string  `json:"label"`
			Duration float64 `json:"duration`
		}

		var p Payload
		if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}
		if p.Label == "" || p.Duration <= 0 {
			http.Error(w, "Missing or invalid label/duration", http.StatusBadRequest)
			return
		}

		d := time.Duration(p.Duration * float64(time.Millisecond))
		collector.Record(p.Label, d)
		w.WriteHeader(http.StatusNoContent)
	})
}

func HandleInterpret(llm llm.Client, db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID, ok := r.Context().Value(auth.UserIDContextKey).(int64)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var input struct {
			Message string `json:"message"`
		}
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "Invalid input", http.StatusBadRequest)
			return
		}

		// LLMでURLを抽出
		url, err := llm.ExtractURL(input.Message)
		if err != nil || url == "" {
			http.Error(w, "Could not extract URL", http.StatusBadRequest)
			return
		}

		//DBに登録
		err = monitor.RegisterMonitoredURL(db, monitor.MonitoredURL{
			UserID: userID,
			URL:    url,
			Label:  url,
		})
		if err != nil {
			http.Error(w, "Failed to register URL", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "URL interpreted and registered",
			"url":     url,
		})
	})
}

func HandleTestAPI() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(1 * time.Second) // 1秒待つ（遅延シミュレーション）
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "This is a test API response",
			"status":  "200 OK",
		})
	})
}
