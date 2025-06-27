package stats

import (
	"sort"
	"time"
)

type Stat struct {
	Label string  `json:"label"`
	Count int     `json:"count"`
	P50   float64 `json:"p50"`
	P95   float64 `json:"p95"`
	P99   float64 `json:"p99"`
}

// CalculateStats returns P50, P95, P99 percentiles
func CalculateStats(samples []time.Duration) (p50, p95, p99 time.Duration) {
	if len(samples) == 0 {
		return 0, 0, 0
	}

	sorted := make([]time.Duration, len(samples))
	copy(sorted, samples)
	sort.Slice(sorted, func(i, j int) bool {
		return sorted[i] < sorted[j]
	})

	getPercentile := func(p float64) time.Duration {
		index := int(float64(len(sorted)) * p)
		if index >= len(sorted) {
			index = len(sorted) - 1
		}
		return sorted[index]
	}

	return getPercentile(0.50), getPercentile(0.95), getPercentile(0.99)
}
