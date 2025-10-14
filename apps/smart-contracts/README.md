# 🔗 BlockchainAI Smart Contracts

MultiversX smart contracts pentru platforma BlockchainAI AutoBuilder, scrise în Rust folosind MultiversX SDK.

## 📋 Contracte Disponibile

### 1. 🏗️ AutoBuilder Contract (`auto_builder.rs`)
Contract principal pentru gestionarea proiectelor:
- ✅ Crearea și gestionarea proiectelor
- ✅ Sisteme de autorizare și proprietate
- ✅ Integrare cu AI Oracle pentru generarea de cod
- ✅ Evenimente pentru tracking

### 2. 🏭 ProjectFactory Contract (`project_factory.rs`)
Contract pentru deployment de template-uri:
- ✅ Gestionarea template-urilor de proiecte
- ✅ Deployment automat de contracte noi
- ✅ Sistem de fee-uri
- ✅ Registry de template-uri

### 3. 🤖 AiOracle Contract (`ai_oracle.rs`)
Oracle pentru integrarea AI cu blockchain:
- ✅ Request-uri AI on-chain
- ✅ Callback system pentru răspunsuri
- ✅ Rate limiting și fee management
- ✅ Securitate și validare

## 🚀 Quick Start

### Prerequisite
```bash
# Instalează MultiversX CLI
pip install multiversx-sdk-cli

# Verifică instalarea
mxpy --version
```

### Build Contracte
```bash
# Build toate contractele
make build

# Build contract specific
mxpy contract build src/auto_builder.rs --output-dir output/auto_builder
```

### Testing
```bash
# Rulează testele
make test

# Sau cu cargo direct
cargo test
```

### Deploy pe Devnet
```bash
# Generează wallet pentru testing
make wallet-new

# Deploy toate contractele
make deploy-all

# Sau individual
make deploy-auto-builder
make deploy-factory
make deploy-oracle
```

## 🔧 Dezvoltare

### Structura Proiectului
```
src/
├── lib.rs              # Export principal
├── auto_builder.rs     # Contract principal
├── project_factory.rs  # Factory pattern
├── ai_oracle.rs        # AI Oracle
└── modules/            # Module partajate
    ├── access_control.rs
    ├── payment_handler.rs
    └── storage.rs
```

### Workflow de Dezvoltare
```bash
# 1. Format cod
make format

# 2. Lint
make lint

# 3. Test
make test

# 4. Build
make build

# 5. Deploy și test pe devnet
make dev-deploy
```

### Comenzi Utile
```bash
# Verifică statusul de dezvoltare
make status

# Informații despre proiect
make info

# Curăță build artifacts
make clean

# Generează documentație
make docs

# Rulează toate check-urile
make check
```

## 🌐 Deployment

### Devnet (Development)
```bash
# Setup wallet
make wallet-new
# Salvează wallet-ul ca wallet.pem

# Deploy
make NETWORK=devnet deploy-all
```

### Testnet
```bash
# Folosește wallet real cu EGLD pentru gas
make NETWORK=testnet WALLET_PEM=my-wallet.pem deploy-all
```

### Mainnet ⚠️
```bash
# ATENȚIE: Doar pentru producție!
make NETWORK=mainnet WALLET_PEM=production-wallet.pem deploy-all
```

## 🔍 Interacțiuni cu Contractele

### Crearea unui Proiect
```bash
# Prin Makefile
make call-create-project

# Manual cu mxpy
mxpy contract call <CONTRACT_ADDRESS> \
  --pem wallet.pem \
  --proxy https://devnet-gateway.multiversx.com \
  --chain devnet \
  --function createProject \
  --arguments str:"My Project" str:"Description" str:"WEB3_APP" str:'{}' \
  --gas-limit 10000000 \
  --send
```

### Query Proiect
```bash
# Prin Makefile
make query-project

# Manual
mxpy contract query <CONTRACT_ADDRESS> \
  --proxy https://devnet-gateway.multiversx.com \
  --function getProject \
  --arguments 1
```

### Request AI Generation
```bash
mxpy contract call <CONTRACT_ADDRESS> \
  --pem wallet.pem \
  --proxy https://devnet-gateway.multiversx.com \
  --chain devnet \
  --function requestAiGeneration \
  --arguments 1 str:"Generate React component" str:"component" \
  --gas-limit 5000000 \
  --send
```

## 📊 Monitoring și Events

### Monitorizarea Evenimentelor
```javascript
// JavaScript example pentru monitoring
const { ApiNetworkProvider } = require('@multiversx/sdk-network-providers')

const networkProvider = new ApiNetworkProvider('https://devnet-api.multiversx.com')

// Listen pentru evenimente de creare proiect
const events = await networkProvider.getTransactionEvents(txHash)
console.log(events.filter(e => e.identifier === 'projectCreated'))
```

### Analytics Dashboard
Contractele emit evenimente pentru:
- `projectCreated` - Nou proiect creat
- `projectStatusUpdated` - Status schimbat
- `aiGenerationRequested` - Request AI trimis
- `aiRequestFulfilled` - Răspuns AI primit
- `templateRegistered` - Template nou
- `projectDeployed` - Contract deployat

## 🔒 Securitate

### Best Practices Implementate
- ✅ Access control cu ownership
- ✅ Rate limiting pentru AI requests
- ✅ Input validation și sanitization
- ✅ Reentrancy protection
- ✅ Gas optimization
- ✅ Event logging pentru audit

### Audit Trail
Toate acțiunile importante sunt logged prin evenimente pentru:
- Compliance și audit
- Analytics și monitoring
- Debugging și support

## 🧪 Testing Strategy

### Unit Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;
    use multiversx_sc_scenario::*;

    #[test]
    fn test_create_project() {
        // Test logic here
    }
}
```

### Integration Tests
```bash
# Scenarii de testare completă
cargo test --features=integration
```

### Load Testing
```bash
# Test performance pe devnet
./scripts/load-test.sh
```

## 📈 Roadmap

### V1.0 (Current)
- [x] Basic project management
- [x] AI Oracle integration
- [x] Template factory
- [x] Events și monitoring

### V1.1 (Next)
- [ ] Multi-signature pentru admin
- [ ] Advanced access control (roles)
- [ ] Fee distribution system
- [ ] Governance features

### V1.2 (Future)
- [ ] Cross-chain compatibility
- [ ] NFT integration pentru projects
- [ ] DAO voting pentru templates
- [ ] Revenue sharing system

## 🤝 Contributing

1. Fork repository-ul
2. Creează branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines
- Folosește `make check` înainte de commit
- Scrie teste pentru funcționalități noi
- Documentează contractele și funcțiile
- Respectă patternurile existente

## 📚 Resources

- [MultiversX Documentation](https://docs.multiversx.com/)
- [Smart Contract Examples](https://github.com/multiversx/mx-contracts-rs)
- [MultiversX SDK](https://github.com/multiversx/mx-sdk-rs)
- [Project Wiki](https://github.com/Gzeu/BlockchainAI-AutoBuilder/wiki)

## ❓ Support

- 📧 Email: pricopgeorge@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/Gzeu/BlockchainAI-AutoBuilder/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Gzeu/BlockchainAI-AutoBuilder/discussions)

---

<div align="center">

**Construit cu ❤️ folosind MultiversX & Rust**

[⭐ Star pe GitHub](https://github.com/Gzeu/BlockchainAI-AutoBuilder) • [📖 Documentație](../docs/) • [🚀 Demo Live](https://blockchainai-autobuilder.vercel.app)

</div>