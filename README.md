# Web3 Authentication Project

A complete Web3 authentication system with wallet connection, signature verification, and token balance display.

## Features

- Connect to MetaMask wallet
- Sign messages to verify wallet ownership
- JWT-based authentication
- Protected routes
- Display ETH, USDT, and USDC balances

## Tech Stack

### Frontend
- React.js
- React Router for navigation
- Tailwind CSS for styling
- ethers.js for Ethereum interaction
- Axios for API requests

### Backend
- Go (Golang)
- Gin web framework
- JWT for authentication
- PostgreSQL database

## Project Structure

```
web3auth/
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConnectWallet.jsx
│   │   │   └── Dashboard.jsx
│   │   │
│   │   ├── utils/
│   │   │   └── web3.js
│   │   │
│   │   ├── App.jsx
│   │   ├── index.jsx
│   │   └── index.css
│   │
│   ├── package.json
│   └── tailwind.config.js
│
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   │
│   ├── internal/
│   │   ├── auth/
│   │   │   ├── handler.go
│   │   │   ├── middleware.go
│   │   │   ├── service.go
│   │   │   └── jwt.go
│   │   │
│   │   ├── user/
│   │   │   ├── handler.go
│   │   │   ├── model.go
│   │   │   └── repository.go
│   │   │
│   │   └── utils/
│   │       ├── db.go
│   │       ├── ethereum.go
│   │       └── middleware.go
│   │
│   ├── migrations/
│   │   └── 001_create_users.sql
│   │
│   ├── go.mod
│   └── go.sum
│
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Node.js and npm
- Go (1.16+)
- Docker and Docker Compose
- PostgreSQL (or use the Docker container)

### Installation

1. Clone the repository
```bash
git clone https://github.com/biganashvili/web3auth.git
cd web3auth
```

2. Start the services with Docker Compose
```bash
docker-compose up -d
```

3. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api

### Manual Setup (without Docker)

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Backend
```bash
cd backend
go mod download
go run cmd/server/main.go
```

## Authentication Flow

1. User clicks "Connect MetaMask" button
2. Frontend requests wallet connection via MetaMask
3. Backend generates a random nonce for the address
4. User signs a message containing this nonce
5. Backend verifies the signature cryptographically
6. If valid, a JWT token is issued and stored in localStorage
7. User is redirected to the dashboard where they can see their token balances

## License
MIT

## Author
Sergi Biganashvili