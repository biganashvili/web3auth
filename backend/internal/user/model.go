package user

import (
	"time"
)

// User model
type User struct {
	ID        int       `json:"id"`
	Address   string    `json:"address"`
	Nonce     string    `json:"nonce"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
