# Contributing to BlockchainAI AutoBuilder

Mulțumim că vrei să contribui! Urmează pașii de mai jos pentru un flux eficient și sigur.

## 📐 Standarde
- TypeScript peste tot
- ESLint + Prettier obligatoriu
- Conventional Commits (feat, fix, docs, chore, refactor, test, ci)

## 🔀 Workflow Git
1. Creează branch din `develop` (ex: `feat/wallet-connect`)
2. Lucrează incremental cu commit-uri mici
3. Rulează local: `pnpm lint && pnpm test && pnpm typecheck`
4. Deschide PR către `develop`

## ✅ Checklist PR
- [ ] Lint fără erori
- [ ] Teste trec (unit/e2e după caz)
- [ ] Docs actualizată (`/docs`)
- [ ] Impact de securitate analizat

## 🧪 Testare
```bash
pnpm test:unit      # Unit tests
pnpm test:e2e       # End-to-end tests
pnpm test:contracts # Contract tests
```

## 🔐 Securitate
- Niciun secret în repo
- Folosește GitHub Secrets pentru CI/CD
- Rulează `pnpm audit` înainte de PR

## 🤖 AI în Fluxul de lucru
- Poți rula `pnpm ai:review` pentru feedback automat
- PR-urile vor primi comentarii automate de la AI

## 📜 Licență
Prin contribuții, accepți licența MIT a proiectului.
