.PHONY: all build run-api run-worker test lint migrate-up migrate-down docker-up docker-down clean

APP_NAME := file-storage-service
API_BIN := bin/api
WORKER_BIN := bin/worker
CONFIG := configs/config.yaml
MIGRATION_DIR := migrations
DB_DSN := postgres://filestore:filestore@localhost:5432/filestore?sslmode=disable

all: build

build:
	go build -o $(API_BIN) ./cmd/api
	go build -o $(WORKER_BIN) ./cmd/worker

run-api: build
	./$(API_BIN) -config $(CONFIG)

run-worker: build
	./$(WORKER_BIN) -config $(CONFIG)

test:
	go test -v -race ./...

lint:
	golangci-lint run ./...

migrate-up:
	migrate -path $(MIGRATION_DIR) -database "$(DB_DSN)" up

migrate-down:
	migrate -path $(MIGRATION_DIR) -database "$(DB_DSN)" down 1

docker-up:
	docker-compose -f deployments/docker/docker-compose.yml up -d postgres redis minio minio-init
	@echo "Waiting for services..."
	@sleep 5
	docker-compose -f deployments/docker/docker-compose.yml up migrate

docker-down:
	docker-compose -f deployments/docker/docker-compose.yml down

docker-all:
	docker-compose -f deployments/docker/docker-compose.yml up --build -d

clean:
	rm -rf bin/
	go clean
