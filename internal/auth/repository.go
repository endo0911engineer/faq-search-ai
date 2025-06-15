package auth

import (
	"database/sql"
	"errors"
)

type Repository struct {
	DB *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{DB: db}
}

func (r *Repository) CreateUser(user *User) error {
	_, err := r.DB.Exec(`
		INSERT INTO users (email, username, password_hash)
		VALUES (?, ?, ?)`, user.Email, user.Username, user.Password)
	return err
}

func (r *Repository) GetUserByEmail(email string) (*User, error) {
	row := r.DB.QueryRow(`SELECT id, email, username, password_hash FROM users WHERE email = ?`, email)
	var user User
	err := row.Scan(&user.ID, &user.Email, &user.Username, &user.Password)
	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	return &user, err
}
