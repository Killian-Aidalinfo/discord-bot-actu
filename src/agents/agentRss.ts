import 'dotenv/config';
import { Agent } from "@mastra/core/agent";
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { createTool } from '@mastra/core';
import { z } from 'zod';
import Parser from 'rss-parser';
import { google } from '@ai-sdk/google';
// Initialiser le parser RSS
const parser = new Parser();

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:./memory.db",
  }),
});

const today = new Date().toLocaleDateString('fr-FR', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric',
  weekday: 'long'
});

// Outil pour lire les flux RSS
const rssFeedTool = createTool({
  id: 'rss-feed-reader',
  description: 'Lit et analyse un flux RSS depuis une URL',
  inputSchema: z.object({
    url: z.string().url().describe('L\'URL du flux RSS à lire'),
    limit: z.number().optional().default(10).describe('Nombre maximum d\'articles à récupérer (défaut: 10)')
  }),
  outputSchema: z.object({
    title: z.string().describe('Titre du flux RSS'),
    description: z.string().optional().describe('Description du flux'),
    link: z.string().optional().describe('Lien vers le site web'),
    articles: z.array(z.object({
      title: z.string().describe('Titre de l\'article'),
      link: z.string().optional().describe('Lien vers l\'article'),
      pubDate: z.string().optional().describe('Date de publication'),
      contentSnippet: z.string().optional().describe('Extrait du contenu'),
      creator: z.string().optional().describe('Auteur de l\'article')
    })).describe('Liste des articles du flux')
  }),
  execute: async ({ context }) => {
    try {
      const { url, limit } = context;
      
      // Parser le flux RSS
      const feed = await parser.parseURL(url);
      
      // Limiter le nombre d'articles
      const articles = feed.items.slice(0, limit).map(item => ({
        title: item.title || 'Sans titre',
        link: item.link || undefined,
        pubDate: item.pubDate || undefined,
        contentSnippet: item.contentSnippet || item.content || undefined,
        creator: item.creator || item.author || undefined
      }));

      return {
        title: feed.title || 'Flux RSS',
        description: feed.description || undefined,
        link: feed.link || undefined,
        articles
      };
    } catch (error) {
      throw new Error(`Erreur lors de la lecture du flux RSS: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
});

export const rssAgent = new Agent({
  name: 'RSS Feed Agent',
  instructions: 
    `You are a specialized RSS feed reader assistant. ` +
    `Today is ${today}. ` +
    
    `Your capabilities include: ` +
    `- Reading and parsing RSS feeds from URLs ` +
    `- Summarizing RSS feed content and articles ` +
    `- Providing information about the latest articles from various sources ` +
    `- Helping users stay updated with news and content from their favorite websites ` +
    
    `When users provide RSS feed URLs or ask about specific feeds: ` +
    `- Use the rssFeedTool to fetch and parse the RSS content ` +
    `- Provide clear summaries of the articles ` +
    `- Highlight the most important or recent articles ` +
    `- Format the information in an easy-to-read way ` +
    
    `You can help with popular RSS feeds from tech blogs, news sites, ` +
    `podcasts, and other content sources. Always be helpful and provide ` +
    `organized information about the RSS content.`,
  model: google('gemini-2.5-flash-preview-04-17'),
  memory,
  tools: { rssFeedTool }
});