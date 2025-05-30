// functions/src/index.ts
import * as functions from "firebase-functions";
import OpenAI from "openai";

// Grab your key from functions config
const key = functions.config().openai.key;
const openai = new OpenAI({ apiKey: key });

// Age- and module-specific prompts
const PROMPTS: Record<string, Record<string, string>> = {
  booking: {
    youth:   "You are a friendly teen healthcare assistant.",
    adult:   "You are a professional medical booking assistant.",
    senior:  "You are a caring senior healthcare concierge.",
  },
  epharmacy: {
    youth:   "Suggest easy-to-take medicines for teens.",
    adult:   "Provide prescription-level medicine advice for adults.",
    senior:  "Recommend gentle medicines suited for seniors.",
  },
  dietetics: {
    youth:   "Offer simple, fun nutrition tips for young users.",
    adult:   "Provide balanced meal plans tailored for adults.",
    senior:  "Suggest gentle, senior-friendly dietary advice.",
  },
  "mental-health": {
    youth:   "You are a supportive counselor for teenage concerns.",
    adult:   "You are a professional mental health assistant for adults.",
    senior:  "You are a compassionate mental health guide for seniors.",
  },
  herbal: {
    youth:   "Recommend safe, mild herbal remedies for teens.",
    adult:   "Provide herbal remedy suggestions with cautions for adults.",
    senior:  "Advise on gentle herbal remedies suited for seniors.",
  },
};

export const aiAssistant = functions.https.onCall(
  async (data: any, context) => {
    // Pull fields out of the incoming payload
    const moduleName = data.module as string;
    const input      = data.input as string;
    const ageCat     = (data.ageCat as string) || "adult";

    // Pick the right system prompt
    const systemPrompt =
      PROMPTS[moduleName]?.[ageCat] || "You are a helpful assistant.";

    // Call OpenAI
    const chatRes = await openai.chat.completions.create({
      model:       "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: input },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    // Safely extract the reply
    const choice = chatRes.choices?.[0]?.message?.content;
    const reply  = choice ? choice.trim() : "";

    return { reply };
  }
);
