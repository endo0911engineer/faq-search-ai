package main

import (
	"faq-search-ai/internal/config"
	"faq-search-ai/internal/vector"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

func main() {
	config.LoadEnv()

	db, err := config.InitDB()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := vector.InitQdrantCollection(); err != nil {
		log.Fatalf("Qdrant 初期化失敗: %v", err)
	}

	log.Printf("Server running at :%s\n", config.Port)
	log.Fatal(http.ListenAndServe(":"+config.Port, SetupRouter(db)))
}
