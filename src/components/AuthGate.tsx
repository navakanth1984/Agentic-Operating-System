import React, { useState, useRef, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ChevronRight, 
  ScrollText, 
  CheckCircle2, 
  Check,
  AlertTriangle, 
  Globe, 
  Users, 
  Sparkles, 
  FileSignature, 
  RefreshCw,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

interface AuthGateProps {
  onLoginSuccess: (userData: {
    email: string;
    phone: string;
    countryCode: string;
    age: number;
    parentConsentEmail?: string;
    parentSigned?: boolean;
    coppaCompliant: boolean;
    googleId?: string;
    displayName?: string;
    avatarUrl?: string;
    grantedScopes?: string[];
  }) => void;
}

// Global country data helper
const COUNTRIES_LIST = [
  { code: '+1', name: 'United States (US)', flag: '🇺🇸', pattern: '999-999-9999' },
  { code: '+91', name: 'India (IN)', flag: '🇮🇳', pattern: '99999-99999' },
  { code: '+44', name: 'United Kingdom (UK)', flag: '🇬🇧', pattern: '9999-999999' },
  { code: '+1', name: 'Canada (CA)', flag: '🇨🇦', pattern: '999-999-9999' },
  { code: '+61', name: 'Australia (AU)', flag: '🇦🇺', pattern: '999-999-999' },
  { code: '+81', name: 'Japan (JP)', flag: '🇯🇵', pattern: '99-9999-9999' },
  { code: '+49', name: 'Germany (DE)', flag: '🇩🇪', pattern: '999-9999999' },
  { code: '+33', name: 'France (FR)', flag: '🇫🇷', pattern: '9-99-99-99-99' },
  { code: '+65', name: 'Singapore (SG)', flag: '🇸🇬', pattern: '9999-9999' },
  { code: '+971', name: 'United Arab Emirates (AE)', flag: '🇦🇪', pattern: '99-999-9999' },
  { code: '+27', name: 'South Africa (ZA)', flag: '🇿🇦', pattern: '99-999-9999' },
  { code: '+55', name: 'Brazil (BR)', flag: '🇧🇷', pattern: '99-99999-9999' },
];

export default function AuthGate({ onLoginSuccess }: AuthGateProps) {
  // Step tracker: 0 = Age gate, 1 = Credentials, 2 = Terms & CoPPA, 3 = Completed verification
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  
  // Input fields
  const [age, setAge] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES_LIST[0]);
  const [phone, setPhone] = useState<string>('');
  const [customCountryCode, setCustomCountryCode] = useState<string>('');
  const [isCustomCountry, setIsCustomCountry] = useState<boolean>(false);

  // Google OAuth specific states
  const [googleId, setGoogleId] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [grantedScopes, setGrantedScopes] = useState<string[]>([]);
  const [showOAuthConsent, setShowOAuthConsent] = useState<boolean>(false);
  const [oauthCustomEmail, setOauthCustomEmail] = useState<string>('');
  const [oauthCustomName, setOauthCustomName] = useState<string>('');
  const [oauthAccountType, setOauthAccountType] = useState<'preset1' | 'preset2' | 'custom'>('preset1');
  const [oauthScopeEmail, setOauthScopeEmail] = useState<boolean>(true);
  const [oauthScopeProfile, setOauthScopeProfile] = useState<boolean>(true);
  const [oauthStep, setOauthStep] = useState<'consent' | 'retrieving'>('consent');

  // Kid's Law (COPPA) specific states
  const [needsParentConsent, setNeedsParentConsent] = useState<boolean>(false);
  const [parentEmail, setParentEmail] = useState<string>('');
  const [parentSignature, setParentSignature] = useState<string>('');
  const [parentVerified, setParentVerified] = useState<boolean>(false);
  
  // Terms interaction states
  const [scrolledToBottom, setScrolledToBottom] = useState<boolean>(false);
  const [termsAgreed, setTermsAgreed] = useState<boolean>(false);
  const [privacyAgreed, setPrivacyAgreed] = useState<boolean>(false);
  const [kidsConsentAgreed, setKidsConsentAgreed] = useState<boolean>(false);

  // Errors & UI states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  
  const termsTextRef = useRef<HTMLDivElement>(null);

  // Detect scroll on terms block
  const handleTermsScroll = () => {
    const el = termsTextRef.current;
    if (el) {
      const scrollPosition = el.scrollTop + el.clientHeight;
      const totalHeight = el.scrollHeight;
      // Trigger when within 10px of bottom
      if (totalHeight - scrollPosition <= 12) {
        setScrolledToBottom(true);
      }
    }
  };

  // Re-evaluate COPPA criteria when age changes
  useEffect(() => {
    const numericAge = parseInt(age, 10);
    if (!isNaN(numericAge) && numericAge < 13) {
      setNeedsParentConsent(true);
    } else {
      setNeedsParentConsent(false);
      setParentVerified(false);
    }
  }, [age]);

  // Validations per step
  const validateAgeStep = () => {
    const newErrors: Record<string, string> = {};
    const numericAge = parseInt(age, 10);
    
    if (!age) {
      newErrors.age = "Please enter your age to continue.";
    } else if (isNaN(numericAge) || numericAge <= 0 || numericAge > 120) {
      newErrors.age = "Please enter a valid age format (1 - 120).";
    }

    if (numericAge < 13) {
      if (!parentEmail) {
        newErrors.parentEmail = "Under COPPA children laws, parent/guardian email is required for users under 13.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
        newErrors.parentEmail = "Please enter a valid parental email address.";
      }

      if (!parentSignature) {
        newErrors.parentSignature = "Parent/Guardian electronic digital signature consent is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCredsStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = "Google Email account address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid Google email address structure (e.g. user@gmail.com).";
    }

    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!phone) {
      newErrors.phone = "Mobile contact phone number is required.";
    } else if (cleanPhone.length < 5) {
      newErrors.phone = "Please enter a valid global mobile number.";
    }

    if (isCustomCountry && !customCountryCode) {
      newErrors.countryCode = "Please declare the country prefix.";
    } else if (isCustomCountry && !/^\+\d{1,4}$/.test(customCountryCode)) {
      newErrors.countryCode = "Prefix must reflect country country calling codes starting with '+' (e.g., +65).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep0 = () => {
    if (validateAgeStep()) {
      setStep(1);
    }
  };

  const handleNextStep1 = () => {
    if (validateCredsStep()) {
      setStep(2);
    }
  };

  // Google Email Pre-fills simulator buttons
  const handleSimulateGoogleOAuth = () => {
    setShowOAuthConsent(true);
  };

  const handleOAuthConsentComplete = (data: {
    email: string;
    googleId: string;
    displayName: string;
    avatarUrl: string;
    grantedScopes: string[];
  }) => {
    setEmail(data.email);
    setGoogleId(data.googleId);
    setDisplayName(data.displayName);
    setAvatarUrl(data.avatarUrl);
    setGrantedScopes(data.grantedScopes);
    setErrors(prev => ({ ...prev, email: "" }));
    setShowOAuthConsent(false);
  };

  const handleCompleteSignUp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onLoginSuccess({
        email,
        phone: `${isCustomCountry ? customCountryCode : selectedCountry.code} ${phone}`,
        countryCode: isCustomCountry ? customCountryCode : selectedCountry.code,
        age: parseInt(age, 10),
        parentConsentEmail: needsParentConsent ? parentEmail : undefined,
        parentSigned: needsParentConsent ? true : undefined,
        coppaCompliant: true,
        googleId: googleId || undefined,
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
        grantedScopes: grantedScopes.length > 0 ? grantedScopes : undefined
      });
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#020408]/90 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))] pointer-events-none" />
      
      {/* Container Frame */}
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col font-mono text-xs text-[#94A3B8]">
        
        {/* Absolute branding graphics */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-cyan-500 to-[#EC4899]" />
        
        {/* Header Block */}
        <div className="p-6 border-b border-slate-950 bg-[#090D16]/60">
          <div className="flex items-center gap-2 mb-1.5">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold">IDENTITY PROVENANCE GATEWAY</span>
          </div>
          <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider">
            Google Account & Mobile Core Verification
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            Configure system operator credential states, accept data compliance privacy guidelines, and meet kid protection laws.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-b border-slate-850/60 flex items-center justify-between text-[9px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold ${step >= 0 ? 'bg-indigo-950 text-indigo-400 border-indigo-700/80' : 'border-slate-800'}`}>0</span>
            <span className={step === 0 ? 'text-slate-100' : 'text-slate-500'}>AGE & COPPA</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold ${step >= 1 ? 'bg-indigo-950 text-indigo-400 border-indigo-700/80' : 'border-slate-800'}`}>1</span>
            <span className={step === 1 ? 'text-slate-100' : 'text-slate-500'}>CREDENTIALS</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
          <div className="flex items-center gap-1.5">
            <span className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border font-bold ${step >= 2 ? 'bg-indigo-950 text-indigo-400 border-indigo-700/80' : 'border-slate-800'}`}>2</span>
            <span className={step === 2 ? 'text-slate-100' : 'text-slate-500'}>TERMS & PRIVACY</span>
          </div>
        </div>

        {/* Body Content Sections */}
        <div className="p-6 space-y-5 flex-1 min-h-[340px]">

          {/* STEP 0: Age Gate & Children laws (COPPA / GDPR-K) Compliance */}
          {step === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-4 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-extrabold text-[#E2E8F0] block uppercase text-[11px] leading-tight">Data Safety Compliance (COPPA Laws)</span>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    This system operates under strict alignment with the <strong>Children's Online Privacy Protection Act (COPPA)</strong> and global kids laws. We do not gather or track personal vectors on users under 13 without verifiable credentials of parent/guardian consent.
                  </p>
                </div>
              </div>

              {/* Age Field Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 block">Operator Current Age (Years)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => {
                      setAge(e.target.value);
                      if (errors.age) setErrors(prev => ({ ...prev, age: "" }));
                    }}
                    placeholder="Enter age (e.g., 27)"
                    className="w-full bg-[#05070A] border border-slate-800 focus:border-indigo-500 rounded-lg p-2.5 text-slate-100 text-[11.5px] font-mono leading-relaxed focus:outline-none"
                  />
                </div>
                {errors.age && (
                  <span className="text-rose-500 text-[9px] flex items-center gap-1 mt-1 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5" /> {errors.age}
                  </span>
                )}
              </div>

              {/* Dynamic Parental Consent COPPA Gate */}
              {needsParentConsent && (
                <div className="bg-[#0b0c16] border border-[#EC4899]/30 rounded-xl p-4.5 space-y-4 animate-slideDown">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-[#EC4899] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold text-[#F43F5E] block uppercase text-[10px]">COPPA Kid Consent protocol required</span>
                      <p className="text-[9.5px] text-slate-400 mt-1 leading-relaxed">
                        Operators under the age of 13 must submit a verified parent or legal guardian email to grant credentials authorization. A notification link will be issued to authorize access.
                      </p>
                    </div>
                  </div>

                  {/* Parent email */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-500 block">Verifiable Parent Email</label>
                    <input
                      type="email"
                      value={parentEmail}
                      onChange={(e) => {
                        setParentEmail(e.target.value);
                        if (errors.parentEmail) setErrors(prev => ({ ...prev, parentEmail: "" }));
                      }}
                      placeholder="parent@example.com"
                      className="w-full bg-[#020306] border border-slate-850 focus:border-[#EC4899] rounded p-2 text-[10.5px] font-mono text-slate-200"
                    />
                    {errors.parentEmail && (
                      <span className="text-[#F43F5E] text-[8.5px] block font-bold leading-none mt-1">{errors.parentEmail}</span>
                    )}
                  </div>

                  {/* Parent Signature block */}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold uppercase text-slate-500 block">Parent Consent digital sign-off (Type full legal name)</label>
                    <div className="relative">
                      <FileSignature className="absolute left-2.5 top-2.5 w-4.5 h-4.5 text-slate-600" />
                      <input
                        type="text"
                        value={parentSignature}
                        onChange={(e) => {
                          setParentSignature(e.target.value);
                          if (errors.parentSignature) setErrors(prev => ({ ...prev, parentSignature: "" }));
                        }}
                        placeholder="e.g. Navkanth R"
                        className="w-full bg-[#020306] border border-slate-850 focus:border-[#EC4899] rounded p-2 pl-9 text-[10.5px] font-mono text-slate-200 italic"
                      />
                    </div>
                    {errors.parentSignature ? (
                      <span className="text-[#F43F5E] text-[8.5px] block font-bold leading-none mt-1">{errors.parentSignature}</span>
                    ) : (
                      <span className="text-[8px] text-slate-600 font-medium italic block">"I hereby explicitly verify details and consent to raw telemetry capture for application building."</span>
                    )}
                  </div>
                </div>
              )}

              {/* Continue button step 0 */}
              <button
                type="button"
                onClick={handleNextStep0}
                className="w-full py-2.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 hover:border-indigo-700 font-bold uppercase rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <span>Initialize Identity Verification</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 1: Google Email & Global Phone Inputs */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Google account authentication emulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Google Account & Identity</label>
                  {googleId && (
                    <button
                      type="button"
                      onClick={handleSimulateGoogleOAuth}
                      className="text-[9px] text-[#A5B4FC] hover:text-white underline font-bold"
                    >
                      🔄 Reconfigure OAuth
                    </button>
                  )}
                </div>
                
                {googleId ? (
                  <div className="bg-slate-950/60 border border-emerald-950/30 rounded-xl p-3 flex items-start gap-3 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-1.5 bg-emerald-950/40 text-emerald-400 border-l border-b border-emerald-900/50 rounded-bl text-[8px] font-bold uppercase flex items-center gap-1 select-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Google Authenticated
                    </div>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Google Avatar" className="w-9 h-9 rounded-full border border-emerald-500/30 bg-slate-900 mt-0.5 shrink-0" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center text-indigo-400 font-bold shrink-0 mt-0.5">
                        G
                      </div>
                    )}
                    <div className="space-y-1 overflow-hidden pr-24">
                      {displayName && <span className="font-extrabold text-slate-200 block text-[11px] truncate font-mono">{displayName}</span>}
                      <span className="text-slate-400 block text-[10px] truncate font-mono">{email}</span>
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/30 px-1 py-0.5 rounded border border-emerald-900/30 leading-none" title="Unique Google Identifier Subject Claim">
                          sub: {googleId}
                        </span>
                        <span className="text-[8px] font-mono text-indigo-400 bg-indigo-950/40 px-1 py-0.5 rounded border border-indigo-900/30 leading-none text-center" title="Granted OAuth Scopes">
                          {grantedScopes.length} scopes active
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                        }}
                        placeholder="example@gmail.com"
                        className="w-full bg-[#05070A] border border-slate-850 focus:border-indigo-500 rounded-lg p-2.5 pl-9.5 text-slate-100 text-[11px] font-mono focus:outline-none"
                      />
                    </div>
                    {errors.email && (
                      <span className="text-rose-500 text-[8.5px] flex items-center gap-1 mt-1 font-bold">
                        <AlertIcon className="w-3.5 h-3.5" /> {errors.email}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSimulateGoogleOAuth}
                      className="w-full p-2.5 bg-slate-950 hover:bg-slate-950/50 border border-slate-800 hover:border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Sign In with google OAuth Services</span>
                    </button>
                  </div>
                )}
                <span className="text-[8px] text-slate-500 block leading-tight">Must correspond to registered active Google services on linked systems.</span>
              </div>

              {/* Mobile Phone country dynamic lookup block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase text-slate-400">International Mobile Number</label>
                  <div className="flex items-center gap-1.5 text-[8.5px] font-bold">
                    <input
                      type="checkbox"
                      id="custom_code_check"
                      checked={isCustomCountry}
                      onChange={(e) => setIsCustomCountry(e.target.checked)}
                      className="accent-indigo-500 mt-0.5 rounded-sm"
                    />
                    <label htmlFor="custom_code_check" className="text-slate-500 cursor-pointer uppercase hover:text-slate-300">Custom prefix code</label>
                  </div>
                </div>

                <div className="flex gap-2">
                  {/* Select menu / Custom Prefix toggle */}
                  {!isCustomCountry ? (
                    <div className="relative w-[130px] shrink-0">
                      <select
                        value={COUNTRIES_LIST.indexOf(selectedCountry)}
                        onChange={(e) => {
                          const idx = Number(e.target.value);
                          setSelectedCountry(COUNTRIES_LIST[idx]);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                        }}
                        className="w-full bg-[#05070A] border border-slate-850 text-slate-200 p-2.5 rounded-lg text-[11px] font-mono focus:outline-none cursor-pointer"
                      >
                        {COUNTRIES_LIST.map((c, idx) => (
                          <option key={idx} value={idx}>
                            {c.flag} {c.code} ({c.code === '+1' ? c.name.split(' ')[0] : c.name.substring(0, 5).trim()})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="w-[80px] shrink-0">
                      <input
                        type="text"
                        value={customCountryCode}
                        onChange={(e) => {
                          setCustomCountryCode(e.target.value);
                          if (errors.countryCode) setErrors(prev => ({ ...prev, countryCode: "" }));
                        }}
                        placeholder="+XX"
                        className="w-full bg-[#05070A] border border-slate-850 p-2.5 rounded-lg text-[11px] font-mono text-center text-slate-200 focus:outline-none"
                      />
                    </div>
                  )}

                  {/* Phone number input bar */}
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                      }}
                      placeholder={isCustomCountry ? "Full number" : `e.g. ${selectedCountry.pattern}`}
                      className="w-full bg-[#05070A] border border-slate-850 focus:border-indigo-500 rounded-lg p-2.5 pl-9 text-slate-100 text-[11px] font-mono focus:outline-none"
                    />
                  </div>
                </div>

                {errors.countryCode && (
                  <span className="text-rose-500 text-[8.5px] block font-bold mt-1">{errors.countryCode}</span>
                )}
                {errors.phone && (
                  <span className="text-rose-500 text-[8.5px] block font-bold mt-1">{errors.phone}</span>
                )}
                <span className="text-[8px] text-slate-500 block leading-tight">We accept mobile verification routing structures across all national/international standards seamlessly.</span>
              </div>

              {/* Prev / Next split controls */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 uppercase font-bold rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="flex-1 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 hover:border-indigo-700 font-bold uppercase rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Accept System Guidelines</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 2: Scrollable Terms & Conditions + COPPA Data Notice */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                  <ScrollText className="w-4 h-4 text-indigo-400 animate-pulse" />
                  Operator Terms & CoPPA Disclosures
                </label>
                <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  scrolledToBottom ? 'bg-emerald-950 font-black text-emerald-400 border border-emerald-900' : 'bg-amber-950/60 text-amber-500'
                }`}>
                  {scrolledToBottom ? '⚡ Read Validation Verified' : '⚠ Scroll Entire Document to Agree'}
                </span>
              </div>

              {/* Scrollable Terms & conditions box */}
              <div 
                ref={termsTextRef}
                onScroll={handleTermsScroll}
                className="h-[140px] overflow-y-auto bg-[#05070B] border border-slate-850 rounded-lg p-3.5 text-[9px] text-slate-400 leading-relaxed space-y-4 font-sans select-none scrollbar-thin"
              >
                <div>
                  <h4 className="font-bold text-slate-200 uppercase font-mono text-[9.5px]">1. PRIVACY REGULATION & COPPA COMPLIANCE</h4>
                  <p className="mt-1">
                    Pursuant to COPPA (Children's Online Privacy Protection Act, 15 U.S.C. 6501–6506), the Operator's workspace enforces strict parameters. Personal identifiable telemetry is stored on secure server storage. If the account belongs to children under the age of 13, explicit verification of Parent/Guardian signature consent has been validated. Under children's laws, parents retain full rights to request auditing, deletion, and modification of stored configurations.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-200 uppercase font-mono text-[9.5px]">2. SECURE LOGICAL PERSISTENCE & DATA STORAGE</h4>
                  <p className="mt-1">
                    Storage processes execute within secure container configurations on Cloud Run frameworks. Data pipelines do not transfer keys, passphrases, or identity records outside of verification checks. Model workspaces consume GCP Trial promotional vouchers matching configured Billing Accounts explicitly.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-200 uppercase font-mono text-[9.5px]">3. SYSTEM WORKS INTEGRATIONS & SPEND OPTIMIZATION</h4>
                  <p className="mt-1">
                    Operators utilizing automated Dialogflow CX and Vertex AI Agent Discovery tasks accept full responsibility for resource depletion thresholds. Credits will handle model workloads on specified API projects prior to billing accounts being charged standard subscription charges.
                  </p>
                </div>

                <div className="pt-2 text-center text-[8.5px] border-t border-slate-900/60 font-mono text-[#A5B4FC]/80">
                  *** END OF PARAGRAPH STRUCTURE - SYSTEM ID COMPLETED ***
                </div>
              </div>

              {/* Verify conditions Checkboxes */}
              <div className="space-y-2.5 font-mono text-[9.5px] bg-[#090C12]/40 p-3 rounded border border-slate-850/60">
                <div className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="chk_terms"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    disabled={!scrolledToBottom}
                    className="accent-indigo-500 mt-0.5 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="chk_terms" className={`leading-snug select-none cursor-pointer ${scrolledToBottom ? 'text-slate-300 hover:text-slate-100' : 'text-slate-600 cursor-not-allowed'}`}>
                    I agree to the Terms of Service & Privacy Policy constraints.
                    {!scrolledToBottom && <span className="text-[8px] text-[#EC4899] font-bold block">(Unlock by scrolling to the bottom of terms above)</span>}
                  </label>
                </div>

                <div className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    id="chk_privacy"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className="accent-indigo-500 mt-0.5 rounded cursor-pointer"
                  />
                  <label htmlFor="chk_privacy" className="text-slate-300 hover:text-slate-100 leading-snug select-none cursor-pointer">
                    I approve secure capture and localized caching of verification details.
                  </label>
                </div>

                {needsParentConsent && (
                  <div className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      id="chk_kids"
                      checked={kidsConsentAgreed}
                      onChange={(e) => setKidsConsentAgreed(e.target.checked)}
                      className="accent-[#EC4899] mt-0.5 rounded cursor-pointer"
                    />
                    <label htmlFor="chk_kids" className="text-[#EC4899] hover:text-[#EC4899]/90 font-bold leading-snug select-none cursor-pointer">
                      I certify that parent consent details are authentic and compliant with COPPA.
                    </label>
                  </div>
                )}
              </div>

              {/* Prev / Complete triggers */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-slate-950 border border-slate-850 text-slate-400 hover:text-slate-200 uppercase font-bold rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteSignUp}
                  disabled={!termsAgreed || !privacyAgreed || (needsParentConsent && !kidsConsentAgreed) || isVerifying}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-900 to-indigo-950 hover:from-indigo-800 hover:to-indigo-900 disabled:from-slate-950 disabled:to-slate-950 disabled:opacity-40 disabled:border-slate-850 text-indigo-300 disabled:text-slate-500 border border-indigo-800 font-extrabold uppercase rounded-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Syncing Core Identifications...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Complete Authentication Gate</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer info lock badge */}
        <div className="p-4 bg-slate-950 text-[8.5px] border-t border-slate-850 font-mono text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            SECURE SHA256 AES CRYPTO VERIFIED
          </span>
          <span>COPPA RULES ID ACTIVE</span>
        </div>

      </div>

      {/* GOOGLE OAUTH SIMULATED IDENTIFIER & SCOPE CONCURRENCY GATEWAY */}
      {showOAuthConsent && (
        <div className="fixed inset-0 z-[100] bg-slate-950/96 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0b0f19] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-sans text-xs text-[#94A3B8] animate-fadeIn flex flex-col">
            
            {/* Top Bar G Icon Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-bold text-slate-200 tracking-tight text-[11px] font-mono">Google Accounts SSO Hub</span>
              </div>
              <span className="text-[8px] bg-indigo-950 text-indigo-400 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-900/50 select-none">
                OAUTH2 // OIDC
              </span>
            </div>

            {oauthStep === 'consent' ? (
              <div className="p-5 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <div className="text-center space-y-1 mb-4">
                    <h3 className="text-xs font-black text-slate-100 uppercase tracking-wider">Sign in to AgenticOS Console</h3>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      To continue, Google will share your email, profile picture, name, and safe primary account claim identifier with <span className="text-indigo-400 font-bold">AgenticOS State Registry</span>.
                    </p>
                  </div>

                  {/* Account Choosing Section */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 font-mono block">1. Select Identity Operator Account</span>
                    
                    <div className="space-y-1.5 overflow-y-auto max-h-[160px] pr-1">
                      {/* Preset 1 */}
                      <div 
                        onClick={() => setOauthAccountType('preset1')}
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          oauthAccountType === 'preset1' ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-[#05070a] border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Navkanth" alt="Navkanth R" className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-extrabold text-slate-200 block text-[10px] font-mono">Navkanth R (Primary)</span>
                            <span className="text-slate-400 text-[9px] font-mono">navkanthr@gmail.com</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          oauthAccountType === 'preset1' ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-800'
                        }`}>
                          {oauthAccountType === 'preset1' && <Check className="w-3.5 h-3.5 text-indigo-400 font-black" />}
                        </div>
                      </div>

                      {/* Preset 2 */}
                      <div 
                        onClick={() => setOauthAccountType('preset2')}
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                          oauthAccountType === 'preset2' ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-[#05070a] border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Omega" alt="Operator Omega" className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 shrink-0" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-extrabold text-slate-200 block text-[10px] font-mono">Operator Omega</span>
                            <span className="text-slate-400 text-[9px] font-mono">operator-omega@gmail.com</span>
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          oauthAccountType === 'preset2' ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-800'
                        }`}>
                          {oauthAccountType === 'preset2' && <Check className="w-3.5 h-3.5 text-indigo-400 font-black" />}
                        </div>
                      </div>

                      {/* Custom Account */}
                      <div 
                        onClick={() => setOauthAccountType('custom')}
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-1.5 ${
                          oauthAccountType === 'custom' ? 'bg-indigo-950/20 border-indigo-500/50' : 'bg-[#05070a] border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-850 flex items-center justify-center text-[11px] text-indigo-400 shrink-0 font-bold">
                              +
                            </div>
                            <div>
                              <span className="font-bold text-slate-200 block text-[10px] font-mono">Custom Domain Operator</span>
                              <span className="text-slate-500 text-[8.5px]">Enters custom email from any routing country</span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            oauthAccountType === 'custom' ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-800'
                          }`}>
                            {oauthAccountType === 'custom' && <Check className="w-3.5 h-3.5 text-indigo-400 font-black" />}
                          </div>
                        </div>

                        {oauthAccountType === 'custom' && (
                          <div className="space-y-1.5 p-2 border-t border-slate-900 mt-1 animate-fadeIn font-mono">
                            <input 
                              type="text"
                              placeholder="Display Operator Name (e.g. Navkanth R)"
                              value={oauthCustomName}
                              onChange={(e) => setOauthCustomName(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                            <input 
                              type="email"
                              placeholder="operator@any-domain.com"
                              value={oauthCustomEmail}
                              onChange={(e) => setOauthCustomEmail(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Scope Selection Box */}
                  <div className="space-y-1.5 mt-3">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500 font-mono block">2. Google OAuth Scopes Request Claims</span>
                    
                    <div className="bg-[#05070a] border border-slate-900 rounded-lg p-2.5 space-y-2.5 font-mono">
                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          id="scope_openid" 
                          checked={true} 
                          disabled={true}
                          className="accent-indigo-500 mt-0.5 rounded cursor-not-allowed opacity-80 shrink-0"
                        />
                        <div>
                          <label htmlFor="scope_openid" className="text-slate-200 font-bold block text-[8.5px] cursor-not-allowed uppercase">Scope: openid (Strict Core)</label>
                          <span className="text-slate-500 text-[7.5px] leading-tight block">Authenticates OIDC claim protocols. Required.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          id="scope_email" 
                          checked={oauthScopeEmail}
                          onChange={(e) => setOauthScopeEmail(e.target.checked)}
                          className="accent-indigo-500 mt-0.5 rounded cursor-pointer shrink-0"
                        />
                        <div>
                          <label htmlFor="scope_email" className="text-slate-200 font-bold block text-[8.5px] cursor-pointer uppercase">Scope: email (Read Email Address)</label>
                          <span className="text-slate-500 text-[7.5px] leading-tight block">Authorized to pull and link primary Google verified email handles.</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <input 
                          type="checkbox" 
                          id="scope_profile" 
                          checked={oauthScopeProfile}
                          onChange={(e) => setOauthScopeProfile(e.target.checked)}
                          className="accent-indigo-500 mt-0.5 rounded cursor-pointer shrink-0"
                        />
                        <div>
                          <label htmlFor="scope_profile" className="text-slate-200 font-bold block text-[8.5px] cursor-pointer uppercase">Scope: profile (Access Account Profile)</label>
                          <span className="text-slate-500 text-[7.5px] leading-tight block">Authorized to extract basic attributes (Name, Avatar) and the unique identifier claim element (`sub` subject ID).</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Cancel/Consented triggers */}
                <div className="flex gap-2.5 pt-3 border-t border-slate-900/60 font-mono mt-3">
                  <button
                    type="button"
                    onClick={() => setShowOAuthConsent(false)}
                    className="w-1/3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-400 font-bold rounded cursor-pointer transition text-[10px]"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Trigger animated decryption step
                      setOauthStep('retrieving');
                      setTimeout(() => {
                        let finalEmail = 'navkanthr@gmail.com';
                        let finalName = 'Navkanth R';
                        let finalAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=Navkanth';
                        let finalId = '116543292435451290311';

                        if (oauthAccountType === 'preset2') {
                          finalEmail = 'operator-omega@gmail.com';
                          finalName = 'Operator Omega';
                          finalAvatar = 'https://api.dicebear.com/7.x/bottts/svg?seed=Omega';
                          finalId = '110928347101928003194';
                        } else if (oauthAccountType === 'custom') {
                          finalEmail = oauthCustomEmail || 'custom-operator@gmail.com';
                          finalName = oauthCustomName || 'Universal Operator';
                          finalAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(finalName)}`;
                          
                          // Deterministic sub generator
                          let hash = 0;
                          for (let i = 0; i < finalEmail.length; i++) {
                            hash = (hash << 5) - hash + finalEmail.charCodeAt(i);
                            hash |= 0;
                          }
                          finalId = `11${Math.abs(hash)}39401739`;
                        }

                        const scopes = ['openid'];
                        if (oauthScopeEmail) scopes.push('https://www.googleapis.com/auth/userinfo.email');
                        if (oauthScopeProfile) scopes.push('https://www.googleapis.com/auth/userinfo.profile');

                        handleOAuthConsentComplete({
                          email: finalEmail,
                          googleId: finalId,
                          displayName: finalName,
                          avatarUrl: finalAvatar,
                          grantedScopes: scopes,
                        });
                        setOauthStep('consent'); // reset local step
                      }, 2500);
                    }}
                    className="flex-grow py-2 bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white font-extrabold rounded uppercase tracking-wider cursor-pointer transition text-[10px]"
                  >
                    Confirm Scopes & Connect
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-6 space-y-4 font-mono text-[9px] flex-grow flex flex-col justify-center text-slate-400">
                <div className="flex flex-col items-center justify-center space-y-2 py-4">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <span className="text-slate-100 font-bold uppercase tracking-wider text-[10px]">Retrieving OIDC Subject claims...</span>
                </div>
                
                <div className="bg-[#05070a] border border-slate-900 rounded p-3.5 space-y-1.5 leading-relaxed overflow-x-auto text-indigo-300">
                  <div>&gt;_ ESTABLISHING_CHANNEL: <span className="text-slate-500">https://accounts.google.com/o/oauth2/v2/auth</span></div>
                  <div>&gt;_ SCOPES_AUTHORIZED: <span className="text-[#EC4899]">{oauthScopeEmail ? 'email ' : ''}{oauthScopeProfile ? 'profile ' : ''}openid</span></div>
                  <div className="text-emerald-400 animate-pulse">&gt;_ Authorization Exchange code verified successfully.</div>
                  <div>&gt;_ Parsing client id_token (RSA-SHA256 signature)...</div>
                  <div className="text-indigo-400">&gt;_ Fetching UserInfo: GET https://www.googleapis.com/oauth2/v3/userinfo</div>
                  <div className="border-t border-slate-900 pt-1.5 text-slate-500 text-[8.5px]">
                    {"{"}
                    <div className="pl-3 text-slate-300">"sub": "<span className="text-emerald-400 font-bold">11... (Subject Unique Identifier)</span>",</div>
                    <div className="pl-3 text-slate-300">"email_verified": true,</div>
                    <div className="pl-3 text-slate-400 font-mono">"iss": "https://accounts.google.com",</div>
                    <div className="pl-3 text-slate-400 font-mono">"aud": "agenticos.console.app"</div>
                    {"}"}
                  </div>
                </div>
                <p className="text-[8px] text-slate-500 text-center uppercase leading-tight mt-1 select-none">
                  AgenticOS locks OIDC unique subject key to insulate workflows and secure operator environments.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Inline alert icon helper
function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
