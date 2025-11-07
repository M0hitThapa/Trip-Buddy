import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  maxRetries: 2,
  timeout: 60000,
});

const QUESTION_PROMPT = `I'm Sophia, a friendly and professional human trip planner. I always speak in first person (I/me) and never refer to myself in third person. My goal is to help you plan a trip by asking one relevant trip-related question at a time.

Tone & Style:
- Be warm, approachable, and personable—like a professional trip planner who cares.
- Keep it concise and human. 1–2 sentences max per turn.
- Avoid assumptions; ask for missing info only.
- Light emojis are okay sparingly (e.g., ✈️, 🌅, 🧭).
- Use contractions and vary phrasing. Sound like me, Sophia.
- Prefer natural, human phrasing. Vary openings (e.g., "Great!", "Got it.", "Thanks for sharing.") and avoid repetitive patterns.
- Never use third-person self-reference. Always use first person (e.g., "I'm", "I can").

Question phrasing tips:
- Start with a tiny friendly lead-in, then the question (e.g., "Great! To tailor this, where are you starting from?").
- Use gentle language: "Could you share…", "What would you prefer…", "When works for you…".
- If helpful, add a quick why: "…so I can match flights and travel time." Keep total to 1–2 sentences.
- Offer simple choices when appropriate (e.g., "Low / Medium / High").

First, analyze the user's initial message to see what information they've already provided. Only ask about missing information.

Required information to collect (in this order):
1. Starting location (source)
2. Destination city or country  
3. Group size (Solo, Couple, Family, Friends)
4. Budget (Low, Medium, High)
5. Travel dates (from and to). When asking for this, set ui to "dateRange"
6. Travel interests (e.g., adventure, sightseeing, cultural, food, nightlife, relaxation). When asking for this, set ui to "travelInterest"
7. Special requirements or preferences (if any)

Response Rules:
- Never ask the same question twice.
- Ask exactly ONE question at a time for missing information only.
- Keep questions short, friendly, and specific (1–2 sentences with a soft opener).
- Use appropriate UI components: budget/groupSize/dateRange/travelInterest.
- Always respond with JSON: {"resp": "your question here", "ui": "component_name_or_empty"}.
- You MUST ask about travel interests (step 6) before generating the final itinerary. Do not skip this step.

Once all information is collected (including travel interests), respond with: {"resp": "Perfect! Let me create your detailed itinerary.", "ui": "Final"}`;

const FINAL_PROMPT = `You are Sophia, a friendly and professional human trip planner. Do not mention being an AI or language model. Never refer to yourself in third person; always use first person (I/me). You are creating a detailed trip itinerary based on all the information provided by the user. Create a comprehensive, realistic, and engaging travel plan in Sophia's voice.

Tone & Style for the response:
- Sound like Sophia: friendly, enthusiastic, professional, and human.
- Use approachable language and short paragraphs. Avoid robotic tone.
- In "resp", write 2–3 lively sentences that summarize the trip vibe and what to expect.
- Keep everything factual and helpful; do not invent extreme claims.
- It's okay to sprinkle a couple of light emojis (max 2) in "resp" to make it feel welcoming.
- Use contractions and varied sentence openings.
- Avoid stiff or robotic phrasing; keep it conversational and human.

Generate a STRICT JSON object with this exact schema:
{
  "resp": "Brief friendly summary of the planned trip (2-3 sentences)",
  "ui": "Final",
  "tripTitle": "✈️ [Source] to [Destination] — [Trip Theme/Type]",
  "duration": "X Days / Y Nights",
  "travelStyle": "Culture, Heritage, Scenic Views, etc.",
  "travelerType": "Solo / Couple / Family / Friends",
  "season": "Best months to visit",
  "overview": "2-3 paragraph description of the trip highlighting what makes it special",
  "quickFacts": {
    "destination": "City, Country",
    "currency": "Currency Name (CODE)",
    "timezone": "GMT +X",
    "language": "Primary language (English widely spoken)",
    "flightTime": "~X hours (direct/1 stop)",
    "visa": "Visa requirements",
    "bestMonths": "Month–Month"
  },
  "flights": {
    "suggestedRoute": "Source Airport → Connection → Destination Airport",
    "averageFlightTime": "X hours",
    "arrivalAirport": "Airport Name (CODE)",
    "arrivalDescription": "Brief description of arrival airport and distance to city",
    "mapsLink": "Google Maps link to airport"
  },
  "accommodation": {
    "hotelExample": {
      "name": "Hotel Name",
      "description": "Description of the hotel and why it's recommended",
      "mapsLink": "Google Maps link"
    },
    "alternativeAreas": [
      {"area": "Area Name", "description": "Brief description of the area"}
    ]
  },
  "recommendedCafes": [
    {
      "name": "Cafe/Restaurant Name",
      "description": "What makes it special",
      "type": "Cuisine type",
      "mapsLink": "Google Maps link"
    }
  ],
  "dates": {
    "from": "YYYY-MM-DD",
    "to": "YYYY-MM-DD"
  },
  "budget": {
    "currency": "USD",
    "total": 1234,
    "estimatedBreakdown": [
      {"category": "Flights", "cost": 500, "notes": "Round-trip, economy"},
      {"category": "Hotels", "cost": 400, "notes": "X nights, mid-range"},
      {"category": "Meals", "cost": 150, "notes": "Cafés, dinners"},
      {"category": "Transport", "cost": 80, "notes": "Local taxis, drivers"},
      {"category": "Entry Fees", "cost": 50, "notes": "Heritage sites"}
    ],
    "breakdown": [
      {
        "day": 1,
        "total": 456,
        "hotels": [{"name": "Hotel Name", "price": 200}],
        "activities": [{"name": "Activity Name", "price": 50}]
      }
    ]
  },
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "🗓️ Day 1 – Descriptive Day Title (REQUIRED)",
      "morning": "Detailed morning activities with specific places and times (REQUIRED - 2-3 sentences)",
      "afternoon": "Detailed afternoon activities with specific places and times (REQUIRED - 2-3 sentences)", 
      "evening": "Detailed evening activities with specific places and times (REQUIRED - 2-3 sentences)",
      "description": "1-2 paragraph description of what makes this day special",
      "mapsLinks": ["Google Maps link 1", "Google Maps link 2"],
      "notes": "Helpful tips, recommendations, or important information",
      "weather": {
        "summary": "Expected weather conditions",
        "tips": "What to wear or bring based on weather"
      },
      "hiddenGems": [{"name": "Less-known Place", "description": "Why it's special and when to visit"}],
      "cafes": ["Cafe Name 1", "Cafe Name 2"],
      "hotels": ["Hotel Name 1"],
      "adventures": ["Activity Name 1", "Activity Name 2"]
    }
  ],
  "packingChecklist": [
    "Valid passport, printed flight tickets",
    "Lightweight layers, warm jacket",
    "Walking shoes"
  ],
  "localTips": [
    "Always remove shoes before entering temples",
    "Avoid tap water — drink sealed bottled water only"
  ]
}

CRITICAL REQUIREMENTS:
1. Every single day in the itinerary array MUST have these 4 fields:
   - title (unique, descriptive, 5-10 words)
   - morning (2-3 sentences with specific places and activities)
   - afternoon (2-3 sentences with specific places and activities)
   - evening (2-3 sentences with specific places and activities)

2. Generate EXACTLY the number of days requested by the user. If they want 5 days, you MUST provide 5 complete days.

3. Do NOT leave ANY day incomplete. Generate complete information for ALL days from day 1 to the last day.

4. If you're approaching token limits, keep descriptions concise but ALWAYS complete all required fields for ALL days. 
   - Include cafeDetails, hotelDetails, and adventureDetails with real place names when possible.
   - If space is tight, skip weather and notes first, but try to include at least 1-2 places per category.

5. Never stop mid-generation. It's better to have shorter descriptions for all days than detailed descriptions for only some days.

6. Before finishing, count your itinerary days and ensure it matches the trip duration.

Budget Guidelines:
- Low Budget: Focus on hostels, street food, free attractions, local transport
- Medium Budget: Mid-range hotels, mix of restaurants, paid attractions, some tours
- High Budget: Luxury hotels, fine dining, premium experiences, private transport

Hard Constraints for quality and uniqueness:
- Each day MUST be unique. Do not repeat titles or the same activities across different days.
- Vary neighborhoods/areas and points of interest across days.
- Use real-seeming places for the destination; avoid generic placeholders like "Local Cafe".
- Ensure the budget.breakdown array length equals the itinerary length; totals should be reasonable and consistent per day.
- Avoid duplication across days; provide diverse morning/afternoon/evening plans.
- EVERY day must have complete title, morning, afternoon, and evening fields. No empty or missing fields allowed.
- If you run out of token space, prioritize completing all required fields for every day before adding optional fields.`;

const MODEL_FALLBACKS = [
  "x-ai/grok-4-fast",
  "google/gemini-2.0-flash-exp:free",
  "openai/gpt-4.1-mini",
];

const CONFIG = {
  RECENT_MESSAGES_LIMIT: 12,
  QUESTION_MAX_TOKENS: 2000,
  FINAL_MAX_TOKENS: 12000,
  QUESTION_TEMPERATURE: 0.3,
  FINAL_TEMPERATURE: 0.35,
  QUESTION_FREQUENCY_PENALTY: 0.1,
  FINAL_FREQUENCY_PENALTY: 0.3,
  TOP_P: 0.9,
  MAX_INCOMPLETE_DAYS: 3,
  MIN_COMPLETE_DAYS: 3,
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ItineraryDay {
  day?: number;
  title?: string;
  morning?: string;
  afternoon?: string;
  evening?: string;
  [key: string]: unknown;
}

interface ParsedResponse {
  resp?: string;
  ui?: string;
  itinerary?: ItineraryDay[];
  budget?: {
    currency?: string;
    total?: number;
    breakdown?: Array<{ day: number; total: number }>;
  };
  [key: string]: unknown;
}

interface ErrorDetail {
  model: string;
  error: string;
  [key: string]: unknown;
}

function sanitizeFirstPerson(text: string): string {
  return text
    .replace(/\bSophia is\b/gi, "I am")
    .replace(/\bSophia will\b/gi, "I'll")
    .replace(/\bSophia can\b/gi, "I can");
}

function sanitizePayload(payload: ParsedResponse): void {
  try {
    if (typeof payload.resp === "string") {
      payload.resp = sanitizeFirstPerson(payload.resp);
    }

    if (Array.isArray(payload.itinerary)) {
      for (const day of payload.itinerary) {
        if (typeof day.title === "string") {
          day.title = sanitizeFirstPerson(day.title);
        }
        if (typeof day.morning === "string") {
          day.morning = sanitizeFirstPerson(day.morning);
        }
        if (typeof day.afternoon === "string") {
          day.afternoon = sanitizeFirstPerson(day.afternoon);
        }
        if (typeof day.evening === "string") {
          day.evening = sanitizeFirstPerson(day.evening);
        }
      }
    }
  } catch (error) {
    console.error("Error sanitizing payload:", error);
  }
}

function analyzeConversationReadiness(messages: Message[]): {
  shouldGenerateFinal: boolean;
  infoScore: number;
} {
  const conversationContent = messages
    .map((m) => m.content?.toLowerCase() || "")
    .join(" ");

  const hasDates =
    /travel dates:\s*from\s*\d{4}-\d{2}-\d{2}\s*to\s*\d{4}-\d{2}-\d{2}/i.test(
      conversationContent
    );
  const hasGroup = /(group size|solo|couple|family|friends)/i.test(
    conversationContent
  );
  const hasBudget =
    /(budget|low budget|medium budget|high budget|low\b|medium\b|high\b)/i.test(
      conversationContent
    );
  const hasDestination =
    /(destination\s*:|trip to\s+\w|to\s+[A-Z][a-zA-Z]+)/i.test(
      conversationContent
    );
  const hasSource = /(from\s+[A-Z][a-zA-Z]+|source\s*:)/i.test(
    conversationContent
  );
  const hasInterests =
    /(travel interests:|adventure.*sightseeing|cultural.*food|nightlife.*relaxation)/i.test(
      conversationContent
    ) ||
    (/(adventure|sightseeing|cultural|food|nightlife|relaxation|beach|nature|history)/i.test(
      conversationContent
    ) &&
      messages.length > 10);

  const infoScore = [
    hasDates,
    hasGroup,
    hasBudget,
    hasDestination,
    hasSource,
    hasInterests,
  ].filter(Boolean).length;

  const shouldGenerateFinal =
    (hasInterests && infoScore >= 5) ||
    (infoScore >= 4 && messages.length > 12) ||
    messages.length > 16;

  return { shouldGenerateFinal, infoScore };
}

function extractJSON(rawContent: string): unknown {
  const codeBlockMatch = rawContent.match(
    /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
  );
  if (codeBlockMatch) {
    return JSON.parse(codeBlockMatch[1]);
  }

  const start = rawContent.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON start found");
  }

  let braceCount = 0;
  let end = -1;
  let inString = false;
  let escapeNext = false;

  for (let i = start; i < rawContent.length; i++) {
    const char = rawContent[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === "{") {
        braceCount++;
      } else if (char === "}") {
        braceCount--;
        if (braceCount === 0) {
          end = i;
          break;
        }
      }
    }
  }

  if (end === -1) {
    throw new Error("No JSON end found");
  }

  const jsonStr = rawContent.slice(start, end + 1);
  return JSON.parse(jsonStr);
}

function validateItineraryDay(day: ItineraryDay): boolean {
  return !!(
    day &&
    typeof day.title === "string" &&
    day.title.length > 0 &&
    typeof day.morning === "string" &&
    day.morning.length > 0 &&
    typeof day.afternoon === "string" &&
    day.afternoon.length > 0 &&
    typeof day.evening === "string" &&
    day.evening.length > 0
  );
}

function fillIncompleteDay(day: ItineraryDay, dayNum: number): void {
  if (!day.title || typeof day.title !== "string" || day.title.length === 0) {
    day.title = `Day ${dayNum} - Explore & Discover`;
  }
  if (
    !day.morning ||
    typeof day.morning !== "string" ||
    day.morning.length === 0
  ) {
    day.morning =
      "Start your day with a leisurely breakfast. Explore local neighborhoods and discover hidden gems at your own pace.";
  }
  if (
    !day.afternoon ||
    typeof day.afternoon !== "string" ||
    day.afternoon.length === 0
  ) {
    day.afternoon =
      "Visit a popular attraction or museum. Enjoy lunch at a recommended local spot and continue sightseeing.";
  }
  if (
    !day.evening ||
    typeof day.evening !== "string" ||
    day.evening.length === 0
  ) {
    day.evening =
      "Relax with dinner at a nice restaurant. Take an evening stroll and soak in the local atmosphere.";
  }
}

function synthesizeBudget(itinerary: ItineraryDay[]): ParsedResponse["budget"] {
  const budgetBreakdown = itinerary.map((day, idx) => ({
    day: typeof day.day === "number" ? day.day : idx + 1,
    total: 0,
  }));

  return {
    currency: "USD",
    total: 0,
    breakdown: budgetBreakdown,
  };
}

function validateAndFixItinerary(parsed: ParsedResponse): {
  isValid: boolean;
  incompleteDays: number[];
} {
  if (!Array.isArray(parsed.itinerary) || parsed.itinerary.length === 0) {
    return { isValid: false, incompleteDays: [] };
  }

  const incompleteDays: number[] = [];

  for (let i = 0; i < parsed.itinerary.length; i++) {
    const day = parsed.itinerary[i];
    if (!validateItineraryDay(day)) {
      incompleteDays.push(i + 1);
    }
  }

  if (incompleteDays.length === 0) {
    console.log(
      `[AI] Generated complete ${parsed.itinerary.length}-day itinerary`
    );
    if (!parsed.budget || typeof parsed.budget !== "object") {
      parsed.budget = synthesizeBudget(parsed.itinerary);
    }
    return { isValid: true, incompleteDays: [] };
  }

  if (
    incompleteDays.length <= CONFIG.MAX_INCOMPLETE_DAYS &&
    parsed.itinerary.length >= CONFIG.MIN_COMPLETE_DAYS
  ) {
    console.warn(
      `[AI] Filling ${incompleteDays.length} incomplete days:`,
      incompleteDays
    );

    for (const dayNum of incompleteDays) {
      const idx = dayNum - 1;
      fillIncompleteDay(parsed.itinerary[idx], dayNum);
    }

    if (!parsed.budget || typeof parsed.budget !== "object") {
      parsed.budget = synthesizeBudget(parsed.itinerary);
    }

    return { isValid: true, incompleteDays: [] };
  }

  return { isValid: false, incompleteDays };
}

async function attemptModelGeneration(
  model: string,
  messages: Message[],
  shouldGenerateFinal: boolean
): Promise<ParsedResponse> {
  const recentMessages = messages.slice(-CONFIG.RECENT_MESSAGES_LIMIT);

  const completion = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature: shouldGenerateFinal
      ? CONFIG.FINAL_TEMPERATURE
      : CONFIG.QUESTION_TEMPERATURE,
    top_p: CONFIG.TOP_P,
    max_tokens: shouldGenerateFinal
      ? CONFIG.FINAL_MAX_TOKENS
      : CONFIG.QUESTION_MAX_TOKENS,
    presence_penalty: 0,
    frequency_penalty: shouldGenerateFinal
      ? CONFIG.FINAL_FREQUENCY_PENALTY
      : CONFIG.QUESTION_FREQUENCY_PENALTY,
    messages: [
      {
        role: "system",
        content: shouldGenerateFinal ? FINAL_PROMPT : QUESTION_PROMPT,
      },
      ...recentMessages,
    ],
  });

  const rawContent = completion?.choices?.[0]?.message?.content ?? "";

  if (!rawContent.trim()) {
    throw new Error("Empty response from model");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawContent);
  } catch {
    parsed = extractJSON(rawContent);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid response object");
  }

  const response = parsed as ParsedResponse;
  if (response.ui === "") {
    response.ui = undefined;
  }

  return response;
}

function validateResponse(response: ParsedResponse): {
  isValid: boolean;
  error?: ErrorDetail;
} {
  const hasResp = typeof response.resp === "string" && response.resp.length > 0;
  const isFinal = response.ui === "Final";
  const hasItinerary =
    Array.isArray(response.itinerary) && response.itinerary.length > 0;

  if (isFinal) {
    if (!hasResp || !hasItinerary) {
      return {
        isValid: false,
        error: {
          model: "validation",
          error: "missing_final_fields",
          hasResp,
          hasItinerary,
          raw: JSON.stringify(response).slice(0, 500),
        },
      };
    }

    const { isValid, incompleteDays } = validateAndFixItinerary(response);

    if (!isValid) {
      return {
        isValid: false,
        error: {
          model: "validation",
          error: "incomplete_itinerary_structure",
          incompleteDays,
          totalDays: response.itinerary?.length || 0,
          message: `Days ${incompleteDays.join(", ")} are missing required fields`,
        },
      };
    }

    sanitizePayload(response);
    return { isValid: true };
  }

  if (!hasResp) {
    return {
      isValid: false,
      error: {
        model: "validation",
        error: "missing_resp_field",
        raw: JSON.stringify(response).slice(0, 500),
      },
    };
  }

  return { isValid: true };
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY" },
        { status: 500 }
      );
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: messages required" },
        { status: 400 }
      );
    }

    const { shouldGenerateFinal, infoScore } =
      analyzeConversationReadiness(messages);
    const errors: ErrorDetail[] = [];

    for (const model of MODEL_FALLBACKS) {
      try {
        const response = await attemptModelGeneration(
          model,
          messages,
          shouldGenerateFinal
        );
        const { isValid, error } = validateResponse(response);

        if (isValid) {
          return NextResponse.json(response);
        }

        if (error) {
          errors.push({ ...error, model });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "unknown_error";

        errors.push({
          model,
          error: message,
          type: err instanceof Error ? err.name : "unknown",
        });

        if (
          message.includes("timeout") ||
          message.includes("abort") ||
          message.includes("rate limit")
        ) {
          break;
        }
      }
    }

    console.error("All models failed:", errors);

    return NextResponse.json(
      {
        error: "All model fallbacks failed",
        details: errors.slice(0, 3),
        shouldGenerateFinal,
        debugInfo: {
          messageCount: messages.length,
          infoScore,
          lastMessage: messages[messages.length - 1]?.content?.slice(0, 100),
        },
      },
      { status: 502 }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown server error";
    const status = /timeout/i.test(message) ? 504 : 500;

    console.error("API route error:", e);

    return NextResponse.json(
      {
        error: message,
        stack:
          process.env.NODE_ENV === "development" && e instanceof Error
            ? e.stack
            : undefined,
      },
      { status }
    );
  }
}
