import 'dotenv/config';
import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { rssAgent } from "../agents/agentRss";
import { writerAgent } from "../agents/agentWriter";

// Step 1: Lire Blog du Modérateur Tech
const blogModeratorStep = createStep({
  id: "blog-moderator-step",
  description: "Lit le flux RSS du Blog du Modérateur Tech",
  inputSchema: z.object({}),
  outputSchema: z.object({
    blogModeratorContent: z.string()
  }),

  execute: async () => {
    const message1 = "📡 Step 1: Lecture du flux RSS Blog du Modérateur Tech...";
    console.log(message1);
    
    const response = await rssAgent.generate(
      "Lis le flux RSS de https://www.blogdumoderateur.com/tech/feed/ et donne-moi un résumé CONCIS des 3 articles les plus récents seulement. Limite-toi à 2-3 phrases par article.",
      {
        resourceId: "rss_workflow",
        threadId: "rss_workflow_blog_moderator"
      }
    );

    const message2 = "✅ Step 1: Blog du Modérateur Tech terminé";
    console.log(message2);
    
    return {
      blogModeratorContent: response.text
    };
  }
});

// Step 2: Lire Le Monde Informatique Cloud
const mondeInformatiqueStep = createStep({
  id: "monde-informatique-step",
  description: "Lit le flux RSS du Monde Informatique Cloud",
  inputSchema: z.object({}),
  outputSchema: z.object({
    mondeInformatiqueContent: z.string()
  }),

  execute: async () => {
    const message1 = "📡 Step 2: Lecture du flux RSS Le Monde Informatique Cloud...";
    console.log(message1);
    
    const response = await rssAgent.generate(
      "Lis le flux RSS de https://www.lemondeinformatique.fr/flux-rss/thematique/le-monde-du-cloud-computing/rss.xml et donne-moi un résumé CONCIS des 3 articles les plus récents sur le cloud computing. Limite-toi à 2-3 phrases par article.",
      {
        resourceId: "rss_workflow",
        threadId: "rss_workflow_monde_informatique"
      }
    );

    const message2 = "✅ Step 2: Le Monde Informatique Cloud terminé";
    console.log(message2);

    return {
      mondeInformatiqueContent: response.text
    };
  }
});

// Step 3: Lire Forbes Innovation
const forbesStep = createStep({
  id: "forbes-step",
  description: "Lit le flux RSS de Forbes Innovation",
  inputSchema: z.object({}),
  outputSchema: z.object({
    forbesContent: z.string()
  }),

  execute: async () => {
    const message1 = "📡 Step 3: Lecture du flux RSS Forbes Innovation...";
    console.log(message1);
    
    const response = await rssAgent.generate(
      "Lis le flux RSS de https://www.forbes.com/innovation/feed et donne-moi un résumé CONCIS des 3 articles les plus récents sur l'innovation. Limite-toi à 2-3 phrases par article.",
      {
        resourceId: "rss_workflow",
        threadId: "rss_workflow_forbes"
      }
    );

    const message2 = "✅ Step 3: Forbes Innovation terminé";
    console.log(message2);

    return {
      forbesContent: response.text
    };
  }
});

// Step 4: Réécriture et synthèse finale
const rewriteStep = createStep({
  id: "rewrite-synthesis-step",
  description: "Réécrit et synthétise tous les contenus RSS",
  inputSchema: z.object({
    "blog-moderator-step": z.object({ blogModeratorContent: z.string() }),
    "monde-informatique-step": z.object({ mondeInformatiqueContent: z.string() }),
    "forbes-step": z.object({ forbesContent: z.string() })
  }),
  outputSchema: z.object({
    finalDigest: z.string()
  }),

  execute: async ({ inputData }) => {
    const message1 = "🔄 Step 4: Synthèse et réécriture...";
    console.log(message1);
    
    const blogModeratorContent = inputData["blog-moderator-step"].blogModeratorContent;
    const mondeInformatiqueContent = inputData["monde-informatique-step"].mondeInformatiqueContent;
    const forbesContent = inputData["forbes-step"].forbesContent;

    const synthesisPrompt = `
      Crée un digest tech quotidien professionnel à partir des contenus RSS suivants:

      Source 1 - Blog du Modérateur Tech:
      ${blogModeratorContent}

      Source 2 - Le Monde Informatique (Cloud):
      ${mondeInformatiqueContent}

      Source 3 - Forbes Innovation:
      ${forbesContent}

      Instructions:
      1. Crée une synthèse globale organisée par thèmes technologiques
      2. Identifie les tendances communes et les sujets importants
      3. Hiérarchise l'information par ordre d'importance
      4. Utilise uniquement du texte brut sans Markdown, comme un message WhatsApp
      5. Indique toujours la source et la date pour chaque article
      6. Garde un ton informatif et engageant avec des sections claires
    `;

    const response = await writerAgent.generate([
      { role: "user", content: synthesisPrompt }
    ]);

    const message2 = "✅ Step 4: Synthèse finale terminée, ça arrive soon !";
    console.log(message2);

    return {
      finalDigest: response.text
    };
  }
});

// Création du workflow complet
export const rssWorkflow = createWorkflow({
  id: "rss-aggregator-workflow",
  description: "Agrège et réécrit le contenu de plusieurs sources RSS tech",
  inputSchema: z.object({}),
  outputSchema: z.object({
    finalDigest: z.string()
  })
})
  .parallel([
    blogModeratorStep,
    mondeInformatiqueStep,
    forbesStep
  ])
  .then(rewriteStep)
  .commit();