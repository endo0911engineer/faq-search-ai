package api

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"latency-lens/internal/collector"
	"latency-lens/internal/stats"
)

func HandleMetrics() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw := collector.GetMetrics()
		output := make([]stats.Stat, 0)

		for label, data := range raw {
			p50, p95, p99 := stats.CalculateStats(data.Samples)
			output = append(output, stats.Stat{
				Label: label,
				Count: data.Count,
				P50:   float64(p50.Milliseconds()),
				P95:   float64(p95.Milliseconds()),
				P99:   float64(p99.Milliseconds()),
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

		log.Printf("Received latency record - Label: %s, Duration: %f ms", p.Label, p.Duration)

		d := time.Duration(p.Duration * float64(time.Millisecond))
		collector.Record(p.Label, d)
		w.WriteHeader(http.StatusNoContent)
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
