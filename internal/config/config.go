package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

var (
	JWTSecret string
	Port      string
	QdrantURL string
)

func LoadEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	JWTSecret = os.Getenv("JWT_SECRET")
	Port = os.Getenv("PORT")
	QdrantURL = os.Getenv("QDRANT_URL")

	if JWTSecret == "" || Port == "" {
		log.Fatal("Missing required environment variables")
	}
}
