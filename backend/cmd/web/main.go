package main

import (
	"log"
	"os"

	"github.com/biganashvili/web3auth/internal/auth"
	"github.com/biganashvili/web3auth/internal/user"
	"github.com/biganashvili/web3auth/internal/utils"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	// Initialize database connection
	db, err := utils.InitDB()
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Create JWT manager
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "your-default-secret-key-change-in-production"
		log.Println("Warning: Using default JWT secret. Set JWT_SECRET environment variable in production.")
	}
	jwtManager := auth.NewJWTManager(jwtSecret)

	// Create repositories
	userRepo := user.NewRepository(db)

	// Create services
	authService := auth.NewService(userRepo, jwtManager)

	// Create handlers
	authHandler := auth.NewHandler(authService)
	userHandler := user.NewHandler(userRepo)

	// Initialize Gin router
	r := gin.Default()

	// Set up CORS
	r.Use(utils.CORSMiddleware())

	// API routes
	api := r.Group("/api")
	{
		authGroup := api.Group("/auth")
		{
			authGroup.GET("/nonce", authHandler.GetNonce)
			authGroup.POST("/verify", authHandler.VerifySignature)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(auth.AuthMiddleware(jwtManager))
		{
			protected.GET("/user", userHandler.GetUser)
		}
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}
