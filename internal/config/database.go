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

		createFaqTable := `
		CREATE TABLE IF NOT EXISTS faqs (
			id TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL,
			question TEXT NOT NULL,
			answer TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (user_id) REFERENCES users(id)
		);`

		if _, err = DB.Exec(createUsersTable); err != nil {
			return
		}
		if _, err = DB.Exec(createFaqTable); err != nil {
			return
		}
	})
	return DB, err
}
