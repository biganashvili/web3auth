package user

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	repo Repository
}

func NewHandler(repo Repository) *Handler {
	return &Handler{
		repo: repo,
	}
}

// GetUser returns the user information based on the address from the JWT token
func (h *Handler) GetUser(c *gin.Context) {
	// Address is set by the middleware
	address := c.GetString("address")
	if address == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	user, err := h.repo.GetByAddress(address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user data"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":      user.ID,
		"address": user.Address,
	})
}
