package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"latency-lens/internal/collector"
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

// Assume we have a way to get userID from context or middleware
func HandleAddMonitoredURL(db *sql.DB) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 認証済みユーザーIDを取得する（例: contextから）
		userID, ok := r.Context().Value("userID").(int64)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var req struct {
			URL   string `json:"url"`
			Label string `json:"label"`
		}
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}

		err := monitor.RegisterMonitoredURL(db, monitor.MonitoredURL{
			UserID: userID,
			URL:    req.URL,
			Label:  req.Label,
		})
		if err != nil {
			http.Error(w, "Failed to register URL", http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
	})
}
