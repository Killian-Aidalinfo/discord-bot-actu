# Discord Bot Actualités

Un bot Discord intelligent qui utilise l'IA pour fournir des actualités technologiques et répondre aux questions des utilisateurs.

## Fonctionnalités

- `/ping` - Test de connectivité (répond "Pong!")
- `/chat [message]` - Conversation avec l'assistant IA spécialisé dans les actualités tech
- Intégration RSS pour les actualités en temps réel
- Réponses automatiquement divisées si elles dépassent 2000 caractères

## Installation

1. Installez les dépendances :
```bash
pnpm install
```

2. Configurez les variables d'environnement dans le fichier `.env` :
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GOOGLE_API_KEY=your_google_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

## Configuration

### Obtenir les clés Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Allez dans l'onglet "Bot" et créez un bot
4. Copiez le token du bot dans `DISCORD_TOKEN`
5. Copiez l'ID de l'application dans `CLIENT_ID`

### Obtenir les clés API

#### Google API Key (pour Gemini)
1. Allez sur [Google AI Studio](https://aistudio.google.com/)
2. Créez une clé API pour Gemini
3. Ajoutez-la dans `GOOGLE_API_KEY`

#### Firecrawl API Key (optionnel, pour la recherche web)
1. Créez un compte sur [Firecrawl](https://firecrawl.dev/)
2. Obtenez votre clé API
3. Ajoutez-la dans `FIRECRAWL_API_KEY`

### Permissions du bot

Le bot a besoin des permissions suivantes :
- `applications.commands` (pour les commandes slash)
- `Send Messages` (pour répondre)
- `Use Slash Commands`


## Utilisation

### Démarrer le bot en mode développement
```bash
pnpm dev
```

### Démarrer le bot en production
```bash
pnpm start
```

## Commandes disponibles

- `/ping` - Test de connectivité
- `/chat [message]` - Conversation avec l'assistant IA
  - Exemple : `/chat actualités du jour`
  - Exemple : `/chat dernières nouvelles tech`
  - Exemple : `/chat que se passe-t-il dans le monde de la tech ?`

## Architecture

Le bot utilise :
- **Discord.js** pour l'interaction avec Discord
- **Mastra** pour la gestion des agents IA
- **Google Gemini** comme modèle de langage
- **Workflows RSS** pour l'agrégation d'actualités
- **TypeScript** pour un code typé et robuste

## Développement

Structure du projet :
```
src/
├── index.ts              # Point d'entrée du bot Discord
├── agents/               # Agents IA spécialisés
│   ├── agentMaster.ts   # Agent principal pour les actualités
│   ├── agentRss.ts      # Agent pour l'analyse RSS
│   └── agentWriter.ts   # Agent pour la rédaction
└── workflows/           # Workflows automatisés
    ├── index.ts
    └── web.ts          # Workflow de recherche web
```
