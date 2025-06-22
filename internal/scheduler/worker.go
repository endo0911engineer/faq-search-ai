package scheduler

import (
	"database/sql"
	"io"
	"latency-lens/internal/collector"
	"latency-lens/internal/monitor"
	"log"
	"net/http"
	"time"
)

func StartMonitoringLoop(db *sql.DB, interval time.Duration) {
	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	for {
		<-ticker.C
		urls, err := monitor.ListActiveMonitoredURLs(db)
		if err != nil {
			log.Println("Error fetching active URLs:", err)
			continue
		}

		for _, u := range urls {
			go monitorAndRecord(u)
		}
	}
}

func monitorAndRecord(u monitor.MonitoredURL) {
	start := time.Now()
	resp, err := http.Get(u.URL)
	duration := time.Since(start)

	if err != nil {
		log.Printf("Failed to fetch %s: %v", u.URL, err)
		return
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()

	collector.Record(u.Label, duration)
}
