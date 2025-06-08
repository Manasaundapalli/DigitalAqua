
export enum FarmingType {
  SHRIMP = "Shrimp",
  FISH = "Fish",
  OTHER = "Other",
}

export interface UserProfile {
  id: string;
  name: string;
  phoneNumber: string;
  farmLocation: string;
  farmingType: FarmingType;
  farmSize: string;
  // languagePreference: string; // Removed
}

export interface WaterQualityParameters {
  pH: number | null;
  salinity: number | null;
  co2: number | null;
  hco3: number | null;
  totalMg: number | null;
  totalCa: number | null;
  totalHardness: number | null;
  totalAmmoniaNitrogen: number | null;
  unionizedAmmonia: number | null;
  dissolvedOxygen: number | null;
  iron: number | null;
  h2s: number | null;
  nitrite: number | null;
  temperature: number | null;
  chlorine: number | null;
}

export type WaterParameterKey = keyof WaterQualityParameters;

export interface WaterReportAnalysis {
  id: string;
  userId: string;
  timestamp: string; // ISO date string
  parameters: WaterQualityParameters;
  status: "Safe" | "Warning" | "Critical" | "Unknown";
  suggestions: string[];
  alerts: string[];
  imageUrl?: string; // base64 string of the uploaded image
  notes?: string;
}

export interface WeatherForecast {
  date: string;
  condition: string;
  tempMin: number;
  tempMax: number;
  icon: string; // e.g., '01d' for OpenWeatherMap icons or a local identifier
}

// Removed Language interface as it's no longer needed
// export interface Language {
//   code: string;
//   name: string;
// }

export type AppView = 
  | 'ENTRY'
  | 'OTP_VERIFICATION'
  | 'REGISTRATION'
  | 'DASHBOARD'
  | 'UPLOAD_REPORT'
  | 'EDIT_ANALYSIS'
  | 'VIEW_ANALYSIS'
  | 'PAST_REPORTS'
  | 'WEATHER_DETAILS'
  | 'TIPS_ALERTS';

export interface AnalysisResultFromGemini {
  parameters: WaterQualityParameters;
  status: "Safe" | "Warning" | "Critical" | "Unknown";
  suggestions: string[];
}