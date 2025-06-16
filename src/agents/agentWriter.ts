import 'dotenv/config';
import { Agent } from "@mastra/core/agent";
import { Memory } from '@mastra/memory';
import { google } from '@ai-sdk/google';
import { LibSQLStore } from '@mastra/libsql';

const memory = new Memory({
  storage: new LibSQLStore({
    url: "file:./memory.db",
  }),
});

export const writerAgent = new Agent({
  name: 'Content Writer',
  instructions: `You are an expert content rewriter specialized in tech news and research aggregation. Your goal is to:
  1. Take multiple pieces of content (RSS feeds, web research, etc.) and create a comprehensive digest
  2. Identify common trends and important topics across sources
  3. Organize the information with clear sections
  4. Maintain accuracy while improving readability and flow
  5. Respond in plain text with no Markdown formatting
  When rewriting:
  - Prioritize the most important and current information
  - Group related topics together
  - Highlight major trends and innovations
  - Use a professional yet accessible tone
  - Include dates and sources when available
  - Do NOT use Markdown; answer as if sending a simple text message
  `,
  memory,
  model: google('gemini-2.5-flash-preview-04-17')
});