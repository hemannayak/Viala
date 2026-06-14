'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Server, UserCheck, Activity, FileSpreadsheet, Lock, Check } from 'lucide-react';

export default function GetStartedPage() {
  const [step, setStep] = useState<number>(1);
  const [orgName, setOrgName] = useState<string>('');
  const [orgType, setOrgType] = useState<string>('Pharmacy Chain');
  const [locationsCount, setLocationsCount] = useState<string>('6-20');
  const [fullName, setFullName] = useState<string>('');
  const [workEmail, setWorkEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // Importer simulation states
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importCompleted, setImportCompleted] = useState<boolean>(false);

  const startInventorySync = () => {
    if (isImporting) return;
    setIsImporting(true);
    setImportProgress(0);
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsImporting(false);
          setImportCompleted(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFAF8] py-24 px-4 sm:px-6 lg:px-8">
      
      {/* Onboarding Box */}
      <div className="w-full max-w-lg space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#E8E5DF] shadow-xl relative">
        
        {/* Top ribbon progress tracker */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#E8E5DF] rounded-t-2xl overflow-hidden flex">
          <div className="h-full bg-[#10B981] transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
        </div>

        {/* Step Indicator Header */}
        <div className="flex justify-between items-center text-[10px] font-bold text-[#717171] uppercase tracking-wider">
          <span>Step {step} of 5</span>
          <span className="text-[#10B981]">{step === 5 ? 'Ready' : `Configuring ${orgType}`}</span>
        </div>

        {/* ── STEP 1: ORGANIZATION DETAILS ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>Create Organization</h2>
              <p className="mt-2 text-xs text-[#717171]">Enter the baseline details of your healthcare or pharmacy organization to get started.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Organization Name</label>
                <input
                  type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} required
                  className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3.5 py-2 text-xs focus:border-[#10B981] focus:outline-none"
                  placeholder="Apollo Care Network"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Organization Type</label>
                  <select
                    value={orgType} onChange={(e) => setOrgType(e.target.value)}
                    className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3 py-2 text-xs focus:border-[#10B981] focus:outline-none"
                  >
                    <option>Pharmacy Chain</option>
                    <option>Hospital Network</option>
                    <option>Healthcare Network</option>
                    <option>Independent Pharmacy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Branches / Locations</label>
                  <select
                    value={locationsCount} onChange={(e) => setLocationsCount(e.target.value)}
                    className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3 py-2 text-xs focus:border-[#10B981] focus:outline-none"
                  >
                    <option>1-5</option>
                    <option>6-20</option>
                    <option>21-50</option>
                    <option>50+</option>
                  </select>
                </div>
              </div>
            </div>
            <button
              onClick={nextStep} disabled={!orgName}
              className="w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-white transition-all bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Locations Setup
            </button>
          </div>
        )}

        {/* ── STEP 2: LOCATIONS SETUP ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>Locations & Ports</h2>
              <p className="mt-2 text-xs text-[#717171]">Configure active sync ports representing your physical medicine inventory shelves.</p>
            </div>
            <div className="border rounded-xl p-4 bg-[#FAFAF8] space-y-4">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-[#10B981]" />
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Primary Distribution Hub</div>
                  <div className="text-[10px] text-[#717171]">Active sync port: app.viala.in/ports/hub-delhi</div>
                </div>
              </div>
              <div className="h-[1px] bg-[#E8E5DF]" />
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-amber-600 animate-pulse" />
                <div>
                  <div className="text-xs font-bold text-[#0F172A]">Regional Shortage Locator</div>
                  <div className="text-[10px] text-[#717171]">Calculates cross-branch deficits automatically</div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={prevStep} className="flex-1 py-3 px-4 rounded-xl border text-xs font-bold bg-white text-[#0F172A]">
                Back
              </button>
              <button onClick={nextStep} className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B]">
                Configure Team Accounts
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: ADMIN USERS SETUP ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>Primary Administrator</h2>
              <p className="mt-2 text-xs text-[#717171]">Setup credentials for the manager authorizing inventory transfer policies.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Administrator Full Name</label>
                <input
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                  className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3.5 py-2 text-xs focus:border-[#10B981] focus:outline-none"
                  placeholder="Dr. Aman Kumar"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Work Email Address</label>
                <input
                  type="email" value={workEmail} onChange={(e) => setWorkEmail(e.target.value)} required
                  className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3.5 py-2 text-xs focus:border-[#10B981] focus:outline-none"
                  placeholder="aman@apollo.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0F172A] uppercase tracking-wider mb-2">Secure Passkey / Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="block w-full rounded-md border border-[#E8E5DF] bg-white px-3.5 py-2 text-xs focus:border-[#10B981] focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={prevStep} className="flex-1 py-3 px-4 rounded-xl border text-xs font-bold bg-white text-[#0F172A]">
                Back
              </button>
              <button
                onClick={nextStep} disabled={!fullName || !workEmail || !password}
                className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Go to Inventory Import
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: INVENTORY IMPORT SYNC ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>Import Inventory</h2>
              <p className="mt-2 text-xs text-[#717171]">Simulate importing your active inventory CSV register or connecting to PMS API keys.</p>
            </div>
            
            <div className="border border-dashed border-[#E8E5DF] rounded-xl p-8 bg-[#FAFAF8] text-center space-y-4">
              <FileSpreadsheet className="w-10 h-10 text-[#717171] mx-auto" />
              <div>
                <div className="text-xs font-bold text-[#0F172A]">Drag & Drop active inventory file</div>
                <div className="text-[9px] text-[#717171] mt-1">Accepts standard .csv or PMS API JSON payload</div>
              </div>
              
              {!isImporting && !importCompleted && (
                <button
                  onClick={startInventorySync}
                  className="px-4 py-2 bg-[#10B981] hover:bg-emerald-600 rounded-lg text-white font-bold text-xs shadow-sm transition-all"
                >
                  Start Integration Sync
                </button>
              )}

              {isImporting && (
                <div className="space-y-2 max-w-[240px] mx-auto">
                  <div className="h-1.5 w-full bg-[#E8E5DF] rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981] transition-all duration-150" style={{ width: `${importProgress}%` }} />
                  </div>
                  <div className="text-[9px] text-[#717171] font-mono">Parsing medicine expiries: {importProgress}%</div>
                </div>
              )}

              {importCompleted && (
                <div className="text-xs font-bold text-[#10B981] flex items-center justify-center gap-1.5 animate-pulse">
                  <CheckCircle className="w-4 h-4" /> 1,480 medicine SKUs Parsed Successfully
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={prevStep} className="flex-1 py-3 px-4 rounded-xl border text-xs font-bold bg-white text-[#0F172A]">
                Back
              </button>
              <button
                onClick={nextStep} disabled={!importCompleted}
                className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold text-white bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                View Mission Control
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: ONBOARDING COMPLETE ── */}
        {step === 5 && (
          <div className="space-y-6 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <Check className="w-6 h-6" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]" style={{ fontFamily: 'var(--font-jakarta)' }}>Mission Control Ready</h2>
              <p className="mt-2 text-xs text-[#717171]">
                Your organization registration is complete. VIALA has connected to the PMS port and verified active compliance ledgers.
              </p>
            </div>

            <div className="border rounded-xl p-4 bg-[#FAFAF8] text-left text-xs font-mono space-y-1.5 text-[#717171]">
              <div><span className="text-emerald-600">Sync Status:</span> OK (API Port Connected)</div>
              <div><span className="text-emerald-600">Audit Signatures:</span> e3b0c442...92bf</div>
              <div><span className="text-emerald-600">Locations Tracked:</span> {locationsCount} active branches</div>
            </div>

            <Link
              href="/"
              className="block w-full py-3 px-4 rounded-xl text-center text-xs font-bold text-white transition-all bg-[#10B981] hover:bg-emerald-600 shadow-md"
            >
              Enter Dashboard Console
            </Link>
          </div>
        )}

        <p className="text-center text-xs text-[#717171]">
          Already have an account?{' '}
          <Link href="/login" className="font-bold text-[#10B981] hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
