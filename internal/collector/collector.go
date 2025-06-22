package collector

import (
	"sync"
	"time"
)

type Entry struct {
	Count   int
	Samples []time.Duration
}

var (
	mu      sync.Mutex
	metrics = make(map[string]*Entry)
)

// Record stores the latency for a given label (e.g., API route)
func Record(label string, duration time.Duration) {
	mu.Lock()
	defer mu.Unlock()

	if _, exists := metrics[label]; !exists {
		metrics[label] = &Entry{Samples: make([]time.Duration, 0, 100)}
	}
	entry := metrics[label]
	entry.Count++
	entry.Samples = append(metrics[label].Samples, duration)

	if len(entry.Samples) > 100 {
		entry.Samples = entry.Samples[len(entry.Samples)-100:]
	}
}

// GetMetrics returns a snapshot of the metrics to avoid data races
func GetMetrics() map[string]Entry {
	mu.Lock()
	defer mu.Unlock()

	snapshot := make(map[string]Entry)
	for label, e := range metrics {
		copiedSamples := make([]time.Duration, len(e.Samples))
		copy(copiedSamples, e.Samples)
		snapshot[label] = Entry{
			Count:   e.Count,
			Samples: copiedSamples,
		}
	}
	return snapshot
}
