import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";
import { InteractionMemory } from "../memory/pinecone";
import { v4 as uuidv4 } from "uuid";

export class VoiceService {
  private openai: OpenAI;
  private db: PrismaClient;
  private memory: InteractionMemory;

  constructor(db: PrismaClient, memory: InteractionMemory) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "",
    });
    this.db = db;
    this.memory = memory;
  }

  async transcribeAudio(file: Buffer): Promise<string> {
    const transcription = await this.openai.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    return transcription.text;
  }

  async generateSpeech(text: string): Promise<Buffer> {
    const response = await this.openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    return response;
  }

  async handleVoiceCommand(userId: string, audioFile: Buffer): Promise<string> {
    try {
      // Transcribe audio
      const text = await this.transcribeAudio(audioFile);

      // Track interaction
      await this.memory.addInteraction(
        uuidv4(),
        userId,
        text,
        "voice_command"
      );

      // Process command
      const response = await this.processCommand(userId, text);

      return response;
    } catch (error) {
      console.error("Voice command error:", error);
      return "I'm sorry, I had trouble processing your command.";
    }
  }

  private async processCommand(userId: string, command: string): Promise<string> {
    // TODO: Implement command processing logic
    // This could include:
    // - Content generation
    // - Platform management
    // - Analytics queries
    // - Account settings

    return "Command received. Processing...";
  }

  async getVoiceHistory(userId: string, limit: number = 10): Promise<any[]> {
    return this.memory.getRelevantInteractions(
      uuidv4(), // Use a dummy ID since we're searching by user
      userId,
      "voice_command",
      limit
    );
  }
}
