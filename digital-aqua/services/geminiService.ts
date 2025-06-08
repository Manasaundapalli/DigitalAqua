
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { WaterQualityParameters, AnalysisResultFromGemini, WeatherForecast, UserProfile, WaterReportAnalysis } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Fallback to prevent crash if key missing, but calls will fail

// const model = ai.models; // Removed, as direct ai.models.generateContent is preferred.

const GEMINI_TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

export const analyzeWaterReportImage = async (
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<AnalysisResultFromGemini> => {
  if (!API_KEY) throw new Error("Gemini API Key is not configured.");

  const imagePart = {
    inlineData: {
      mimeType: mimeType,
      data: imageBase64,
    },
  };

  const textPart = {
    text: `Analyze the provided water quality report image. Extract the following parameters for the first sample listed: pH, Salinity (ppt), CO2 (ppm), HCO3 (ppm), Total Mg (ppm), Total Ca (ppm), Total Hardness (ppm), Total Ammonia Nitrogen (ppm), Unionized Ammonia (ppm), D.O. (Dissolved Oxygen ppm), Iron (ppm), H2S (ppm), Nitrite (ppm), Temperature (°C), and Chlorine (ppm). If a parameter is not found or unclear, use null.
Based on these parameters, determine a general water quality status (Safe, Warning, or Critical) for common aquaculture species (e.g., shrimp, fish).
Provide 2-3 brief, actionable suggestions for the aquafarmer.
Return the response STRICTLY as a JSON object with the following structure:
{
  "parameters": {
    "pH": <number_or_null>,
    "salinity": <number_or_null>,
    "co2": <number_or_null>,
    "hco3": <number_or_null>,
    "totalMg": <number_or_null>,
    "totalCa": <number_or_null>,
    "totalHardness": <number_or_null>,
    "totalAmmoniaNitrogen": <number_or_null>,
    "unionizedAmmonia": <number_or_null>,
    "dissolvedOxygen": <number_or_null>,
    "iron": <number_or_null>,
    "h2s": <number_or_null>,
    "nitrite": <number_or_null>,
    "temperature": <number_or_null>,
    "chlorine": <number_or_null>
  },
  "status": "<Safe|Warning|Critical|Unknown>",
  "suggestions": ["<suggestion1>", "<suggestion2>"]
}
Ensure the output is only the JSON object, without any surrounding text or markdown fences.
Example for parameters: "pH": 8.0, "salinity": 1.0, etc.
Example for status: "status": "Warning"
Example for suggestions: "suggestions": ["Monitor pH levels closely.", "Consider partial water exchange."]
`,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({ // Corrected API call
      model: GEMINI_TEXT_MODEL_NAME,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, 
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    const jsonStart = jsonStr.indexOf('{');
    const jsonEnd = jsonStr.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
    }

    const parsedData: AnalysisResultFromGemini = JSON.parse(jsonStr);
    
    if (!parsedData.parameters || !parsedData.status || !parsedData.suggestions) {
        console.error("Parsed Gemini response is missing required fields:", parsedData);
        throw new Error("Invalid data structure from Gemini API.");
    }

    const validatedParams: Partial<WaterQualityParameters> = {};
    for (const key in parsedData.parameters) {
        const typedKey = key as keyof WaterQualityParameters;
        const value = (parsedData.parameters as any)[typedKey];
        (validatedParams as any)[typedKey] = typeof value === 'number' ? value : null;
    }
    parsedData.parameters = validatedParams as WaterQualityParameters;

    return parsedData;

  } catch (error) {
    console.error("Error analyzing water report image with Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("quota")) {
        throw new Error("API request failed due to quota limits. Please check your Gemini API plan.");
    }
    throw new Error(`Failed to analyze image. Gemini API error: ${errorMessage}`);
  }
};


export const getGenericWeatherForecast = async (location: string): Promise<WeatherForecast[]> => {
  console.log(`Fetching mocked weather for: ${location}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date();
      const forecasts: WeatherForecast[] = Array.from({ length: 6 }).map((_, i) => { // Changed length to 6
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });
        let condition = 'Partly Cloudy';
        let icon = '02d';
        if (i === 0 || i === 3) { condition = 'Sunny'; icon = '01d'; }
        else if (i === 1 || i === 4) { condition = 'Showers'; icon = '09d'; }
        else if (i === 5 ) { condition = 'Cloudy'; icon = '03d'; }

        return {
          date: `${day}, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          condition: condition,
          tempMin: 20 + i,
          tempMax: 28 + i,
          icon: icon, 
        };
      });
      resolve(forecasts);
    }, 500);
  });
};

export const getThreatAnalysis = async (
  userProfile: UserProfile,
  report: WaterReportAnalysis,
  weatherForecasts: WeatherForecast[]
): Promise<string> => {
  if (!API_KEY) throw new Error("Gemini API Key is not configured.");
  if (!userProfile || !report || !weatherForecasts || weatherForecasts.length === 0) {
    throw new Error("Missing required data for threat analysis.");
  }

  const systemInstruction = "You are an aquaculture expert providing risk assessment and advice to farmers. Focus on being concise and actionable.";

  const waterQualitySummary = PARAMETER_DISPLAY_ORDER.map(key => {
    const value = report.parameters[key];
    if (value !== null && value !== undefined) {
      return `- ${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}: ${value} ${PARAMETER_UNITS[key] || ''}`;
    }
    return null;
  }).filter(Boolean).join('\n');
  
  const weatherForecastSummary = weatherForecasts
    .map(day => `- ${day.date}: ${day.condition}, Temp: ${day.tempMin}°C - ${day.tempMax}°C`)
    .join('\n');

  const prompt = `
Farm Details:
- Farming Type: ${userProfile.farmingType}
- Location: ${userProfile.farmLocation} (general area)

Current Water Quality Report (taken on ${new Date(report.timestamp).toLocaleDateString()}):
${waterQualitySummary}
- Overall Status: ${report.status}

Weather Forecast for the next 6 days:
${weatherForecastSummary}

Task:
Based on the current water quality parameters and the provided 6-day weather forecast, identify potential threats to the aquaculture stock (${userProfile.farmingType}) over the next 6 days.
For each potential threat:
1. Briefly explain the cause (linking water quality and/or weather).
2. Estimate a risk level (Low, Medium, High).
3. Suggest 1-2 concise, actionable preventative or mitigative measures the farmer can take.

Format your response clearly. List each threat with its explanation, risk level, and suggestions.
If no significant immediate threats are apparent, state so but still offer general vigilance advice based on the forecast.
Prioritize the most impactful potential threats.
Example:
Threat: Potential Dissolved Oxygen Drop
Risk: Medium
Explanation: Upcoming cloudy days (e.g., ${weatherForecasts.find(f => f.condition.toLowerCase().includes('cloudy') || f.condition.toLowerCase().includes('rain'))?.date || 'forecasted cloudy days'}) might reduce photosynthesis. If current D.O. (${report.parameters.dissolvedOxygen ?? 'N/A'} ppm) is borderline, it could drop further, especially during early morning hours.
Suggestions:
- Monitor D.O. levels closely, especially pre-dawn.
- Ensure backup aeration equipment is ready.

Start the analysis directly. Output should be plain text.
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL_NAME,
      contents: prompt, // Direct string prompt
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Slightly creative but focused
      },
    });
    return response.text;
  } catch (error) {
    console.error("Error getting threat analysis from Gemini:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
     if (errorMessage.includes("quota")) {
        throw new Error("API request failed due to quota limits. Please check your Gemini API plan for threat analysis.");
    }
    throw new Error(`Failed to get threat analysis. Gemini API error: ${errorMessage}`);
  }
};

// Ensure PARAMETER_DISPLAY_ORDER and PARAMETER_UNITS are accessible or passed if needed outside this file
// For simplicity, assuming they are imported or available globally if this were split.
// If this file is self-contained and constants.ts is not imported here, this would be an issue.
// However, given the project structure, they should be available via imports in types.ts or constants.ts.
// For the prompt construction, let's assume they are effectively available.
// If not, they would need to be imported here:
import { PARAMETER_DISPLAY_ORDER, PARAMETER_UNITS } from '../constants';
