export type AIContext = {
  homestayId?: string;
  bookingReference?: string;
};

export interface AIProvider {
  sendMessage(message: string, context: AIContext): Promise<string>;
  retrieveRelevantKnowledge(query: string, context: AIContext): Promise<string[]>;
  callAllowedTools(tool: "checkAvailability" | "lookupBookingStatus", input: unknown): Promise<unknown>;
}

export class MockAIProvider implements AIProvider {
  async sendMessage() {
    return "I can help with homestay details, policies, and server-verified booking information.";
  }
  async retrieveRelevantKnowledge() {
    return ["Check-in begins at 2 PM.", "Availability and prices must be verified by StayFlow."];
  }
  async callAllowedTools(tool: "checkAvailability" | "lookupBookingStatus") {
    return { tool, status: "mock", authoritative: false };
  }
}
