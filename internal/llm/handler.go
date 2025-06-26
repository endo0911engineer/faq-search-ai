package llm

import (
	"encoding/json"
	"fmt"
	"latency-lens/internal/collector"
	"latency-lens/internal/stats"
	"net/http"
)

func HandleLLMAnalyze() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		raw := collector.GetMetrics()

		var prompt string
		for label, data := range raw {
			p50, p95, p99 := stats.CalculateStats(data.Samples)
			prompt += "Label: " + label + "\n"
			prompt += "Count: " + fmt.Sprint(data.Count) + "\n"
			prompt += fmt.Sprintf("P50: %v, P95: %v, P99: %v\n\n", p50, p95, p99)
		}

		result, err := AnalyzeLatencyWithOpenRouter(prompt)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"summary": result})
	})
}
