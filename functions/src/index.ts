// functions/src/index.ts
import * as functions from "firebase-functions";
import OpenAI from "openai";

// For Node 18+, fetch is available globally.
// If using an earlier Node version, uncomment the next line and install node-fetch:
// import fetch from "node-fetch";

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

/**
 * Callable function to proxy OpenFDA Drug Label API.
 * Accepts { term: string } and returns up to 5 results.
 */
export const fetchDrugData = functions.https.onCall(
  async (data: any, context) => {
    const term = (data.term as string)?.trim();
    if (!term) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "A non-empty 'term' field is required."
      );
    }

    // Build the OpenFDA URL
    const query = encodeURIComponent(term);
    const url   = `https://api.fda.gov/drug/label.json?search=${query}&limit=5`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const msg = errorJson.error?.message || "OpenFDA API error";
        throw new Error(msg);
      }
      const json = await response.json();
      // Return only the results array (could be empty)
      return { results: json.results || [] };
    } catch (err: any) {
      console.error("fetchDrugData error:", err);
      throw new functions.https.HttpsError("internal", err.message);
    }
  }
);
