
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { WaterQualityParameters, WaterReportAnalysis, WeatherForecast, WaterParameterKey } from '../types';
import { Card, Button, Spinner, Alert } from './CommonUI'; // Added Spinner and Alert
import { IDEAL_RANGES, PARAMETER_UNITS, PARAMETER_DISPLAY_ORDER, InformationCircleIcon } from '../constants'; // Added InformationCircleIcon

interface ParameterItemProps {
  label: string;
  value: string | number | null;
  unit?: string;
  status?: 'Safe' | 'Warning' | 'Critical' | 'Normal';
}

export const ParameterItem: React.FC<ParameterItemProps> = ({ label, value, unit, status }) => {
  const statusColors = {
    Safe: 'text-success',
    Warning: 'text-yellow-500',
    Critical: 'text-danger',
    Normal: 'text-gray-700',
  };
  const valueDisplay = value === null || value === undefined ? 'N/A' : `${value} ${unit || ''}`.trim();
  
  return (
    <div className="flex justify-between items-center py-2 border-b border-neutral-light last:border-b-0">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <span className={`text-sm font-semibold ${status ? statusColors[status] : 'text-gray-800'}`}>
        {valueDisplay}
      </span>
    </div>
  );
};

const getParameterStatus = (key: WaterParameterKey, value: number | null): 'Safe' | 'Warning' | 'Critical' | 'Normal' => {
  if (value === null) return 'Normal'; // Or 'Unknown'
  const range = IDEAL_RANGES[key];
  if (!range) return 'Normal';

  if (value < range.min) return key === 'dissolvedOxygen' ? 'Critical' : 'Warning'; // Low DO is bad
  if (value > range.max) return 'Warning'; // Most params bad if too high
  
  if ((key === 'totalAmmoniaNitrogen' || key === 'nitrite') && value > range.max) {
    return value > (range.max * 1.5) ? 'Critical' : 'Warning'; 
  }

  return 'Safe';
};


export const WaterQualityCard: React.FC<{ parameters: WaterQualityParameters, status: string, title?: string }> = ({ parameters, status, title="Water Quality Parameters" }) => {
  const overallStatusColor = status === 'Safe' ? 'bg-success' : status === 'Warning' ? 'bg-warning' : status === 'Critical' ? 'bg-danger' : 'bg-gray-400';
  
  return (
    <Card title={title} className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-md font-semibold">Overall Status:</h4>
        <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${overallStatusColor}`}>
          {status}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
        {PARAMETER_DISPLAY_ORDER.map((key) => {
          const value = parameters[key];
          if (value !== undefined) { 
            return (
              <ParameterItem
                key={key}
                label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} 
                value={value}
                unit={PARAMETER_UNITS[key]}
                status={getParameterStatus(key, value)}
              />
            );
          }
          return null;
        })}
      </div>
    </Card>
  );
};

export const SuggestionsCard: React.FC<{ suggestions: string[] }> = ({ suggestions }) => (
  <Card title="Suggestions & Alerts" className="mb-6">
    {suggestions.length > 0 ? (
      <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
        {suggestions.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    ) : (
      <p className="text-sm text-gray-500">No specific suggestions at this time. Monitor regularly.</p>
    )}
  </Card>
);

export const WeatherForecastCard: React.FC<{ forecasts: WeatherForecast[], title?: string }> = ({ forecasts, title = "6-Day Weather Outlook" }) => (
  <Card title={title} className="mb-6">
    {forecasts.length > 0 ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
        {forecasts.slice(0,6).map(day => ( // Ensure only 6 days are shown if more are passed
          <div key={day.date} className="p-2 bg-primary-light/30 rounded-lg">
            <p className="text-xs font-semibold text-primary-dark">{day.date.split(',')[0]}</p>
            <p className="text-xs text-gray-500">{day.date.split(',')[1].trim()}</p>
            <div className="my-1 text-2xl text-accent">
              {day.condition.toLowerCase().includes('sunny') ? '☀️' : 
               day.condition.toLowerCase().includes('partly cloudy') ? '⛅' : 
               day.condition.toLowerCase().includes('cloudy') ? '☁️' : 
               day.condition.toLowerCase().includes('rain') || day.condition.toLowerCase().includes('shower') ? '🌧️' : '🌥️'}
            </div>
            <p className="text-xs text-gray-700">{day.condition}</p>
            <p className="text-xs font-medium text-gray-800">{day.tempMin}°-{day.tempMax}°C</p>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-gray-500">Weather data not available.</p>
    )}
  </Card>
);


export const ReportSummaryCard: React.FC<{ report: WaterReportAnalysis; onOpenReport: (reportId: string) => void }> = ({ report, onOpenReport }) => {
  const date = new Date(report.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const statusColor = report.status === 'Safe' ? 'text-success' : report.status === 'Warning' ? 'text-warning' : 'text-danger';

  return (
    <Card className="mb-4 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-gray-500">{date}</p>
          <h4 className="text-md font-semibold text-primary-dark">Report ID: ...{report.id.slice(-6)}</h4>
          <p className={`text-sm font-bold ${statusColor}`}>Status: {report.status}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => onOpenReport(report.id)}>View Details</Button>
      </div>
      <div className="mt-2 text-xs text-gray-600">
        <p>pH: {report.parameters.pH ?? 'N/A'} | D.O: {report.parameters.dissolvedOxygen ?? 'N/A'} ppm</p>
        {report.suggestions.length > 0 && <p className="mt-1 truncate">Suggestion: {report.suggestions[0]}</p>}
      </div>
    </Card>
  );
};


interface TrendChartProps {
  data: WaterReportAnalysis[];
  parameter: keyof WaterQualityParameters;
}

export const WaterQualityTrendChart: React.FC<TrendChartProps> = ({ data, parameter }) => {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No historical data to display trend for {parameter}.</p>;
  }
  
  const chartData = data.map(report => ({
    date: new Date(report.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    value: report.parameters[parameter]
  })).filter(item => item.value !== null && item.value !== undefined);

  if (chartData.length < 2) {
     return <p className="text-sm text-gray-500 text-center py-4">Not enough data points to display trend for {parameter}.</p>;
  }

  return (
    <Card title={`${parameter.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} Trend`} className="mb-6">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
          <XAxis dataKey="date" tick={{fontSize: 10}} />
          <YAxis tick={{fontSize: 10}} label={{ value: PARAMETER_UNITS[parameter], angle: -90, position: 'insideLeft', offset: 10, fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{fontSize: "12px"}}/>
          <Line type="monotone" dataKey="value" name={parameter} stroke="#0EA5E9" strokeWidth={2} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

interface ParameterBarChartProps {
  parameters: WaterQualityParameters;
}
export const CurrentParametersBarChart: React.FC<ParameterBarChartProps> = ({ parameters }) => {
  const displayParams: WaterParameterKey[] = ['pH', 'dissolvedOxygen', 'totalAmmoniaNitrogen', 'nitrite', 'salinity', 'temperature'];
  const chartData = displayParams.map(key => {
    const ideal = IDEAL_RANGES[key];
    return {
      name: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
      value: parameters[key],
      idealMin: ideal?.min,
      idealMax: ideal?.max,
    };
  }).filter(p => p.value !== null && p.value !== undefined);

  if (chartData.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No parameters to display in chart.</p>;
  }

  return (
    <Card title="Key Parameter Overview" className="mb-6">
      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40 + 60 )}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{fontSize: 10}} />
          <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 10}} interval={0}/>
          <Tooltip />
          <Legend wrapperStyle={{fontSize: "12px"}} />
          <Bar dataKey="value" fill="#0EA5E9" name="Current Value" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};


export const TrafficLightIndicator: React.FC<{ status: 'Safe' | 'Warning' | 'Critical' | 'Unknown' }> = ({ status }) => {
  const baseClasses = "w-6 h-6 rounded-full border-2 border-gray-700";
  return (
    <div className="flex space-x-2 p-2 bg-gray-200 rounded-md">
      <div className={`${baseClasses} ${status === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-red-200 opacity-50'}`}></div>
      <div className={`${baseClasses} ${status === 'Warning' ? 'bg-yellow-400 animate-pulse' : 'bg-yellow-100 opacity-50'}`}></div>
      <div className={`${baseClasses} ${status === 'Safe' ? 'bg-green-500' : 'bg-green-200 opacity-50'}`}></div>
    </div>
  );
};

export const ThreatAnalysisCard: React.FC<{ analysis: string | null; isLoading: boolean; error?: string | null }> = ({ analysis, isLoading, error }) => {
  return (
    <Card title="6-Day Threat Outlook & Advice" className="mb-6 bg-amber-50">
       <div className="flex items-center mb-3">
        <InformationCircleIcon className="w-6 h-6 text-accent-dark mr-2" />
        <h4 className="text-md font-semibold text-accent-dark">AI Powered Forecast</h4>
      </div>
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-6">
          <Spinner size="md" />
          <p className="mt-2 text-sm text-gray-600">Analyzing potential threats based on current water quality and 6-day weather forecast...</p>
        </div>
      )}
      {error && !isLoading && (
         <Alert type="danger" message={`Failed to generate threat analysis: ${error}`} />
      )}
      {!isLoading && !error && analysis && (
        <div className="text-sm text-gray-700 space-y-3 whitespace-pre-line">
          {analysis.split('\n\n').map((paragraph, index) => (
            <div key={index}>
              {paragraph.split('\n').map((line, lineIndex) => {
                 if (line.toLowerCase().startsWith('threat:')) {
                  return <p key={lineIndex} className="font-semibold text-red-700 mt-2">{line}</p>;
                }
                if (line.toLowerCase().startsWith('risk:')) {
                  const riskLevel = line.split(':')[1]?.trim().toLowerCase();
                  let riskColor = 'text-gray-700';
                  if (riskLevel === 'high') riskColor = 'text-red-600 font-bold';
                  else if (riskLevel === 'medium') riskColor = 'text-yellow-600 font-semibold';
                  else if (riskLevel === 'low') riskColor = 'text-green-600';
                  return <p key={lineIndex}><span className="font-medium">Risk:</span> <span className={riskColor}>{line.split(':')[1]?.trim()}</span></p>;
                }
                 if (line.toLowerCase().startsWith('explanation:')) {
                  return <p key={lineIndex}><span className="font-medium">Explanation:</span> {line.substring(line.indexOf(':') + 1).trim()}</p>;
                }
                 if (line.toLowerCase().startsWith('suggestions:')) {
                  return <p key={lineIndex} className="font-medium mt-1">{line}</p>;
                }
                if (line.startsWith('- ')) {
                  return <li key={lineIndex} className="ml-4 list-disc">{line.substring(2)}</li>;
                }
                return <p key={lineIndex}>{line}</p>;
              })}
            </div>
          ))}
        </div>
      )}
       {!isLoading && !error && !analysis && (
        <p className="text-sm text-gray-500">No threat analysis available at this time.</p>
      )}
    </Card>
  );
};
