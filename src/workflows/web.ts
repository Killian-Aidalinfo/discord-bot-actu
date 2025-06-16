import 'dotenv/config';
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { firecrawlAgent } from "../agents/firecrawl-agent/index";
import { writerAgent } from "../agents/agentWriter";


// Étape 1: Recherche web
const webSearchStep = createStep({
  id: "web-search-step",
  description: "Effectue une recherche web approfondie sur le sujet donné",
  inputSchema: z.object({
    query: z.string().describe("Le sujet ou la requête de recherche")
  }),
  outputSchema: z.object({
    searchResults: z.string().describe("Les résultats de recherche compilés")
  }),

  execute: async ({ inputData }) => {
    const { query } = inputData;
    const message1 = "🔎 Étape 1: Recherche web en cours...";
    console.log(message1);

    const prompt = `Recherche des informations détaillées sur: ${query}`;
    const { text } = await firecrawlAgent.generate([
      { role: "user", content: prompt }
    ]);

    const message2 = "✅ Étape 1: Recherche web terminée.";
    console.log(message2);

    return {
      searchResults: text
    };
  }
});

// Étape 2: Réécriture du contenu
const rewriteStep = createStep({
  id: "rewrite-step", 
  description: "Réécrit et améliore le contenu de recherche",
  inputSchema: z.object({
    searchResults: z.string().describe("Les résultats de recherche à réécrire")
  }),
  outputSchema: z.object({
    rewrittenContent: z.string().describe("Le contenu réécrit et amélioré")
  }),

  execute: async ({ inputData }) => {
    const { searchResults } = inputData;
    const message1 = "✍️ Étape 2: Réécriture du contenu en cours...";
    console.log(message1);

    const prompt = `
      Réécris et améliore le contenu suivant de manière claire et engageante:
      
      ${searchResults}
      
      Instructions:
      - Organise le contenu avec des titres appropriés
      - Améliore la lisibilité et la structure
      - Garde toutes les informations importantes
      - Rends le ton professionnel mais accessible
    `;

    const { text } = await writerAgent.generate([
      { role: "user", content: prompt }
    ]);

    const message2 = "✅ Étape 2: Réécriture terminée.";
    console.log(message2);
    return {
      rewrittenContent: text
    };
  }
});

// Création du workflow complet
export const webResearchWorkflow = createWorkflow({
  id: "web-research-workflow",
  description: "Workflow de recherche web et réécriture de contenu",
  inputSchema: z.object({
    query: z.string().describe("Le sujet de recherche")
  }),
  outputSchema: z.object({
    rewrittenContent: z.string().describe("Le contenu final réécrit et amélioré")
  })
})
  .then(webSearchStep)
  .then(rewriteStep)
  .commit();