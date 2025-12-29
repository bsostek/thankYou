import { GoogleGenerativeAI } from "@google/generative-ai";
import { MENU_DATA } from "./menuData";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "Gemini API key not found. Please set VITE_GEMINI_API_KEY in your .env file."
  );
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface ParseOrderResponse {
  items: Array<{
    itemName: string;
    quantity: number;
    size?: string;
    modifications: string[];
    specialInstructions?: string;
  }>;
  customerInfo?: {
    name?: string;
    phone?: string;
  };
  ambiguities: string[];
  suggestedUpsells: string[];
}

export async function parsePhoneOrder(
  transcript: string
): Promise<ParseOrderResponse> {
  if (!apiKey) {
    // Return mock data if no API key
    return {
      items: [
        {
          itemName: "Pepperoni Pizza",
          quantity: 2,
          size: "large",
          modifications: ["no mushrooms"],
        },
        {
          itemName: "Buffalo Wings",
          quantity: 1,
          modifications: ["medium sauce"],
        },
      ],
      ambiguities: ["Please confirm the size of the wings order"],
      suggestedUpsells: [
        "Would you like to add a drink? We have 2-liter sodas for $3.99",
      ],
    };
  }

  const menuDescription = MENU_DATA.map((item) => {
    let desc = `${item.name} (${item.category})`;
    if (item.sizes) {
      desc += ` - Sizes: ${Object.entries(item.sizes)
        .map(([size, price]) => `${size}: $${price}`)
        .join(", ")}`;
    } else {
      desc += ` - Price: $${item.basePrice}`;
    }
    if (item.customizations) {
      desc += ` - Customizations: ${item.customizations.join(", ")}`;
    }
    return desc;
  }).join("\n");

  const prompt = `You are an AI assistant helping a restaurant employee process phone orders. 
Parse the following phone order transcript and extract the order details.

MENU:
${menuDescription}

PHONE ORDER TRANSCRIPT:
"${transcript}"

IMPORTANT: Use EXACT menu item names from the menu above. Do not make up item names.

Please extract:
1. All ordered items with quantities, sizes (if applicable), and any modifications
2. Any customer information (name, phone number)
3. Any ambiguities that need clarification
4. Suggested upsells based on what wasn't ordered (e.g., if no drinks, suggest drinks)

Return a JSON object with this structure:
{
  "items": [
    {
      "itemName": "EXACT menu item name from the menu above",
      "quantity": number,
      "size": "small/medium/large" (if applicable),
      "modifications": ["list", "of", "modifications"],
      "specialInstructions": "any special notes"
    }
  ],
  "customerInfo": {
    "name": "customer name if mentioned",
    "phone": "phone number if mentioned"
  },
  "ambiguities": ["list of things that need clarification"],
  "suggestedUpsells": ["suggested items to offer"]
}`;

  try {
    if (!genAI) {
      throw new Error("Gemini API not initialized. Please set your API key.");
    }

    const fullPrompt = `You are a helpful assistant that parses restaurant phone orders. Always respond with valid JSON.

${prompt}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    // Remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?|```\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error parsing order with Gemini:", error);
    throw new Error("Failed to parse order. Please try again.");
  }
}
