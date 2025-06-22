package llm

import (
	"fmt"
	"latency-lens/internal/stats"
)

func BuildPromptFromStats(endpoint string, stat stats.Stat) string {
	return fmt.Sprintf(`
You are a latency expert.

Analyze the following latency metrics for the endpoint "%s":

- Count: %d
- P50: %s
- P95: %s
- P99: %s

Give a brief evaluation and improvement suggestions in markdown format.
`, endpoint, stat.Count, stat.P50, stat.P95, stat.P99)
}
