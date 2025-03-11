package user

import (
	"database/sql"
	"errors"
	"time"
)

// ErrUserNotFound is returned when a user is not found
var ErrUserNotFound = errors.New("user not found")

// Repository interface for user data access
type Repository interface {
	Create(user *User) error
	GetByAddress(address string) (*User, error)
	Update(user *User) error
}

type repository struct {
	db *sql.DB
}

// NewRepository creates a new user repository
func NewRepository(db *sql.DB) Repository {
	return &repository{
		db: db,
	}
}

// Create adds a new user to the database
func (r *repository) Create(user *User) error {
	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	query := `
		INSERT INTO users (address, nonce, created_at, updated_at)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	return r.db.QueryRow(
		query,
		user.Address,
		user.Nonce,
		user.CreatedAt,
		user.UpdatedAt,
	).Scan(&user.ID)
}

// GetByAddress retrieves a user by their Ethereum address
func (r *repository) GetByAddress(address string) (*User, error) {
	query := `
		SELECT id, address, nonce, created_at, updated_at
		FROM users
		WHERE address = $1
	`

	user := &User{}
	err := r.db.QueryRow(query, address).Scan(
		&user.ID,
		&user.Address,
		&user.Nonce,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}

	return user, nil
}

// Update updates an existing user
func (r *repository) Update(user *User) error {
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users
		SET nonce = $1, updated_at = $2
		WHERE id = $3
	`

	_, err := r.db.Exec(query, user.Nonce, user.UpdatedAt, user.ID)
	return err
}
