package auth

import (
	"errors"
	"fmt"

	"github.com/biganashvili/web3auth/internal/user"
	"github.com/biganashvili/web3auth/internal/utils"

	"github.com/google/uuid"
)

type Service interface {
	CreateOrUpdateNonce(address string) (string, error)
	VerifySignature(address, message, signature string) (string, error)
}

type serviceImpl struct {
	userRepo   user.Repository
	jwtManager *JWTManager
}

func NewService(userRepo user.Repository, jwtManager *JWTManager) Service {
	return &serviceImpl{
		userRepo:   userRepo,
		jwtManager: jwtManager,
	}
}

// CreateOrUpdateNonce generates a new nonce for a user
func (s *serviceImpl) CreateOrUpdateNonce(address string) (string, error) {
	// Generate a new nonce
	nonce := uuid.New().String()

	// Check if user exists
	existingUser, err := s.userRepo.GetByAddress(address)
	if err != nil && !errors.Is(err, user.ErrUserNotFound) {
		return "", err
	}

	// Update or create user
	if existingUser != nil {
		existingUser.Nonce = nonce
		if err := s.userRepo.Update(existingUser); err != nil {
			return "", err
		}
	} else {
		newUser := &user.User{
			Address: address,
			Nonce:   nonce,
		}
		if err := s.userRepo.Create(newUser); err != nil {
			return "", err
		}
	}

	return nonce, nil
}

// VerifySignature verifies a signature and issues a JWT token
func (s *serviceImpl) VerifySignature(address, message, signature string) (string, error) {
	// Get user from database
	usr, err := s.userRepo.GetByAddress(address)
	if err != nil {
		return "", errors.New("user not found")
	}

	// Verify that message contains the correct nonce
	expectedMessage := fmt.Sprintf("Sign this message to verify your wallet ownership: %s", usr.Nonce)
	if message != expectedMessage {
		return "", errors.New("invalid message")
	}

	// Verify signature
	signatureValid, err := utils.VerifyEthSignature(message, signature, address)
	if err != nil {
		return "", err
	}

	if !signatureValid {
		return "", errors.New("invalid signature")
	}

	// Generate a new nonce for next time
	newNonce := uuid.New().String()
	usr.Nonce = newNonce
	if err := s.userRepo.Update(usr); err != nil {
		return "", err
	}

	// Create JWT token
	token, err := s.jwtManager.GenerateToken(address)
	if err != nil {
		return "", err
	}

	return token, nil
}

type JWTManager struct {
	secretKey string
}

func NewJWTManager(secretKey string) *JWTManager {
	return &JWTManager{secretKey: secretKey}
}

// Methods for JWT management are implemented in jwt.go file
