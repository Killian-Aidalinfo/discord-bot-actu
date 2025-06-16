import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
import { chefAgent } from './agents/agentMaster';

// Charger les variables d'environnement
dotenv.config();

// Créer une nouvelle instance du client Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
  ],
});

// Définir les commandes /ping et /chat
const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Répond avec pong!')
        .toJSON(),
    new SlashCommandBuilder()
        .setName('chat')
        .setDescription('Converser avec l\'assistant IA')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('Votre message à l\'assistant')
                .setRequired(true))
        .toJSON(),
];

// Fonction pour enregistrer les commandes slash
async function deployCommands() {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    try {
        console.log('Déploiement des commandes slash...');

        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID!),
            { body: commands },
        );

        console.log('Commandes slash déployées avec succès!');
    } catch (error) {
        console.error('Erreur lors du déploiement des commandes:', error);
    }
}

// Event: Bot prêt
client.once('ready', async () => {
    console.log(`Bot connecté en tant que ${client.user?.tag}!`);
    await deployCommands();
});

// Event: Interaction avec les commandes slash
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    } else if (commandName === 'chat') {
        const message = interaction.options.getString('message', true);
        
        try {
            // Répondre immédiatement pour éviter le timeout
            await interaction.reply('🤖 Recherche d\'informations...');
            
            // Créer un threadId unique basé sur l'utilisateur et la date
            const uniqueThreadId = `discord_chat_${interaction.user.id}_${new Date().toDateString().replace(/\s/g, '_')}`;
            
            // Envoyer le message à l'agent
            const response = await chefAgent.generate(message, {
                resourceId: `discord_user_${interaction.user.id}`,
                threadId: uniqueThreadId,
            });
            
            // Fonction pour diviser le texte en chunks de 2000 caractères max
            const splitMessage = (text: string, maxLength: number = 2000): string[] => {
                if (text.length <= maxLength) {
                    return [text];
                }
                
                const chunks: string[] = [];
                let currentChunk = '';
                
                // Diviser par paragraphes d'abord
                const paragraphs = text.split('\n\n');
                
                for (const paragraph of paragraphs) {
                    // Si le paragraphe seul dépasse la limite, le diviser par phrases
                    if (paragraph.length > maxLength) {
                        const sentences = paragraph.split('. ');
                        for (const sentence of sentences) {
                            const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + sentence + (sentence.endsWith('.') ? '' : '.');
                            
                            if (potentialChunk.length > maxLength) {
                                if (currentChunk) {
                                    chunks.push(currentChunk.trim());
                                    currentChunk = sentence + (sentence.endsWith('.') ? '' : '.');
                                } else {
                                    // Si même une phrase dépasse, la couper brutalement
                                    chunks.push(sentence.substring(0, maxLength - 3) + '...');
                                }
                            } else {
                                currentChunk = potentialChunk;
                            }
                        }
                    } else {
                        const potentialChunk = currentChunk + (currentChunk ? '\n\n' : '') + paragraph;
                        
                        if (potentialChunk.length > maxLength) {
                            chunks.push(currentChunk.trim());
                            currentChunk = paragraph;
                        } else {
                            currentChunk = potentialChunk;
                        }
                    }
                }
                
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                
                return chunks;
            };
            
            // Diviser la réponse si nécessaire
            const messageChunks = splitMessage(response.text);
            
            // Envoyer le premier chunk en modifiant la réponse initiale
            await interaction.editReply(messageChunks[0]);
            
            // Envoyer les chunks suivants en tant que nouveaux messages
            for (let i = 1; i < messageChunks.length; i++) {
                await interaction.followUp(messageChunks[i]);
            }
            
        } catch (error) {
            console.error('Erreur lors de la génération de la réponse:', error);
            await interaction.editReply('Désolé, une erreur s\'est produite lors du traitement de votre demande. 😔');
        }
    }
});

// Gestion des erreurs
client.on('error', (error) => {
    console.error('Erreur du client Discord:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Promesse rejetée non gérée:', error);
});

// Connexion du bot
client.login(process.env.DISCORD_TOKEN);