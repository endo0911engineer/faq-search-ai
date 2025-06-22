package main

import (
	"latency-lens/internal/config"
	"latency-lens/internal/llm"
	"latency-lens/internal/scheduler"
	"log"
	"net/http"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	config.LoadEnv()

	db, err := config.InitDB()
	llmClient := llm.NewClient()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	go scheduler.StartMonitoringLoop(db, 30*time.Second)

	log.Printf("Server running at :%s\n", config.Port)
	log.Fatal(http.ListenAndServe(":"+config.Port, SetupRouter(db, llmClient)))
}
