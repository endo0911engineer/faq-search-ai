package model

import "time"

type FAQ struct {
	ID        string    `json:"id"`
	UserID    int64     `json:"-"`
	Question  string    `json:"question"`
	Answer    string    `json:"answer"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
