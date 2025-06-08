
import React from 'react';
import { FarmingType, WaterQualityParameters } from './types'; // Removed Language import

export const APP_NAME = "Digital Aqua";

// Removed LANGUAGES constant
// export const LANGUAGES: Language[] = [
//   { code: 'en', name: 'English' },
//   { code: 'te', name: 'తెలుగు (Telugu)' },
//   { code: 'hi', name: 'हिन्दी (Hindi)' },
//   { code: 'ta', name: 'தமிழ் (Tamil)' },
// ];

export const FARMING_TYPES: FarmingType[] = [
  FarmingType.SHRIMP,
  FarmingType.FISH,
  FarmingType.OTHER,
];

export const MOCK_OTP = "1234"; // For demo purposes

export const LOCAL_STORAGE_PROFILE_KEY = 'digitalAquaUserProfile';
export const LOCAL_STORAGE_REPORTS_KEY = 'digitalAquaWaterReports';

// Ideal ranges for parameters (example, can be refined)
export const IDEAL_RANGES: Partial<Record<keyof WaterQualityParameters, { min: number; max: number; unit: string }>> = {
  pH: { min: 7.5, max: 8.5, unit: '' },
  dissolvedOxygen: { min: 5, max: 10, unit: 'ppm' },
  totalAmmoniaNitrogen: { min: 0, max: 0.5, unit: 'ppm' },
  nitrite: { min: 0, max: 0.2, unit: 'ppm' },
  salinity: { min: 5, max: 30, unit: 'ppt' }, // Highly variable based on species
  temperature: { min: 25, max: 32, unit: '°C' }, // Variable
};

// SVG Icons
export const FishIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4.5-7.5c.83 0 1.5-.67 1.5-1.5S8.33 9.5 7.5 9.5 6 10.17 6 11s.67 1.5 1.5 1.5zm9 0c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-4.5 4c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    <path d="M15.56,10.16c-.11-.08-.22-.16-.34-.23-.3-.17-.63-.3-1-.37-.2-.04-.39-.06-.59-.06s-.39,.02-.59,.06c-.37,.07-.7,.2-1,.37-.12,.07-.23,.15-.34,.23C10.2,10.88,9,12.34,9,14c0,1.48,1.08,2.77,2.5,2.95V18h1v-1.05c1.42-.18,2.5-1.47,2.5-2.95,0-1.66-1.2-3.12-2.69-3.84Z" opacity=".3"/>
    <path d="M16.07,7.42C15.36,6.57,14.23,6,13,6c-1.3,0-2.48,.64-3.14,1.57-.1,.13-.19,.27-.26,.41-.02,.05-.04,.09-.06,.14-.54,1.11-.71,2.35-.5,3.55,.07,.38,.19,.75,.33,1.1C9.87,13.67,10.06,14.3,10,15c-.05,.7-.35,1.34-.81,1.83-.29,.31-.51,.73-.51,1.17,0,.46,.31,.86,.73,1,.19,.06,.39,.1,.58,.1h4c.2,0,.39-.04,.58-.1,.42-.14,.73-.54,.73-1,0-.44-.22-.86-.51-1.17-.46-.49-.76-1.13-.81-1.83-.06-.7,.12-1.33,.62-2.23,.15-.35,.27-.72,.33-1.1,.2-.99,.06-2.13-.42-3.16-.03-.06-.05-.13-.08-.19-.07-.14-.16-.28-.26-.41Z"/>
  </svg>
);

export const ShrimpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 0h24v24H0z" fill="none"/>
    <path d="M20.97 11.95c-.15-.5-.53-.92-1.02-1.11l-2.32-.91c-.4-.15-.83-.02-1.09.31l-1.38 1.73c-.22.28-.34.62-.34.97v.02c0 .42.17.81.45 1.09l1.02 1.02c.44.44 1.06.64 1.67.52l2.53-.51c.61-.12 1.06-.61 1.16-1.23l.32-1.8ZM8.38 18.02c.46.46 1.08.68 1.7.58l2.62-.42c.62-.1.99-.65.89-1.27s-.65-.99-1.27-.89l-2.62.42c-.21.03-.42.03-.62 0-.41-.07-.78-.26-1.07-.55l-2.93-2.93c-.39-.39-.39-1.02 0-1.41l.71-.71c.39-.39 1.02-.39 1.41 0l1.45 1.45c.28.28.66.44 1.06.44s.78-.16 1.06-.44l1.45-1.45c.39-.39 1.02-.39 1.41 0l.71.71c.39.39.39 1.02 0 1.41l-2.93 2.93c-.29.29-.66.48-1.07.55Zm10.99-9.99L17.5 6.16c-.39-.39-1.02-.39-1.41 0l-1.06 1.06c-.14.14-.22.33-.22.53s.08.39.22.53l1.06 1.06c.39.39 1.02.39 1.41 0l1.87-1.87c.39-.38.39-1.02 0-1.4Zm-5.05 1.05L12.45 7.2c-.39-.39-1.02-.39-1.41 0l-1.06 1.06c-.14.14-.22.33-.22.53s.08.39.22.53l1.06 1.06c.39.39 1.02.39 1.41 0l1.87-1.87c.39-.39.39-1.03.01-1.41ZM6.53 12.5H4.01c-.55 0-1-.45-1-1s.45-1 1-1h2.52c.55 0 1 .45 1 1s-.45 1-1 1Z"/>
  </svg>
);

export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

export const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h3.75c.621 0 1.125.504 1.125 1.125v6.75c0 .621-.504 1.125-1.125 1.125h-3.75A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-3.75a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125v15.75c0 .621-.504 1.125-1.125 1.125h-3.75a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

export const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
 <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
   <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
 </svg>
);

export const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-6.364-.386l1.591-1.591M3 12h2.25m.386-6.364l1.591 1.591M12 12a2.25 2.25 0 00-2.25 2.25c0 1.37.598 2.585 1.5 3.365V12a2.25 2.25 0 00-2.25-2.25h0A2.25 2.25 0 009.75 12c0 1.37.598 2.585 1.5 3.365V12a2.25 2.25 0 00-2.25-2.25zM12 12a2.25 2.25 0 01-2.25-2.25c0-1.37-.598-2.585-1.5-3.365V12A2.25 2.25 0 0112 9.75V12h.008zM12 12a2.25 2.25 0 002.25-2.25c0-1.37.598-2.585 1.5-3.365V12a2.25 2.25 0 002.25 2.25V12h-.008zM12 12a2.25 2.25 0 012.25 2.25c0 1.37.598 2.585 1.5 3.365V12a2.25 2.25 0 012.25-2.25V12h-.008z" />
  </svg>
);

export const InformationCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
  </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

export const PARAMETER_DISPLAY_ORDER: (keyof WaterQualityParameters)[] = [
  'pH', 'salinity', 'dissolvedOxygen', 'temperature', 
  'totalAmmoniaNitrogen', 'unionizedAmmonia', 'nitrite', 
  'hco3', 'co2', 'totalHardness', 'totalCa', 'totalMg', 
  'iron', 'h2s', 'chlorine'
];

export const PARAMETER_UNITS: Record<keyof WaterQualityParameters, string> = {
  pH: '',
  salinity: 'ppt',
  co2: 'ppm',
  hco3: 'ppm',
  totalMg: 'ppm',
  totalCa: 'ppm',
  totalHardness: 'ppm',
  totalAmmoniaNitrogen: 'ppm',
  unionizedAmmonia: 'ppm',
  dissolvedOxygen: 'ppm',
  iron: 'ppm',
  h2s: 'ppm',
  nitrite: 'ppm',
  temperature: '°C',
  chlorine: 'ppm',
};