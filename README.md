# Discord Bot

Un bot Discord simple qui répond à la commande `/ping` avec "🏓 Pong!".

## Installation

1. Installez les dépendances :
```bash
pnpm install
```

2. Configurez les variables d'environnement dans le fichier `.env` :
```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
GUILD_ID=your_guild_id_here
```

## Configuration

### Obtenir les clés Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Allez dans l'onglet "Bot" et créez un bot
4. Copiez le token du bot dans `DISCORD_TOKEN`
5. Copiez l'ID de l'application dans `CLIENT_ID`
6. Activez le mode développeur sur Discord, clic droit sur votre serveur > "Copier l'ID" et mettez-le dans `GUILD_ID`

### Permissions du bot

Le bot a besoin des permissions suivantes :
- `applications.commands` (pour les commandes slash)
- `Send Messages` (pour répondre)

URL d'invitation : `https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2048&scope=bot%20applications.commands`

## Utilisation

### Démarrer le bot en mode développement
```bash
pnpm dev
```

### Démarrer le bot en production
```bash
pnpm start
```

### Déployer les commandes manuellement
```bash
pnpm deploy
```

## Commandes disponibles

- `/ping` - Le bot répond avec "🏓 Pong!"
