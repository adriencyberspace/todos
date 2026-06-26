.PHONY: dev install help

dev: install  ## Start API and frontend
	@printf "\n  API      → http://localhost:5000\n"
	@printf "  API Docs → http://localhost:5000/api-doc\n"
	@printf "  Frontend → http://localhost:5173\n\n"
	@trap 'kill 0' INT; \
	  (cd api && dotnet run --project src/TodoApi.Api) & \
	  (cd frontend && npm run dev) & \
	  wait

install:  ## Install frontend dependencies
	cd frontend && npm install

help:  ## Show available commands
	@echo "Usage: make <target>"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  %-10s %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
