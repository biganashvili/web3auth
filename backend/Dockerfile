FROM golang:1.20-alpine

WORKDIR /app

# Install dependencies
RUN apk add --no-cache git

# Copy go.mod and go.sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the rest of the code
COPY . .

# Build the application
RUN go build -o main ./cmd/web

RUN echo $(ls -1 /app)
# Expose port
EXPOSE 8080

# Run the binary
CMD ["./main"]