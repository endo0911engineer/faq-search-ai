package config

import (
	"database/sql"
	"os"
	"sync"

	_ "github.com/mattn/go-sqlite3"
)

var (
	DB   *sql.DB
	once sync.Once
)

func InitDB() (*sql.DB, error) {
	var err error
	once.Do(func() {
		dbPath := os.Getenv("SQLITE_DB_PATH")
		if dbPath == "" {
			dbPath = "./latency_lens.db"
		}

		DB, err = sql.Open("sqlite3", dbPath)
		if err != nil {
			return
		}

		if err = DB.Ping(); err != nil {
			return
		}

		createUsersTable := `
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email TEXT NOT NULL UNIQUE,
			username TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		);`

		createMonitoredURLsTable := `
		CREATE TABLE IF NOT EXISTS monitored_urls (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			url TEXT NOT NULL,
			label TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);`

		if _, err = DB.Exec(createUsersTable); err != nil {
			return
		}
		if _, err = DB.Exec(createMonitoredURLsTable); err != nil {
			return
		}
	})
	return DB, err
}
