package auth

import (
	"net/http"

	"github.com/ethereum/go-ethereum/common"
	"github.com/gin-gonic/gin"
)

type Handler struct {
	service Service
}

func NewHandler(service Service) *Handler {
	return &Handler{
		service: service,
	}
}

// GetNonce generates a new nonce for the address
func (h *Handler) GetNonce(c *gin.Context) {
	address := c.Query("address")
	if !common.IsHexAddress(address) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Ethereum address"})
		return
	}

	// Normalize address
	address = common.HexToAddress(address).Hex()

	nonce, err := h.service.CreateOrUpdateNonce(address)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate nonce"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"nonce": nonce})
}

// VerifySignature verifies the signature and issues a JWT token
func (h *Handler) VerifySignature(c *gin.Context) {
	var req struct {
		Address   string `json:"address"`
		Signature string `json:"signature"`
		Message   string `json:"message"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Validate address
	if !common.IsHexAddress(req.Address) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid Ethereum address"})
		return
	}

	// Normalize address
	address := common.HexToAddress(req.Address).Hex()

	token, err := h.service.VerifySignature(address, req.Message, req.Signature)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":   token,
		"address": address,
	})
}
