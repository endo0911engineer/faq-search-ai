package main

import (
	"latency-lens/internal/config"
	"latency-lens/internal/llm"
	"log"
	"net/http"

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

	log.Printf("Server running at :%s\n", config.Port)
	log.Fatal(http.ListenAndServe(":"+config.Port, SetupRouter(db, llmClient)))
}
