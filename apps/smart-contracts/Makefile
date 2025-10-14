# MultiversX Smart Contracts Build System
# Requires mxpy to be installed: pip install multiversx-sdk-cli

.PHONY: help install build test deploy clean format lint

# Default network (can be overridden)
NETWORK ?= devnet
WALLET_PEM ?= wallet.pem

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
NC = \033[0m # No Color

help: ## Show this help message
	@echo "$(YELLOW)BlockchainAI Smart Contracts Build System$(NC)"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies and setup environment
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	@if ! command -v mxpy &> /dev/null; then \
		echo "$(RED)Error: mxpy is not installed. Please install it first:$(NC)"; \
		echo "pip install multiversx-sdk-cli"; \
		exit 1; \
	fi
	@echo "$(GREEN)Dependencies installed!$(NC)"

build: ## Build all smart contracts
	@echo "$(YELLOW)Building smart contracts...$(NC)"
	@mkdir -p output
	@echo "Building AutoBuilder contract..."
	@mxpy contract build src/auto_builder.rs --output-dir output/auto_builder
	@echo "Building ProjectFactory contract..."
	@mxpy contract build src/project_factory.rs --output-dir output/project_factory  
	@echo "Building AiOracle contract..."
	@mxpy contract build src/ai_oracle.rs --output-dir output/ai_oracle
	@echo "$(GREEN)Build complete! Contracts available in output/ directory$(NC)"

test: ## Run contract tests
	@echo "$(YELLOW)Running smart contract tests...$(NC)"
	@cargo test
	@echo "$(GREEN)Tests completed!$(NC)"

format: ## Format Rust code
	@echo "$(YELLOW)Formatting Rust code...$(NC)"
	@cargo fmt
	@echo "$(GREEN)Code formatted!$(NC)"

lint: ## Lint Rust code
	@echo "$(YELLOW)Linting Rust code...$(NC)"
	@cargo clippy -- -D warnings
	@echo "$(GREEN)Linting complete!$(NC)"

# Deployment targets
deploy-auto-builder: build ## Deploy AutoBuilder contract
	@echo "$(YELLOW)Deploying AutoBuilder contract to $(NETWORK)...$(NC)"
	@if [ ! -f $(WALLET_PEM) ]; then \
		echo "$(RED)Error: Wallet file $(WALLET_PEM) not found!$(NC)"; \
		echo "Please create a wallet file or specify WALLET_PEM=path/to/wallet.pem"; \
		exit 1; \
	fi
	@mxpy contract deploy output/auto_builder/auto_builder.wasm \
		--pem $(WALLET_PEM) \
		--proxy https://$(NETWORK)-gateway.multiversx.com \
		--chain $(NETWORK) \
		--recall-nonce \
		--gas-limit 60000000 \
		--arguments $$(mxpy wallet pem-address $(WALLET_PEM)) \
		--send
	@echo "$(GREEN)AutoBuilder contract deployed!$(NC)"

deploy-factory: build ## Deploy ProjectFactory contract
	@echo "$(YELLOW)Deploying ProjectFactory contract to $(NETWORK)...$(NC)"
	@if [ ! -f $(WALLET_PEM) ]; then \
		echo "$(RED)Error: Wallet file $(WALLET_PEM) not found!$(NC)"; \
		exit 1; \
	fi
	@mxpy contract deploy output/project_factory/project_factory.wasm \
		--pem $(WALLET_PEM) \
		--proxy https://$(NETWORK)-gateway.multiversx.com \
		--chain $(NETWORK) \
		--recall-nonce \
		--gas-limit 60000000 \
		--arguments $$(mxpy wallet pem-address $(WALLET_PEM)) \
		--send
	@echo "$(GREEN)ProjectFactory contract deployed!$(NC)"

deploy-oracle: build ## Deploy AiOracle contract
	@echo "$(YELLOW)Deploying AiOracle contract to $(NETWORK)...$(NC)"
	@if [ ! -f $(WALLET_PEM) ]; then \
		echo "$(RED)Error: Wallet file $(WALLET_PEM) not found!$(NC)"; \
		exit 1; \
	fi
	@mxpy contract deploy output/ai_oracle/ai_oracle.wasm \
		--pem $(WALLET_PEM) \
		--proxy https://$(NETWORK)-gateway.multiversx.com \
		--chain $(NETWORK) \
		--recall-nonce \
		--gas-limit 60000000 \
		--arguments $$(mxpy wallet pem-address $(WALLET_PEM)) \
		--send
	@echo "$(GREEN)AiOracle contract deployed!$(NC)"

deploy-all: deploy-auto-builder deploy-factory deploy-oracle ## Deploy all contracts
	@echo "$(GREEN)All contracts deployed successfully!$(NC)"

# Interaction commands
call-create-project: ## Call createProject on AutoBuilder contract
	@echo "$(YELLOW)Creating project via smart contract...$(NC)"
	@read -p "Enter contract address: " contract_addr; \
	read -p "Enter project name: " name; \
	read -p "Enter project description: " desc; \
	read -p "Enter project type: " type; \
	mxpy contract call $$contract_addr \
		--pem $(WALLET_PEM) \
		--proxy https://$(NETWORK)-gateway.multiversx.com \
		--chain $(NETWORK) \
		--function createProject \
		--arguments str:$$name str:$$desc str:$$type str:'{}' \
		--gas-limit 10000000 \
		--send

query-project: ## Query project by ID
	@echo "$(YELLOW)Querying project...$(NC)"
	@read -p "Enter contract address: " contract_addr; \
	read -p "Enter project ID: " project_id; \
	mxpy contract query $$contract_addr \
		--proxy https://$(NETWORK)-gateway.multiversx.com \
		--function getProject \
		--arguments $$project_id

# Utility commands
clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	@rm -rf output/
	@cargo clean
	@echo "$(GREEN)Clean complete!$(NC)"

wallet-new: ## Generate new wallet for testing
	@echo "$(YELLOW)Generating new wallet...$(NC)"
	@mxpy wallet new --format pem --outfile wallet-new.pem
	@echo "$(GREEN)New wallet generated as wallet-new.pem$(NC)"
	@echo "$(RED)⚠️  IMPORTANT: This is a test wallet. Don't use for mainnet!$(NC)"

wallet-address: ## Show wallet address
	@if [ ! -f $(WALLET_PEM) ]; then \
		echo "$(RED)Error: Wallet file $(WALLET_PEM) not found!$(NC)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)Wallet address:$(NC)"
	@mxpy wallet pem-address $(WALLET_PEM)

check: format lint test build ## Run all checks (format, lint, test, build)
	@echo "$(GREEN)All checks passed! ✅$(NC)"

dev-deploy: ## Quick deploy to devnet (builds and deploys all)
	@$(MAKE) NETWORK=devnet deploy-all

testnet-deploy: ## Deploy to testnet
	@$(MAKE) NETWORK=testnet deploy-all

# Network-specific shortcuts
devnet: ## Set network to devnet
	@echo "$(YELLOW)Switching to devnet...$(NC)"
	@$(MAKE) NETWORK=devnet

testnet: ## Set network to testnet
	@echo "$(YELLOW)Switching to testnet...$(NC)"
	@$(MAKE) NETWORK=testnet

mainnet: ## Set network to mainnet
	@echo "$(RED)⚠️  WARNING: You are targeting MAINNET!$(NC)"
	@echo "$(RED)Make sure you understand the implications!$(NC)"
	@$(MAKE) NETWORK=mainnet

# Documentation
docs: ## Generate documentation
	@echo "$(YELLOW)Generating documentation...$(NC)"
	@cargo doc --open
	@echo "$(GREEN)Documentation generated and opened!$(NC)"

info: ## Show project information
	@echo "$(YELLOW)BlockchainAI Smart Contracts$(NC)"
	@echo ""
	@echo "📁 Contracts:"
	@echo "  - AutoBuilder: Main project management contract"
	@echo "  - ProjectFactory: Template deployment contract  "
	@echo "  - AiOracle: AI-blockchain integration contract"
	@echo ""
	@echo "🌐 Networks:"
	@echo "  - devnet: Development network (default)"
	@echo "  - testnet: Test network"
	@echo "  - mainnet: Production network"
	@echo ""
	@echo "🔧 Current config:"
	@echo "  Network: $(NETWORK)"
	@echo "  Wallet: $(WALLET_PEM)"
	@echo ""
	@echo "💡 Quick start:"
	@echo "  1. make install"
	@echo "  2. make wallet-new"
	@echo "  3. make build"
	@echo "  4. make deploy-all"

status: ## Show development status
	@echo "$(YELLOW)Development Status$(NC)"
	@echo ""
	@if [ -d "output" ]; then \
		echo "$(GREEN)✅ Contracts built$(NC)"; \
	else \
		echo "$(RED)❌ Contracts not built$(NC)"; \
	fi
	@if command -v mxpy &> /dev/null; then \
		echo "$(GREEN)✅ mxpy installed$(NC)"; \
	else \
		echo "$(RED)❌ mxpy not installed$(NC)"; \
	fi
	@if [ -f "$(WALLET_PEM)" ]; then \
		echo "$(GREEN)✅ Wallet file exists$(NC)"; \
	else \
		echo "$(RED)❌ Wallet file missing$(NC)"; \
	fi