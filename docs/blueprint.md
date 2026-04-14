# **App Name**: AI Knowledge Assistant

## Core Features:

- Secure User Authentication: Users can register, log in, and manage their sessions via Supabase Auth, ensuring their documents and data remain private and secure.
- Document Upload & Processing: Allows users to upload PDF, text files, or notes. The system stores these files in Supabase Storage and automatically extracts text content for further processing. This feature includes upload progress indicators.
- Embeddings Generation & Storage: The backend automatically processes uploaded document text by splitting it into manageable chunks. OpenAI Embeddings (or similar) are generated for each chunk and stored efficiently in the Supabase pgvector database, preparing the data for semantic search.
- RAG-Powered AI Query & Response: Users can ask questions about their uploaded documents. The system converts the user's query into an embedding, performs a similarity search in the vector database to retrieve the top relevant text chunks, and then uses these chunks as a tool for an LLM (OpenAI GPT or Claude API) to generate an answer based ONLY on the provided context.
- Interactive Chat Interface: Provides a clean, modern chat UI to display the conversation history. AI responses are presented clearly, and when possible, indicate the source documents from which information was retrieved.
- Document Management Dashboard: Users have a dedicated area to view all their uploaded files, initiate re-processing of embeddings if necessary, and delete documents, all with appropriate loading states for operations.

## Style Guidelines:

- Color scheme: A sophisticated, high-contrast palette featuring muted black, white, yellow, and red, designed for clear readability and striking visual impact.
- Primary color: A muted, warm yellow (#E0B92B), evoking attention and intellectual curiosity without being overly bright.
- Background color: A clean, off-white (#F7F7F7) to ensure maximum contrast and readability for text and elements.
- Accent color: A deep, muted red (#A62E2E) to draw attention to interactive elements and calls to action, providing a strong but refined visual highlight.
- Headlines: 'Space Grotesk' (sans-serif) for a modern, tech-forward, and clean look. This font delivers a sense of precision and contemporary design.
- Body text: 'Inter' (sans-serif) for its high readability, objective clarity, and versatility across different text lengths, ensuring a comfortable reading experience for document content and chat interactions.
- Use minimalist, line-art style icons that convey functionality without distraction, maintaining a clean and modern aesthetic that aligns with precision and clarity.
- Adopt a clean and intuitive dashboard layout, prioritizing logical organization of information. Ensure fully mobile-responsive design across all views for seamless access on any device.
- Incorporate subtle animations for element transitions, document upload progress, and AI response loading states, providing smooth user feedback without being overly flashy.