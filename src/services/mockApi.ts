
import type { StepResponse, VCTTState } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async startSession(_userId: string, _input: string): Promise<string> {
    await delay(300);
    return crypto.randomUUID();
  },

  async sendStep(sessionId: string, input: string): Promise<StepResponse> {
    await delay(1500); // Simulate processing time

    const responses = [
      "That's an interesting perspective. Let me analyze the underlying assumptions...",
      "I understand your point. The logical structure here suggests...",
      "This requires careful consideration. The ethical implications include...",
      "Based on my analysis, there are several key relationships to explore...",
      "Let me synthesize these ideas into a coherent response..."
    ];

    const randomState: VCTTState = {
      Voice: Math.random() * 0.3 + 0.7,
      Choice: Math.random() * 0.3 + 0.6,
      Transparency: Math.random() * 0.2 + 0.8,
      'Trust (τ)': Math.random() * 0.2 + 0.8,
      Regulation: Math.random() > 0.9 ? 'clarify' : 'normal'
    };

    return {
      response: responses[Math.floor(Math.random() * responses.length)],
      state: randomState,
      repair_count: Math.floor(Math.random() * 3),
      agent_logs: [
        '[Analyst] Analyzing logical structure...',
        '[Relational] Detecting emotional context...',
        '[Ethics] Checking value alignment...',
        '[Synthesiser] Generating coherent response...'
      ],
      raw_json: {
        session_id: sessionId,
        input,
        sim: {
          tension: randomState.Voice,
          uncertainty: 1 - randomState.Transparency,
          emotional_intensity: randomState.Choice
        },
        contradiction: 1 - randomState['Trust (τ)'],
        regulation: randomState.Regulation
      }
    };
  }
};
