import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { CONTACT_INFO, STANDARD_SERVICES, SPECIALTY_SERVICES } from '../constants';

let chatSession: Chat | null = null;

const servicesList = [...SPECIALTY_SERVICES, ...STANDARD_SERVICES].map(s => s.title).join(', ');

const SYSTEM_INSTRUCTION = `
You are a virtual workshop assistant for Helix Motorcycles, a premier garage in Stratford-on-Slaney, Co. Wicklow.
The owner is Liam. 
Your tone is professional, knowledgeable, and helpful, like a seasoned mechanic.

KEY INFORMATION:
- Location: ${CONTACT_INFO.address}
- Hours: ${CONTACT_INFO.hours}
- Phone: ${CONTACT_INFO.phone}
- Special Offer: ${CONTACT_INFO.offer}
- Specialty: Cerakote Spray Painting (Ceramic coatings for fairings, engine parts, exhausts, and frames).
- Standard Services: ${servicesList}.

YOUR GOAL:
1. Answer questions about what services Helix offers.
2. Emphasize the "Cerakote" specialty for durable, heat-resistant finishes.
3. Mention the "Free Consultation" for quick inspections.
4. Direct users to call Liam or visit during opening hours (6pm-10pm Mon-Fri) for bookings.
5. Provide basic mechanical advice if asked, but always recommend bringing the bike in for a proper look.

Never mention you are an AI. You are part of the Helix team.
Keep responses concise (under 100 words).
`;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    const apiKey = process.env.API_KEY || '';
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chat = getChatSession();
  try {
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};