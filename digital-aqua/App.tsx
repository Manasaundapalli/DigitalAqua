
import React, { useState, useEffect, useCallback } from 'react';
import {
  AppView,
  UserProfile,
  FarmingType,
  WaterReportAnalysis,
  AnalysisResultFromGemini,
  WaterQualityParameters,
  WeatherForecast,
  WaterParameterKey,
} from './types';
import {
  APP_NAME,
  FARMING_TYPES,
  MOCK_OTP,
  LOCAL_STORAGE_PROFILE_KEY,
  LOCAL_STORAGE_REPORTS_KEY,
  FishIcon,
  ShrimpIcon,
  UploadIcon,
  // ChartBarIcon, // Not directly used in App.tsx render
  DocumentTextIcon,
  // SunIcon, // Not directly used in App.tsx render
  InformationCircleIcon,
  // EditIcon, // Not directly used in App.tsx render
  PARAMETER_DISPLAY_ORDER,
  PARAMETER_UNITS
} from './constants';
import { Button, Input, Select, Card, Spinner, Modal, FileInput, Alert } from './components/CommonUI';
import {
  WaterQualityCard,
  SuggestionsCard,
  WeatherForecastCard,
  ReportSummaryCard,
  WaterQualityTrendChart,
  CurrentParametersBarChart,
  TrafficLightIndicator,
  ThreatAnalysisCard // Added ThreatAnalysisCard
} from './components/DataDisplay';
import { analyzeWaterReportImage, getGenericWeatherForecast, getThreatAnalysis } from './services/geminiService'; // Added getThreatAnalysis
import 'recharts';


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('ENTRY');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userReports, setUserReports] = useState<WaterReportAnalysis[]>([]);
  
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const [registrationForm, setRegistrationForm] = useState<Partial<UserProfile>>({});
  
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultFromGemini | null>(null);
  const [editableAnalysis, setEditableAnalysis] = useState<WaterReportAnalysis | null>(null);
  const [currentReportToView, setCurrentReportToView] = useState<WaterReportAnalysis | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [weatherForecasts, setWeatherForecasts] = useState<WeatherForecast[]>([]);
  // const [showWeatherModal, setShowWeatherModal] = useState<boolean>(false); // Modal not currently used for detailed weather
  const [showTipsModal, setShowTipsModal] = useState<boolean>(false);

  // State for Threat Analysis
  const [threatAnalysisContent, setThreatAnalysisContent] = useState<string | null>(null);
  const [isThreatAnalysisLoading, setIsThreatAnalysisLoading] = useState<boolean>(false);
  const [threatAnalysisError, setThreatAnalysisError] = useState<string | null>(null);


  useEffect(() => {
    const storedProfile = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
    if (storedProfile) {
      try {
        const profile = JSON.parse(storedProfile) as UserProfile;
        setUserProfile(profile);
      } catch (e) {
        console.error("Failed to parse stored profile:", e);
        localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
      }
    }

    const storedReports = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
    if (storedReports) {
      try {
        setUserReports(JSON.parse(storedReports) as WaterReportAnalysis[]);
      } catch (e) {
        console.error("Failed to parse stored reports:", e);
        localStorage.removeItem(LOCAL_STORAGE_REPORTS_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    if (userReports.length > 0 || localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY) !== null) {
         localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(userReports));
    }
  }, [userReports]);

  const handleSendOtp = () => {
    if (!phoneNumber.match(/^\d{10}$/)) { 
      setAuthError('Please enter a valid 10-digit phone number.');
      return;
    }
    setAuthError('');
    setIsLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setIsLoading(false);
      console.log(`OTP Sent (mock): ${MOCK_OTP} for ${phoneNumber}`);
    }, 1000);
  };

  const handleVerifyOtp = () => {
    if (otp !== MOCK_OTP) {
      setAuthError('Invalid OTP. Please try again.');
      setOtp(''); 
      return;
    }
    setAuthError(''); 
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const storedProfileData = localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY);
      if (storedProfileData) {
          try {
            const existingProfile = JSON.parse(storedProfileData) as UserProfile;
            if(existingProfile.phoneNumber === phoneNumber) {
              setUserProfile(existingProfile);
              setCurrentView('DASHBOARD');
              setPhoneNumber(''); 
              setOtp('');
              setOtpSent(false);
              return; 
            }
          } catch (e) {
            console.error("Error parsing stored profile during OTP verification:", e);
            localStorage.removeItem(LOCAL_STORAGE_PROFILE_KEY);
          }
      }
      setRegistrationForm({ phoneNumber: phoneNumber });
      setCurrentView('REGISTRATION');
      setOtp('');
      setOtpSent(false); 
    }, 1000);
  };
  
  const handleRegistrationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegistrationForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = () => {
    if (!registrationForm.name || !registrationForm.farmLocation || !registrationForm.farmingType || !registrationForm.farmSize) {
      setError("Please fill all fields.");
      return;
    }
    setError(null);
    const newProfile: UserProfile = {
      id: `user-${Date.now()}`,
      phoneNumber: registrationForm.phoneNumber!, 
      name: registrationForm.name,
      farmLocation: registrationForm.farmLocation,
      farmingType: registrationForm.farmingType as FarmingType,
      farmSize: registrationForm.farmSize,
    };
    setUserProfile(newProfile);
    setCurrentView('DASHBOARD');
    setRegistrationForm({});
    setPhoneNumber(''); 
  };
  
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null); 
    }
  };

  const processImage = async () => {
    if (!uploadedImageFile || !uploadedImagePreview) {
      setError("Please select an image file.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const base64Data = uploadedImagePreview.split(',')[1];
      const mimeType = uploadedImagePreview.split(';')[0].split(':')[1];
      
      const result = await analyzeWaterReportImage(base64Data, mimeType);
      setAnalysisResult(result);

      const newReportSkeleton: WaterReportAnalysis = {
        id: `report-${Date.now()}`,
        userId: userProfile!.id,
        timestamp: new Date().toISOString(),
        parameters: result.parameters,
        status: result.status,
        suggestions: result.suggestions,
        alerts: [], 
        imageUrl: uploadedImagePreview,
        notes: '',
      };
      setEditableAnalysis(newReportSkeleton);
      setCurrentView('EDIT_ANALYSIS');

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditableAnalysisChange = (paramKey: WaterParameterKey, value: string) => {
    if (!editableAnalysis) return;
    const numValue = parseFloat(value);
    setEditableAnalysis(prev => prev ? {
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramKey]: isNaN(numValue) ? null : numValue,
      }
    } : null);
  };
  
  const handleEditableNotesChange = (notes: string) => {
     if (!editableAnalysis) return;
     setEditableAnalysis(prev => prev ? { ...prev, notes } : null);
  };

  const saveEditedAnalysis = () => {
    if (!editableAnalysis) return;
    const finalReport = { ...editableAnalysis }; // Capture current state
    setUserReports(prevReports => [finalReport, ...prevReports].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setCurrentReportToView(finalReport); 
    setCurrentView('VIEW_ANALYSIS');
    setUploadedImageFile(null);
    setUploadedImagePreview(null);
    setAnalysisResult(null);
    setEditableAnalysis(null);
  };

  const handleViewReport = (reportId: string) => {
    const report = userReports.find(r => r.id === reportId);
    if (report) {
      setCurrentReportToView(report);
      setCurrentView('VIEW_ANALYSIS');
    }
  };

  const fetchWeather = useCallback(async (location?: string) => {
    const farmLocation = location || userProfile?.farmLocation;
    if (farmLocation) {
      // setIsLoading(true); // This isLoading might conflict, manage separately or accept minor UI flicker
      try {
        const forecastData = await getGenericWeatherForecast(farmLocation);
        setWeatherForecasts(forecastData); // Provides 6-day forecast
      } catch (e) {
        console.error("Failed to fetch weather", e);
        setWeatherForecasts([]); // Clear or set error state for weather
      } finally {
        // setIsLoading(false);
      }
    }
  }, [userProfile?.farmLocation]);

  useEffect(() => {
    if (currentView === 'DASHBOARD' || currentView === 'VIEW_ANALYSIS') {
      fetchWeather();
    }
  }, [currentView, fetchWeather]);

  // Fetch Threat Analysis
  const fetchThreatAnalysis = useCallback(async () => {
    if (currentReportToView && userProfile && weatherForecasts.length > 0) {
      setIsThreatAnalysisLoading(true);
      setThreatAnalysisContent(null);
      setThreatAnalysisError(null);
      try {
        const analysisText = await getThreatAnalysis(userProfile, currentReportToView, weatherForecasts);
        setThreatAnalysisContent(analysisText);
      } catch (err) {
        console.error("Failed to fetch threat analysis:", err);
        setThreatAnalysisError(err instanceof Error ? err.message : "Unknown error fetching threats.");
      } finally {
        setIsThreatAnalysisLoading(false);
      }
    }
  }, [currentReportToView, userProfile, weatherForecasts]);

  useEffect(() => {
    if (currentView === 'VIEW_ANALYSIS' && currentReportToView && userProfile && weatherForecasts.length > 0) {
      fetchThreatAnalysis();
    } else if (currentView !== 'VIEW_ANALYSIS') {
      // Clear previous threat analysis when navigating away from VIEW_ANALYSIS
      setThreatAnalysisContent(null);
      setThreatAnalysisError(null);
    }
  }, [currentView, currentReportToView, userProfile, weatherForecasts, fetchThreatAnalysis]);


  const handleLogout = () => {
    setUserProfile(null); 
    setPhoneNumber('');
    setOtp('');
    setOtpSent(false);
    setAuthError('');
    setCurrentView('ENTRY');
  };

  const Header = () => (
    <header className="bg-primary text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-40">
      <h1 className="text-2xl font-bold">{APP_NAME}</h1>
      <div className="flex items-center space-x-4">
        {userProfile && (currentView === 'DASHBOARD' || currentView === 'PAST_REPORTS' || currentView === 'UPLOAD_REPORT' || currentView === 'VIEW_ANALYSIS' || currentView === 'EDIT_ANALYSIS') && (
            <button onClick={handleLogout} className="text-sm hover:text-secondary-light">Logout</button>
        )}
      </div>
    </header>
  );

  const renderView = () => {
    switch (currentView) {
      case 'ENTRY':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gradient-to-br from-primary-light to-secondary-light">
            <Card className="w-full max-w-md text-center shadow-2xl">
              <div className="mb-6">
                <FishIcon className="w-24 h-24 text-primary mx-auto mb-4" />
                <ShrimpIcon className="w-16 h-16 text-accent mx-auto -mt-8" />
              </div>
              <h2 className="text-3xl font-bold text-primary-dark mb-2">Welcome to {APP_NAME}!</h2>
              <p className="text-neutral-dark mb-6">Smart water monitoring &amp; weather insights for aquaculture.</p>
              <Button onClick={() => setCurrentView('OTP_VERIFICATION')} size="lg" className="w-full mt-6">
                Get Started
              </Button>
            </Card>
          </div>
        );
      
      case 'OTP_VERIFICATION':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <Card className="w-full max-w-sm">
              <h2 className="text-2xl font-semibold text-center text-primary-dark mb-6">Phone Verification</h2>
              {!otpSent ? (
                <>
                  <Input 
                    label="Enter Mobile Number" 
                    type="tel" 
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="10-digit number" 
                    maxLength={10}
                    className="mb-4"
                    aria-required="true"
                  />
                  {authError && <Alert type="danger" message={authError} className="mb-4"/>}
                  <Button onClick={handleSendOtp} isLoading={isLoading} className="w-full">Send OTP</Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-center text-gray-600 mb-4">OTP sent to {phoneNumber}. (Mock: {MOCK_OTP})</p>
                  <Input 
                    label="Enter OTP" 
                    type="text" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)} 
                    placeholder="4-digit OTP" 
                    maxLength={4}
                    className="mb-4"
                    aria-required="true"
                  />
                  {authError && <Alert type="danger" message={authError} className="mb-4"/>}
                  <Button onClick={handleVerifyOtp} isLoading={isLoading} className="w-full">Verify OTP</Button>
                  <Button onClick={() => {setOtpSent(false); setAuthError(''); setOtp('');}} variant="outline" className="w-full mt-2">Resend OTP / Change Number</Button>
                </>
              )}
               <Button onClick={() => setCurrentView('ENTRY')} variant="outline" size="sm" className="w-full mt-4 text-xs">Back to Welcome</Button>
            </Card>
          </div>
        );

      case 'REGISTRATION':
        return (
          <div className="container mx-auto p-4 sm:p-8">
            <Card className="max-w-lg mx-auto">
              <h2 className="text-2xl font-semibold text-center text-primary-dark mb-6">New User Registration</h2>
              <p className="text-sm text-center text-gray-600 mb-4">Registering for phone: {registrationForm.phoneNumber}</p>
              {error && <Alert type="danger" message={error} className="mb-4"/>}
              <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
                <Input label="Name" name="name" value={registrationForm.name || ''} onChange={handleRegistrationChange} required />
                <Input label="Farm Location (e.g., City, State)" name="farmLocation" value={registrationForm.farmLocation || ''} onChange={handleRegistrationChange} required />
                <Select 
                  label="Type of Farming" 
                  name="farmingType" 
                  options={FARMING_TYPES.map(ft => ({value: ft, label: ft}))}
                  value={registrationForm.farmingType || ''} 
                  onChange={handleRegistrationChange} 
                  required 
                  placeholder="Select farming type"
                />
                <Input label="Farm Size (e.g., 10 acres, 5 ponds)" name="farmSize" value={registrationForm.farmSize || ''} onChange={handleRegistrationChange} required />
                <Button type="submit" className="w-full" isLoading={isLoading}>Register</Button>
                 <Button onClick={() => setCurrentView('OTP_VERIFICATION')} variant="outline" size="sm" className="w-full mt-2">Back to Phone Verification</Button>
              </form>
            </Card>
          </div>
        );

      case 'DASHBOARD':
        if (!userProfile) { setCurrentView('ENTRY'); return null; }
        const sortedReports = [...userReports].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const latestReport = sortedReports.length > 0 ? sortedReports[0] : null;
        
        return (
          <div className="container mx-auto p-4 sm:p-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary-dark mb-6">Welcome back, {userProfile.name}!</h2>
            
            {latestReport && (
              <Card title="Latest Report Summary" className="mb-6 bg-primary-light/50">
                 <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-neutral-dark">Date: {new Date(latestReport.timestamp).toLocaleDateString()}</p>
                        <p className={`text-lg font-bold ${latestReport.status === 'Safe' ? 'text-success' : latestReport.status === 'Warning' ? 'text-yellow-600' : 'text-danger'}`}>
                            Overall Status: {latestReport.status}
                        </p>
                    </div>
                    <TrafficLightIndicator status={latestReport.status} />
                 </div>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                    <span>pH: {latestReport.parameters.pH ?? 'N/A'}</span>
                    <span>D.O: {latestReport.parameters.dissolvedOxygen ?? 'N/A'} ppm</span>
                    <span>Ammonia: {latestReport.parameters.totalAmmoniaNitrogen ?? 'N/A'} ppm</span>
                    <span>Nitrite: {latestReport.parameters.nitrite ?? 'N/A'} ppm</span>
                </div>
                <Button onClick={() => handleViewReport(latestReport.id)} size="sm" className="mt-4">View Full Report & Threat Analysis</Button>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
              <Card className="hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-2">
                  <UploadIcon className="w-8 h-8 text-primary mr-3" aria-hidden="true"/>
                  <h3 className="text-xl font-semibold text-primary-dark">New Water Report</h3>
                </div>
                <p className="text-sm text-neutral-dark mb-3">Upload a photo of your latest water test results for analysis.</p>
                <Button onClick={() => setCurrentView('UPLOAD_REPORT')} className="w-full">
                  Upload New Report
                </Button>
              </Card>
              <Card className="hover:shadow-xl transition-shadow">
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="w-8 h-8 text-primary mr-3" aria-hidden="true"/>
                  <h3 className="text-xl font-semibold text-primary-dark">Past Reports</h3>
                </div>
                <p className="text-sm text-neutral-dark mb-3">Access and review all your previous water quality analyses.</p>
                <Button onClick={() => setCurrentView('PAST_REPORTS')} variant="outline" className="w-full" disabled={userReports.length === 0}>
                  View Past Reports ({userReports.length})
                </Button>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {weatherForecasts.length > 0 && <WeatherForecastCard forecasts={weatherForecasts} />}
              <Card title="Tips & Alerts" className="hover:shadow-xl transition-shadow">
                  <div className="flex items-center mb-2">
                     <InformationCircleIcon className="w-8 h-8 text-accent mr-3" aria-hidden="true"/>
                     <h3 className="text-xl font-semibold text-accent-dark">Aqua Insights</h3>
                  </div>
                  <p className="text-sm text-neutral-dark mb-3">Get helpful tips and important alerts for your farm.</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>Ensure consistent feeding schedules.</li>
                      <li>Regularly check aeration systems.</li>
                  </ul>
                   <Button onClick={() => setShowTipsModal(true)} variant="outline" size="sm" className="mt-3">More Tips</Button>
              </Card>
            </div>
            
            {userReports.length > 1 && (
                <WaterQualityTrendChart data={sortedReports} parameter="pH" />
            )}
             {userReports.length === 0 && !latestReport && (
              <Alert type="info" message="No reports yet. Upload your first water quality report to see analysis and trends."/>
            )}
          </div>
        );
      
      case 'UPLOAD_REPORT':
        if (!userProfile) { setCurrentView('ENTRY'); return null; }
        return (
          <div className="container mx-auto p-4 sm:p-8">
            <Button onClick={() => setCurrentView('DASHBOARD')} variant="outline" size="sm" className="mb-4">Back to Dashboard</Button>
            <Card className="max-w-lg mx-auto">
              <h2 className="text-2xl font-semibold text-center text-primary-dark mb-6">Upload Weekly Water Report</h2>
              {error && <Alert type="danger" message={error} className="mb-4"/>}
              <FileInput
                label="Upload Photo of Water Test Report"
                name="waterReportImage"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageFileChange}
                className="mb-4"
                aria-describedby="file-upload-instructions"
              />
              {uploadedImagePreview && (
                <div className="mb-4 border rounded-md p-2">
                  <img src={uploadedImagePreview} alt="Water report preview" className="max-w-full h-auto max-h-96 mx-auto rounded-md"/>
                </div>
              )}
              <Button onClick={processImage} isLoading={isLoading} disabled={!uploadedImageFile || isLoading} className="w-full">
                {isLoading ? 'Analyzing...' : 'Analyze Report'}
              </Button>
              <p id="file-upload-instructions" className="text-xs text-gray-500 mt-3 text-center">Ensure the image is clear and parameters are legible. Supported formats: JPG, PNG, WebP.</p>
            </Card>
          </div>
        );
        
      case 'EDIT_ANALYSIS':
        if (!editableAnalysis || !userProfile) { setCurrentView('UPLOAD_REPORT'); return null; }
        return (
          <div className="container mx-auto p-4 sm:p-8">
            <Button onClick={() => {
                setCurrentView('UPLOAD_REPORT'); 
                setUploadedImageFile(null); 
                setUploadedImagePreview(null); 
                setEditableAnalysis(null);
                setError(null);
            }} variant="outline" size="sm" className="mb-4">Back to Upload</Button>
            <Card className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-center text-primary-dark mb-6">Review & Confirm Analysis</h2>
              <p className="text-sm text-gray-600 mb-4">Gemini has extracted the following data. Please review and edit if necessary.</p>
              {editableAnalysis.imageUrl && (
                <div className="mb-4 border rounded-md p-2 max-h-80 overflow-auto">
                  <img src={editableAnalysis.imageUrl} alt="Uploaded report" className="max-w-full h-auto mx-auto rounded-md"/>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {PARAMETER_DISPLAY_ORDER.map(key => (
                  <Input 
                    key={key}
                    label={`${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (${PARAMETER_UNITS[key]})`}
                    type="number"
                    step="any"
                    value={editableAnalysis.parameters[key] === null || editableAnalysis.parameters[key] === undefined ? '' : String(editableAnalysis.parameters[key])}
                    onChange={(e) => handleEditableAnalysisChange(key, e.target.value)}
                  />
                ))}
              </div>
               <div className="mb-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="block w-full px-3 py-2 border border-neutral-DEFAULT rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    value={editableAnalysis.notes || ''}
                    onChange={(e) => handleEditableNotesChange(e.target.value)}
                    placeholder="Add any observations or manual corrections..."
                  />
                </div>
              <Button onClick={saveEditedAnalysis} className="w-full" isLoading={isLoading}>Save and View Full Analysis</Button>
            </Card>
          </div>
        );

      case 'VIEW_ANALYSIS':
        if (!currentReportToView || !userProfile) { setCurrentView('DASHBOARD'); return null; }
        return (
          <div className="container mx-auto p-4 sm:p-6">
            <Button 
                onClick={() => setCurrentView(userReports.filter(r => r.userId === userProfile.id).length > 1 ? 'PAST_REPORTS' : 'DASHBOARD')} 
                variant="outline" 
                size="sm" 
                className="mb-4"
            >
              {userReports.filter(r => r.userId === userProfile.id).length > 1 ? "Back to Past Reports" : "Back to Dashboard"}
            </Button>
            <h2 className="text-2xl sm:text-3xl font-semibold text-primary-dark mb-1">Water Analysis Report</h2>
            <p className="text-sm text-gray-500 mb-6">Report ID: ...{currentReportToView.id.slice(-6)} | Date: {new Date(currentReportToView.timestamp).toLocaleString()}</p>
            
            <ThreatAnalysisCard 
                analysis={threatAnalysisContent} 
                isLoading={isThreatAnalysisLoading} 
                error={threatAnalysisError} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <WaterQualityCard parameters={currentReportToView.parameters} status={currentReportToView.status} />
                    <SuggestionsCard suggestions={[...currentReportToView.suggestions, ...currentReportToView.alerts]} />
                     {currentReportToView.notes && (
                        <Card title="Your Notes" className="mb-6">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentReportToView.notes}</p>
                        </Card>
                    )}
                </div>
                <div className="lg:col-span-1">
                    {currentReportToView.imageUrl && (
                        <Card title="Uploaded Report Image" className="mb-6">
                            <img src={currentReportToView.imageUrl} alt="Water report" className="max-w-full h-auto rounded-md shadow-sm" />
                        </Card>
                    )}
                    {weatherForecasts.length > 0 && <WeatherForecastCard forecasts={weatherForecasts} />}
                </div>
            </div>
            <CurrentParametersBarChart parameters={currentReportToView.parameters} />
          </div>
        );
      
      case 'PAST_REPORTS':
         if (!userProfile) { setCurrentView('ENTRY'); return null; }
         const reportsToDisplay = [...userReports].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return (
            <div className="container mx-auto p-4 sm:p-6">
                <Button onClick={() => setCurrentView('DASHBOARD')} variant="outline" size="sm" className="mb-4">Back to Dashboard</Button>
                <h2 className="text-2xl sm:text-3xl font-semibold text-primary-dark mb-6">Past Water Reports</h2>
                {reportsToDisplay.length > 0 ? (
                    <div className="space-y-4">
                        {reportsToDisplay.map(report => (
                            <ReportSummaryCard key={report.id} report={report} onOpenReport={handleViewReport} />
                        ))}
                    </div>
                ) : (
                    <Card>
                        <p className="text-center text-gray-500 py-8">No past reports found. Upload your first report to get started!</p>
                    </Card>
                )}
            </div>
        );
      default:
        console.error(`Unknown view: ${currentView}. Resetting to ENTRY view.`);
        setUserProfile(null); 
        setCurrentView('ENTRY'); 
        return <p>Redirecting...</p>;
    }
  };
  
  return (
    <div className="min-h-screen bg-neutral-light flex flex-col">
      <Header />
      <main className="flex-grow" role="main">
        {renderView()}
      </main>
      {/* Detailed Weather Modal Removed as it's not currently linked to a button
      <Modal isOpen={showWeatherModal} onClose={() => setShowWeatherModal(false)} title="Detailed Weather Forecast">
        {weatherForecasts.length > 0 ? weatherForecasts.map(day => (
          <div key={day.date} className="py-1 border-b last:border-b-0">
            <strong>{day.date}:</strong> {day.condition}, Min: {day.tempMin}°C, Max: {day.tempMax}°C
          </div>
        )) : <p>No detailed forecast available.</p>}
      </Modal> 
      */}
       <Modal isOpen={showTipsModal} onClose={() => setShowTipsModal(false)} title="Aquaculture Tips & Alerts">
        <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
          <li>Tip: Maintain optimal stocking density to reduce stress on fish/shrimp.</li>
          <li>Alert: Watch for sudden changes in water color or turbidity, which may indicate an algal bloom or contamination.</li>
          <li>Tip: Use high-quality feed appropriate for the species and growth stage.</li>
          <li>Alert: Extreme weather events (heavy rain, heatwaves) can significantly impact water quality. Be prepared to take corrective actions.</li>
          <li>Tip: Keep detailed records of water parameters, feeding, and stock health.</li>
          <li>Tip: Regularly clean pond bottoms to remove organic waste buildup.</li>
          <li>Alert: Monitor for signs of disease (e.g., lethargy, lesions, unusual swimming patterns) and consult an expert if needed.</li>
        </ul>
      </Modal>
      <footer className="bg-neutral-dark text-neutral-light text-center p-4 text-sm">
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
