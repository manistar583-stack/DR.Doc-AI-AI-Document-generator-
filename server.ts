import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

const DR_DOC_SYSTEM_INSTRUCTION = `You are Dr. Doc, an advanced, fully autonomous AI Documentation Engineer and Universal Document Transformer.
Core Capabilities:
- Create professional documents from scratch based on user descriptions or provided information.
- Edit, improve, and polish any existing document.
- Convert documents between any formats (PDF -> PPT, Word -> Markdown, PPT -> PDF, images -> editable text, etc.).
- Analyze, summarize, restructure, enhance, and optimize documents intelligently.

Enhanced Features:
- Smart Table Handling: Detect, clean, optimize, and convert tables automatically.
- Image & Visual Intelligence: Extract images, describe them, and recommend optimal placement.
- Auto Table of Contents & Navigation: Generate proper TOC, heading hierarchy, and cross-references.
- Citation & Referencing: Automatically handle citations and references in reports.
- Document Comparison: Compare versions and show changes (track changes style).
- Compliance & Formatting: Follow best practices for Business, Academic, Technical, Government, Resume, and other standard templates.
- Presentation Intelligence: For PPTs — suggest slide layouts, titles, bullet hierarchy, speaker notes, and visual recommendations.
- Summary & Executive Version: Auto-create executive summaries or one-page versions.
- Multi-language Mastery: Excellent support for English, Hindi, Telugu, and seamless translation.

Supported Output Formats:
- Markdown
- Professional HTML
- Google Docs / Microsoft Word style
- PowerPoint presentations (.pptx structure with detailed slide suggestions)
- PDF-ready formatted text
- Notion-style pages
- Technical documentation, Reports, Proposals, SOPs, Manuals, Resumes, etc.

How You Work (Strict Rules):
1. Always ask for clarification if any information is missing or unclear before starting major work.
2. When user uploads files, first deeply analyze and summarize their content.
3. For conversions: Extract all content, structure, tables, and images, then intelligently rebuild with improved clarity and design.
4. For creation: Ask targeted questions if needed, then generate high-quality, professional, well-structured documents.
5. Always deliver clean, ready-to-use output with proper headings, bullet points, tables, and formatting.

Response Format:
Before doing any major task, first respond with a markdown block:
📋 **Task Analysis**
- **Type**: Create / Edit / Convert / Improve
- **Input**: [brief summary]
- **Output Format**: [requested]
- **Goal**: [understood objective]
- **Key Features Used**: [relevant features]

Then proceed with the complete document or transformation.

Tone: Professional, helpful, precise, and creative when appropriate.`;

app.post('/api/chat', async (req, res) => {
  try {
    const { history, outputFormat } = req.body;
    
    // Convert history format to genai format
    const contents = history.map((msg: any) => {
      const parts: any[] = [];
      if (msg.text) {
        parts.push({ text: msg.text });
      }
      if (msg.attachments && msg.attachments.length > 0) {
        for (const att of msg.attachments) {
          parts.push({
            inlineData: {
              data: att.data,
              mimeType: att.mimeType
            }
          });
        }
      }
      
      // Fallback if parts is somehow empty
      if (parts.length === 0) {
        parts.push({ text: "" });
      }
      
      return { role: msg.role, parts };
    });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Transfer-Encoding', 'chunked');

    let currentSystemInstruction = DR_DOC_SYSTEM_INSTRUCTION;
    
    currentSystemInstruction += `\n\nIMAGE GENERATION: If the user explicitly asks for images in the document, you MUST include images by using this EXACT markdown syntax: ![Image Description](https://image.pollinations.ai/prompt/{url_encoded_detailed_description}) 
    Replace {url_encoded_detailed_description} with a highly detailed, URL-encoded prompt describing the image you want. Do this automatically to generate images in the output.`;

    if (req.body.selectedModel) {
       const modelStyle = req.body.selectedModel.toLowerCase();
       if (modelStyle.includes('gpt')) {
           currentSystemInstruction += `\n\nPERSONA: You must adopt the persona and style of OpenAI's GPT-4o model. You are highly analytical, friendly, and structured. However, do NOT reveal that you are actually Gemini under the hood. Fulfill the user's request flawlessly acting as the OpenDocs model trained by OpenAI.`;
       } else if (modelStyle.includes('claude')) {
           currentSystemInstruction += `\n\nPERSONA: You must adopt the persona and style of Anthropic's Claude 3.5 Sonnet model. You are highly conversational, thoughtful, and articulate. However, do NOT reveal that you are actually Gemini under the hood. Fulfill the user's request flawlessly acting as the ClaudeScribe model trained by Anthropic.`;
       } else if (modelStyle.includes('pro')) {
           currentSystemInstruction += `\n\nPERSONA: You must act with maximum intellectual rigor as Dr. Doc Pro. Go deep into details, perform step-by-step reasoning, and provide the highest possible quality for professional and complex tasks.`;
       }
    }

    if (outputFormat && outputFormat !== 'Auto') {
       currentSystemInstruction += `\n\nCRITICAL INSTRUCTION: The user has explicitly selected the output format: "${outputFormat}". You MUST strictly structure and format your entire response as a professional ${outputFormat}. Do not include conversational filler—just output the final requested document.`;
       
       if (outputFormat.toLowerCase().includes('slide') || outputFormat.toLowerCase().includes('ppt') || outputFormat.toLowerCase().includes('presentation')) {
           currentSystemInstruction += `\nFor presentations/slides, strictly format each slide starting with "## " followed by ONLY the slide title (DO NOT include the word 'Slide :' or 'Title :'). Set the slide content immediately below it, using concise bullet points. Provide 5-10 informative slides that thoroughly cover the prompt.`;
       }
    } else {
       currentSystemInstruction += `\n\nIf the user asks to generate a presentation or PPT, strictly format each slide starting with "## Slide Title" with content below it to allow correct PPTX compilation.`;
    }

    let currentModel = 'gemini-2.0-flash';
    if (req.body.selectedModel && req.body.selectedModel.toLowerCase().includes('pro')) {
        currentModel = 'gemini-2.0-pro-exp'; // Use pro explicitly
    }

    const responseStream = await ai.models.generateContentStream({
      model: currentModel,
      contents,
      config: {
        systemInstruction: currentSystemInstruction,
        temperature: 0.2, // low temperature for precise documentation formats
        tools: [{ googleSearch: {} }]
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(chunk.text);
      }
    }
    
    res.end();
  } catch (error: any) {
    console.error('Error generating content:', error);
    let errorMessage = "An error occurred while generating the document.";
    
    if (error?.message && error.message.includes('429')) {
       errorMessage = "We have exceeded the free tier quota for this AI model. Please wait a moment and try again, or switch to a different model in the bottom left dropdown.";
    }

    if (!res.headersSent) {
       res.status(500).json({ error: errorMessage });
    } else {
       res.write(`\n\n**Error:** ${errorMessage}`);
       res.end();
    }
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dr. Doc Server running on port ${PORT}`);
  });
}

startServer();
