"use client"

import { useState, useRef, useEffect } from "react"
import FormTabs from "./FormTabs"

export default function HealthForm() {
    const [activeTab, setActiveTab] = useState("elevate")
    
    // Member States - Adults
    const [adults, setAdults] = useState(0)
    const [isAdultAdded, setIsAdultAdded] = useState(false)
    const [showAdultDob, setShowAdultDob] = useState(false)
    const [adultDobs, setAdultDobs] = useState<{d: string, m: string, y: string}[]>([])
    const [adultAgeErrors, setAdultAgeErrors] = useState<boolean[]>([]) 
    const adultPopoverRef = useRef<HTMLDivElement>(null)

    // Member States - Kids
    const [kids, setKids] = useState(0)
    const [isKidAdded, setIsKidAdded] = useState(false)
    const [showKidDob, setShowKidDob] = useState(false)
    const [kidDobs, setKidDobs] = useState<{d: string, m: string, y: string}[]>([])
    const [kidAgeErrors, setKidAgeErrors] = useState<boolean[]>([])
    const kidPopoverRef = useRef<HTMLDivElement>(null)

    // Form Data & UI States
    const [form, setForm] = useState({
        mobile: "", email: "", pincode: "", name: "", 
        terms: true, whatsapp: true
    })
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const [errors, setErrors] = useState({ mobile: false, email: false, pincode: false })
    const [submitted, setSubmitted] = useState(false);
    const [touched, setTouched] = useState({ mobile: false, email: false, pincode: false });

    // --- VALIDATION LOGIC ---

    const calculateAgeDetails = (d: string, m: string, y: string) => {
        if (!d || !m || y.length < 4) return { totalMonths: -1, years: -1 };
        const birthDate = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
        const today = new Date();
        
        let years = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            years--;
        }
        const totalMonths = (years * 12) + (today.getMonth() - birthDate.getMonth());
        return { totalMonths, years };
    };

    const checkAdultAge = (index: number): boolean => {
        const dob = adultDobs[index];
        const { years } = calculateAgeDetails(dob.d, dob.m, dob.y);
        let minAge = (activeTab === 'elevate' || activeTab === 'combo' || activeTab === 'booster') ? 18 : 21;
        let maxAge = 125;
        return years >= minAge && years <= maxAge;
    };

    const checkKidAge = (index: number): boolean => {
        const dob = kidDobs[index];
        const { totalMonths, years } = calculateAgeDetails(dob.d, dob.m, dob.y);
        const minMonths = 3;
        let maxYears = (activeTab === 'elevate' || activeTab === 'combo') ? 30 : 20;
        if (adults === 0 && years < 6) return false;
        return totalMonths >= minMonths && years <= maxYears;
    };

    // --- HANDLERS ---

    const handleAddAdults = () => {
        const newErrors = adultDobs.map((_, i) => !checkAdultAge(i));
        setAdultAgeErrors(newErrors);
        if (newErrors.every(err => !err)) {
            setIsAdultAdded(true);
            setShowAdultDob(false);
        }
    };

    const handleAddKids = () => {
        const newErrors = kidDobs.map((_, i) => !checkKidAge(i));
        setKidAgeErrors(newErrors);
        if (newErrors.every(err => !err)) {
            setIsKidAdded(true);
            setShowKidDob(false);
        }
    };

    const handleAdultCount = (val: number) => {
        const newCount = Math.max(0, Math.min(2, val));
        setAdults(newCount);
        setAdultDobs(prev => {
            const next = [...prev];
            if (newCount > prev.length) for(let i=prev.length; i<newCount; i++) next.push({ d: "", m: "", y: "" });
            else next.splice(newCount);
            return next;
        });
        setAdultAgeErrors(new Array(newCount).fill(false));
        if (newCount > adults) { setShowAdultDob(true); setIsAdultAdded(false); }
    };

    const handleKidCount = (val: number) => {
        const maxK = adults > 0 ? 3 : 1;
        const newCount = Math.max(0, Math.min(maxK, val));
        setKids(newCount);
        setKidDobs(prev => {
            const next = [...prev];
            if (newCount > prev.length) for(let i=prev.length; i<newCount; i++) next.push({ d: "", m: "", y: "" });
            else next.splice(newCount);
            return next;
        });
        setKidAgeErrors(new Array(newCount).fill(false));
        if (newCount > kids) { setShowKidDob(true); setIsKidAdded(false); }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, prevId?: string) => {
        if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && prevId) {
            document.getElementById(prevId)?.focus();
        }
    };

    const updateDob = (type: 'adult' | 'kid', index: number, field: 'd' | 'm' | 'y', value: string, nextId?: string) => {
        const cleanValue = value.replace(/\D/g, "");
        if (type === 'adult') {
            setAdultDobs(prev => {
                const next = [...prev];
                next[index] = { ...next[index], [field]: cleanValue };
                return next;
            });
            setAdultAgeErrors(prev => { const next = [...prev]; next[index] = false; return next; });
        } else {
            setKidDobs(prev => {
                const next = [...prev];
                next[index] = { ...next[index], [field]: cleanValue };
                return next;
            });
            setKidAgeErrors(prev => { const next = [...prev]; next[index] = false; return next; });
        }
        const maxLengths = { d: 2, m: 2, y: 4 };
        if (cleanValue.length >= maxLengths[field] && nextId) {
            document.getElementById(nextId)?.focus();
        }
    };

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (adultPopoverRef.current && !adultPopoverRef.current.contains(e.target as Node)) setShowAdultDob(false);
            if (kidPopoverRef.current && !kidPopoverRef.current.contains(e.target as Node)) setShowKidDob(false);
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let cleanValue = value;
        
        if (name === "mobile") {
            cleanValue = value.replace(/\D/g, "").slice(0, 10);
            const mobileRegex = /^[^0-5][0-9]{9}$/;
            setErrors(p => ({...p, mobile: !mobileRegex.test(cleanValue)}));
        }
        
        if (name === "pincode") {
            cleanValue = value.replace(/\D/g, "").slice(0, 6);
            // Dynamic validation: error if typed but not 6 digits
            setErrors(p => ({...p, pincode: cleanValue.length > 0 && cleanValue.length < 6}));
        }

        if (name === "email") {
            const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,4})$/;
            setErrors(p => ({...p, email: value.trim().length > 0 && !emailRegex.test(value)}));
        }
        
        setForm(prev => ({ ...prev, [name]: cleanValue }));
    };

    const handleProceed = () => {
        setSubmitted(true);
        const mobileRegex = /^[^0-5][0-9]{9}$/;
        const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,4})$/;
        
        const isMobileValid = mobileRegex.test(form.mobile);
        const isEmailValid = emailRegex.test(form.email);
        const isPincodeValid = form.pincode.length === 6;

        if (!isMobileValid || !isEmailValid || !isPincodeValid) {
            setErrors(prev => ({ 
                ...prev, 
                mobile: !isMobileValid,
                email: !isEmailValid,
                pincode: !isPincodeValid 
            }));
            return;
        }
        console.log("Proceeding to quote...");
    };

    const getLabelClass = (name: string, value: string) => {
        const isFloating = focusedField === name || value.length > 0;
        return `absolute left-4 transition-all duration-200 pointer-events-none 
            ${isFloating 
                ? "-top-3 left-3 bg-white px-2 text-[1.2rem] text-[#f36f21] font-semibold" 
                : "top-1/2 -translate-y-1/2 text-[1.6rem] text-[#bfbfbf]"}`;
    };

    const getFieldContainerClass = (name: string) => {
        const isFocused = focusedField === name;
        const hasError = (errors as any)[name] && ((touched as any)[name] || submitted);
        return `relative border rounded-[5px] h-[60px] transition-all bg-white flex items-center
            ${isFocused ? 'border-[#f36f21] ring-1 ring-[#f36f21]' : 'border-[#c9c9c9]'} 
            ${hasError ? 'border-red-500' : ''}`;
    }

    return (
        <div className="w-[1150px] mx-auto mt-16 px-4">
            <FormTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className={`bg-white rounded-b-[10px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[#e5e5e5] px-[4rem] pb-[4rem] transition-all duration-300 
                ${activeTab === 'protect' ? 'pt-[2rem]' : 'pt-[4rem]'}`}>
                
                <form onSubmit={(e) => e.preventDefault()} className="relative">
                    {activeTab !== 'protect' && (
                        <div className="flex gap-[2.5rem] mb-[2.5rem]">
                            {/* ADULT SECTION */}
                            <div className="relative w-full" ref={adultPopoverRef}>
                                <div className="flex items-center justify-between border border-[#c9c9c9] rounded-[8px] py-[1.5rem] px-[2rem] w-full bg-white h-[75px]">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[1.7rem] font-semibold text-[#282828]">Adult(s)</span>
                                        <span className="text-[1.3rem] text-[#838383]">
                                            {activeTab === 'elevate' || activeTab === 'combo' ? '(18 years & above)' : '(21 years & above)'}
                                        </span>
                                    </div>
                                    {isAdultAdded ? (
                                        <div className="flex items-center gap-4">
                                            <span className="text-[2rem] font-bold text-[#282828]">{adults}</span>
                                            <div className="w-[1px] h-[20px] bg-[#c9c9c9]"></div>
                                            <button type="button" onClick={() => {setIsAdultAdded(false); setShowAdultDob(true)}} className="text-[#f36f21] text-[1.7rem] font-bold hover:underline">Edit</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-[1.5rem]">
                                            <button type="button" onClick={() => handleAdultCount(adults - 1)} className="w-[3.2rem] h-[3.2rem] bg-[#f2f2f2] rounded text-[2rem] text-[#282828]">-</button>
                                            <span className="text-[2rem] font-bold w-6 text-center text-[#282828]">{adults}</span>
                                            <button type="button" onClick={() => handleAdultCount(adults + 1)} className="w-[3.2rem] h-[3.2rem] bg-[#f36f21] text-white rounded text-[2rem]">+</button>
                                        </div>
                                    )}
                                </div>
                                {showAdultDob && adults > 0 && (
                                    <div className="absolute top-[110%] left-0 w-[110%] bg-white shadow-2xl border border-[#e5e5e5] rounded-[10px] z-50 p-8">
                                        {adultDobs.map((dob, i) => (
                                            <div key={`adult-${i}`} className="mb-10 last:mb-6 relative">
                                                <label className="absolute -top-3 left-4 bg-white px-2 text-[#838383] text-[1.2rem]">Adult {i + 1} date of birth</label>
                                                <div className={`flex items-center border rounded-[5px] p-5 transition-colors ${adultAgeErrors[i] ? 'border-red-500 bg-red-50' : 'border-[#c9c9c9]'}`}>
                                                    <div className="flex items-center gap-4 flex-1 text-[1.6rem] font-bold text-[#282828]">
                                                        <input id={`ad-${i}-d`} type="text" placeholder="DD" maxLength={2} value={dob?.d || ""} className="w-12 text-center outline-none bg-transparent" onKeyDown={(e) => handleKeyDown(e)} onChange={(e) => updateDob('adult', i, 'd', e.target.value, `ad-${i}-m`)} />
                                                        <span className="text-[#bfbfbf] font-normal">/</span>
                                                        <input id={`ad-${i}-m`} type="text" placeholder="MM" maxLength={2} value={dob?.m || ""} className="w-12 text-center outline-none bg-transparent" onKeyDown={(e) => handleKeyDown(e, `ad-${i}-d`)} onChange={(e) => updateDob('adult', i, 'm', e.target.value, `ad-${i}-y`)} />
                                                        <span className="text-[#bfbfbf] font-normal">/</span>
                                                        <input id={`ad-${i}-y`} type="text" placeholder="YYYY" maxLength={4} value={dob?.y || ""} className="w-20 text-center outline-none bg-transparent" onKeyDown={(e) => handleKeyDown(e, `ad-${i}-m`)} onChange={(e) => updateDob('adult', i, 'y', e.target.value)} />
                                                    </div>
                                                </div>
                                                {adultAgeErrors[i] && (
                                                    <span className="text-red-500 text-[1.1rem] mt-1 block">Invalid Age for Adult {i+1}</span>
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex justify-end"><button type="button" onClick={handleAddAdults} className="bg-[#f36f21] text-white font-bold px-10 py-4 rounded-[8px] text-[1.6rem]">Add</button></div>
                                    </div>
                                )}
                            </div>
                            
                            {/* KID SECTION */}
                            <div className="relative w-full" ref={kidPopoverRef}>
                                <div className="flex items-center justify-between border border-[#c9c9c9] rounded-[8px] py-[1.5rem] px-[2rem] w-full bg-white h-[75px]">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-[1.7rem] font-semibold text-[#282828]">Kid(s)</span>
                                        <span className="text-[1.3rem] text-[#838383]">(3 months - 30 years)</span>
                                    </div>
                                    {isKidAdded ? (
                                        <div className="flex items-center gap-4">
                                            <span className="text-[2rem] font-bold text-[#282828]">{kids}</span>
                                            <div className="w-[1px] h-[20px] bg-[#c9c9c9]"></div>
                                            <button type="button" onClick={() => {setIsKidAdded(false); setShowKidDob(true)}} className="text-[#f36f21] text-[1.7rem] font-bold hover:underline">Edit</button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-[1.5rem]">
                                            <button type="button" onClick={() => handleKidCount(kids - 1)} className="w-[3.2rem] h-[3.2rem] bg-[#f2f2f2] rounded text-[2rem] text-[#282828]">-</button>
                                            <span className="text-[2rem] font-bold w-6 text-center text-[#282828]">{kids}</span>
                                            <button type="button" onClick={() => handleKidCount(kids + 1)} className="w-[3.2rem] h-[3.2rem] bg-[#f36f21] text-white rounded text-[2rem]">+</button>
                                        </div>
                                    )}
                                </div>
                                {showKidDob && kids > 0 && (
                                    <div className="absolute top-[110%] left-0 w-[110%] bg-white shadow-2xl border border-[#e5e5e5] rounded-[10px] z-50 p-8">
                                        {kidDobs.map((dob, i) => (
                                            <div key={`kid-${i}`} className="mb-10 last:mb-6 relative">
                                                <label className="absolute -top-3 left-4 bg-white px-2 text-[#838383] text-[1.2rem]">Kid {i + 1} date of birth</label>
                                                <div className={`flex items-center border rounded-[5px] p-5 transition-colors ${kidAgeErrors[i] ? 'border-red-500 bg-red-50' : 'border-[#c9c9c9]'}`}>
                                                    <div className="flex items-center gap-4 flex-1 text-[1.6rem] font-bold text-[#282828]">
                                                        <input id={`kd-${i}-d`} type="text" placeholder="DD" maxLength={2} value={dob?.d || ""} className="w-12 text-center outline-none bg-transparent" onKeyDown={(e) => handleKeyDown(e)} onChange={(e) => updateDob('kid', i, 'd', e.target.value, `kd-${i}-m`)} />
                                                        <span className="text-[#bfbfbf] font-normal">/</span>
                                                        <input id={`kd-${i}-m`} type="text" placeholder="MM" maxLength={2} value={dob?.m || ""} className="w-12 text-center outline-none bg-transparent" onKeyDown={(e) => handleKeyDown(e, `kd-${i}-d`)} onChange={(e) => updateDob('kid', i, 'm', e.target.value, `kd-${i}-y`)} />
                                                        <span className="text-[#bfbfbf] font-normal">/</span>
                                                        <input id={`kd-${i}-y`} type="text" placeholder="YYYY" maxLength={4} value={dob?.y || ""} className="w-20 text-center outline-none bg-transparent" onKeyDown={(e) => handleKeyDown(e, `kd-${i}-m`)} onChange={(e) => updateDob('kid', i, 'y', e.target.value)} />
                                                    </div>
                                                </div>
                                                {kidAgeErrors[i] && (
                                                    <span className="text-red-500 text-[1.1rem] mt-1 block">Invalid Age for Kid {i+1}</span>
                                                )}
                                            </div>
                                        ))}
                                        <div className="flex justify-end"><button type="button" onClick={handleAddKids} className="bg-[#f36f21] text-white font-bold px-10 py-4 rounded-[8px] text-[1.6rem]">Add</button></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* INPUTS ROW WITH FLOATING LABELS */}
                    <div className={`grid gap-[1.5rem] items-start ${activeTab === 'protect' ? 'grid-cols-3' : 'grid-cols-5'}`}>
                        <div className="relative">
                            <div className={getFieldContainerClass('mobile')}>
                                <label className={getLabelClass('mobile', form.mobile)}>Mobile number</label>
                                <input type="text" name="mobile" value={form.mobile} onFocus={() => setFocusedField('mobile')} onBlur={() => setTouched({...touched, mobile: true, pincode: touched.pincode, email: touched.email})} onChange={handleInputChange} className="w-full text-[1.6rem] outline-none text-[#282828] font-medium bg-transparent px-4 mt-2" />
                            </div>
                            {errors.mobile && (touched.mobile || submitted) && (
                                <span className="absolute left-0 -bottom-8 text-red-500 text-[1.1rem] whitespace-nowrap">Please enter a valid Mobile number</span>
                            )}
                        </div>

                        <div className="relative">
                            <div className={getFieldContainerClass('email')}>
                                <label className={getLabelClass('email', form.email)}>Email</label>
                                <input type="text" name="email" value={form.email} onFocus={() => setFocusedField('email')} onBlur={() => setTouched({...touched, email: true, mobile: touched.mobile, pincode: touched.pincode})} onChange={handleInputChange} className="w-full text-[1.6rem] outline-none text-[#282828] font-medium bg-transparent px-4 mt-2" />
                            </div>
                            {errors.email && (touched.email || submitted) && (
                                <span className="absolute left-0 -bottom-8 text-red-500 text-[1.1rem] whitespace-nowrap">Please enter a valid email id</span>
                            )}
                        </div>

                        {activeTab !== 'protect' && (
                            <>
                                <div className="relative">
                                    <div className={getFieldContainerClass('pincode')}>
                                        <label className={getLabelClass('pincode', form.pincode)}>Pincode</label>
                                        <input type="text" name="pincode" value={form.pincode} 
                                            onFocus={() => setFocusedField('pincode')} 
                                            onBlur={() => setTouched({...touched, pincode: true, mobile: touched.mobile, email: touched.email})} 
                                            onChange={handleInputChange} 
                                            className="w-full text-[1.6rem] outline-none text-[#282828] font-medium bg-transparent px-4 mt-2" 
                                        />
                                    </div>
                                    {errors.pincode && (touched.pincode || submitted) && (
                                        <span className="absolute left-0 -bottom-8 text-red-500 text-[1.1rem] whitespace-nowrap">Please enter a valid pincode</span>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className={getFieldContainerClass('name')}>
                                        <label className={getLabelClass('name', form.name)}>Name (Optional)</label>
                                        <input type="text" name="name" value={form.name} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} onChange={handleInputChange} className="w-full text-[1.6rem] outline-none text-[#282828] font-medium bg-transparent px-4 mt-2" />
                                    </div>
                                </div>
                            </>
                        )}
                        <button type="button" onClick={handleProceed} className={`rounded-[5px] text-[1.8rem] font-bold h-[60px] transition-all 
                            ${(isAdultAdded || isKidAdded || activeTab === 'protect') && !errors.mobile && !errors.email && !errors.pincode && form.pincode.length === 6 ? 'bg-[#f36f21] text-white hover:bg-[#e05f1a]' : 'bg-[#bfbfbf] text-white cursor-not-allowed'}`}>
                            Get quote
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}