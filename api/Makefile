.ONESHELL:
SHELL       = /bin/bash
.SHELLFLAGS = -eu -o pipefail -E -c
.DEFAULT_GOAL := help

help:
	@sed -rn 's/^([a-zA-Z_-]+):.*?## (.*)$$/"\1" "\2"/p' < $(MAKEFILE_LIST) | xargs printf "make %-20s# %s\n"

run: ## Runs the app
	dotnet run --project src/TodoApi.Api

test: ## Runs unit tests
	dotnet test TodoApi.slnx
