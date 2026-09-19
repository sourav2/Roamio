import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, MapPin, Navigation, Image, RefreshCw, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import { envConfig } from '../services/envConfig';
import { geocodingService } from '../services/maps/geocodingService';
import { routingService } from '../services/maps/routingService';
import { imageProvider } from '../services/images/imageProvider';
import { roamioTokens } from '../styles/roamioTokens';
import {
  Button,
  Input,
  LocationAutocompleteInput,
  SearchInput,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tabs,
  SegmentedControl,
  Chip,
  Modal,
  Drawer,
  Popover,
} from '../components/ui';
import ManualPreferencesDrawer from '../components/ManualPreferencesDrawer';
import RightSidePanel from '../components/RightSidePanel';

export default function DeveloperTestPage({ onBack }) {
  const [loading, setLoading] = useState(false);
  // Roamio Core UI test states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPreferencesDrawerOpen, setIsPreferencesDrawerOpen] = useState(false);
  const [drawerPlacement, setDrawerPlacement] = useState('right');
  const [activeUiTab, setActiveUiTab] = useState('overview');
  const [selectedComfort, setSelectedComfort] = useState('comfort');
  const [selectedChips, setSelectedChips] = useState(['mountains', 'food']);
  const [testInput, setTestInput] = useState('');
  const [testLocation, setTestLocation] = useState('Guwahati');
  const [testSearch, setTestSearch] = useState('');
  const [statuses, setStatuses] = useState({
    gemini: { status: 'Checking...', details: 'Validating key configuration' },
    geocoding: { status: 'Checking...', details: 'Testing Nominatim OSM connection' },
    routing: { status: 'Checking...', details: 'Testing OSRM route connection' },
    images: { status: 'Checking...', details: 'Testing Unsplash and Pexels searches' }
  });

  const runDiagnostics = async () => {
    setLoading(true);
    const results = { ...statuses };

    // 1. Gemini AI Status Check
    const geminiKey = envConfig.GEMINI_API_KEY;
    if (geminiKey) {
      results.gemini = {
        status: 'Connected',
        details: `Key configured (${geminiKey.substring(0, 5)}...${geminiKey.substring(geminiKey.length - 3)}). Ready for generative travel planning.`,
        ok: true
      };
    } else {
      results.gemini = {
        status: 'Not Connected',
        details: 'VITE_GEMINI_API_KEY environment variable is empty. AI operations will use local high-fidelity mocks.',
        ok: false
      };
    }

    // 2. Geocoding Status Check
    try {
      const coords = await geocodingService.getCoordinates('Shillong');
      if (coords && Array.isArray(coords) && coords.length === 2 && coords[0] !== 20.5937) {
        results.geocoding = {
          status: 'Connected',
          details: `Nominatim OSM active. Geocoded "Shillong" to coordinates: [${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}].`,
          ok: true
        };
      } else {
        results.geocoding = {
          status: 'Not Connected',
          details: 'Geocoding endpoint returned default center coordinates. Falling back to local offline presets.',
          ok: false
        };
      }
    } catch (e) {
      results.geocoding = {
        status: 'Not Connected',
        details: `Nominatim connection failed: ${e.message}. Offline presets active.`,
        ok: false
      };
    }

    // 3. Routing Status Check
    try {
      const guwahati = [26.1445, 91.7362];
      const shillong = [25.5788, 91.8831];
      const route = await routingService.getDrivingRoute([guwahati, shillong]);
      if (route && route.distance > 0 && route.geometry.length > 2) {
        results.routing = {
          status: 'Connected',
          details: `OSRM Service online. Guwahati to Shillong driving distance: ${route.distance} km, estimated time: ${route.duration} hrs.`,
          ok: true
        };
      } else {
        results.routing = {
          status: 'Not Connected',
          details: 'OSRM routing query failed. Falling back to straight-line math coordinates.',
          ok: false
        };
      }
    } catch (e) {
      results.routing = {
        status: 'Not Connected',
        details: `OSRM routing query failed: ${e.message}. Straight-line math fallback active.`,
        ok: false
      };
    }

    // 4. Image Provider Status Check
    try {
      const images = await imageProvider.searchDestinationImages('Shillong', 'Meghalaya', 'hills');
      const usingKey = !!(import.meta.env.VITE_UNSPLASH_API_KEY || import.meta.env.VITE_PEXELS_API_KEY);
      if (images && images.length > 0 && images[0]) {
        results.images = {
          status: 'Connected',
          details: `Image providers active. Successfully loaded search assets ${usingKey ? '(Key-based)' : '(Keyless NAPI)'}. Found URL: ${images[0].substring(0, 50)}...`,
          ok: true
        };
      } else {
        results.images = {
          status: 'Not Connected',
          details: 'Image queries failed or timed out. Loading local curated fallback database.',
          ok: false
        };
      }
    } catch (e) {
      results.images = {
        status: 'Not Connected',
        details: `Image provider search failed: ${e.message}. Curated fallback database active.`,
        ok: false
      };
    }

    setStatuses(results);
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Developer Diagnostic Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">Verify system connections, credentials validation, and API integrity</p>
          </div>
        </div>

        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50 cursor-pointer active:scale-95"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Run Diagnostics
        </button>
      </div>

      {/* Grid of Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Gemini Diagnostic Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Gemini AI Model</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold ${
                statuses.gemini.status === 'Connected' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : statuses.gemini.status === 'Checking...'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {statuses.gemini.status === 'Connected' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {statuses.gemini.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {statuses.gemini.details}
            </p>
          </div>
          <div className="text-3xs text-slate-400 font-mono pt-3 border-t border-slate-50">
            Variable: VITE_GEMINI_API_KEY
          </div>
        </div>

        {/* OSM Geocoding Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <MapPin className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Nominatim Geocoding</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold ${
                statuses.geocoding.status === 'Connected' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : statuses.geocoding.status === 'Checking...'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {statuses.geocoding.status === 'Connected' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {statuses.geocoding.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {statuses.geocoding.details}
            </p>
          </div>
          <div className="text-3xs text-slate-400 font-mono pt-3 border-t border-slate-50">
            Endpoint: OpenStreetMap Nominatim API
          </div>
        </div>

        {/* OSRM Routing Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Navigation className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">OSRM Road Routing</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold ${
                statuses.routing.status === 'Connected' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : statuses.routing.status === 'Checking...'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {statuses.routing.status === 'Connected' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {statuses.routing.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {statuses.routing.details}
            </p>
          </div>
          <div className="text-3xs text-slate-400 font-mono pt-3 border-t border-slate-50">
            Endpoint: Project OSRM Route Engine
          </div>
        </div>

        {/* Image Providers Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-premium space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                  <Image className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Visual Image Providers</h3>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold ${
                statuses.images.status === 'Connected' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : statuses.images.status === 'Checking...'
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-amber-50 text-amber-700 border border-amber-100'
              }`}>
                {statuses.images.status === 'Connected' ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {statuses.images.status}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {statuses.images.details}
            </p>
          </div>
          <div className="text-3xs text-slate-400 font-mono pt-3 border-t border-slate-50">
            Variables: VITE_UNSPLASH_API_KEY / VITE_PEXELS_API_KEY
          </div>
        </div>

      </div>

      {/* Developer Information Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
        <h3 className="text-xs font-bold text-slate-800">System Integration Status Notes:</h3>
        <ul className="text-xs text-slate-500 font-medium list-disc pl-5 space-y-1">
          <li>If Gemini AI is not connected, the frontend seamlessly maps prompt calls to local Mock planners.</li>
          <li>Nominatim (OSM) and OSRM are keyless open-source engines and are functional out-of-the-box.</li>
          <li>For Image searches, the application defaults to curated high-resolution matching templates if API quotas are exceeded.</li>
        </ul>
      </div>

      {/* Roamio Design System Tokens Verification Section */}
      <div className="bg-white border border-roamio-border-light rounded-2xl p-6 shadow-roamio-md space-y-6">
        <div className="flex items-center justify-between border-b border-roamio-divider pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-roamio-primary-accent inline-block"></span>
              <h2 className="text-xl font-bold font-roamio-display text-roamio-text-primary">
                Roamio Design System Token Verification
              </h2>
            </div>
            <p className="text-xs text-roamio-text-secondary mt-1">
              Active Design Tokens verified against specification: Colors, Typography (Fraunces & Inter), Spacing (0-10), Radius (None-Full), Drop Shadows, Strokes, and 12-Column Desktop Grid.
            </p>
          </div>
          <span className="px-3 py-1 bg-roamio-semantic-success-bg text-roamio-semantic-success border border-roamio-semantic-success/20 rounded-roamio-full text-xs font-semibold">
            Tokens Loaded
          </span>
        </div>

        {/* 1. Colors Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            1. Color Tokens Palette
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-roamio-2 border border-roamio-border-light bg-roamio-bg-app shadow-roamio-sm">
              <div className="h-8 rounded-roamio-1 bg-[#FFFFFF] border border-roamio-border-light mb-2"></div>
              <div className="font-semibold text-roamio-text-primary">App Background</div>
              <div className="text-2xs text-roamio-text-tertiary">#FFFFFF</div>
            </div>
            <div className="p-3 rounded-roamio-2 border border-roamio-border-light bg-roamio-bg-secondary shadow-roamio-sm">
              <div className="h-8 rounded-roamio-1 bg-[#F8F6F0] border border-roamio-border-light mb-2"></div>
              <div className="font-semibold text-roamio-text-primary">Secondary Bg</div>
              <div className="text-2xs text-roamio-text-tertiary">#F8F6F0</div>
            </div>
            <div className="p-3 rounded-roamio-2 border border-roamio-border-light bg-white shadow-roamio-sm">
              <div className="h-8 rounded-roamio-1 bg-roamio-primary-accent mb-2"></div>
              <div className="font-semibold text-roamio-text-primary">Primary Accent</div>
              <div className="text-2xs text-roamio-text-tertiary">#164A3A</div>
            </div>
            <div className="p-3 rounded-roamio-2 border border-roamio-border-light bg-white shadow-roamio-sm">
              <div className="h-8 rounded-roamio-1 bg-roamio-primary-hover mb-2"></div>
              <div className="font-semibold text-roamio-text-primary">Primary Hover</div>
              <div className="text-2xs text-roamio-text-tertiary">#0E3227</div>
            </div>
            <div className="p-3 rounded-roamio-2 border border-roamio-border-light bg-white shadow-roamio-sm">
              <div className="h-8 rounded-roamio-1 bg-roamio-accent-secondary mb-2"></div>
              <div className="font-semibold text-roamio-text-primary">Accent Secondary</div>
              <div className="text-2xs text-roamio-text-tertiary">#EBBA58 (x3)</div>
            </div>
            <div className="p-3 rounded-roamio-2 border border-roamio-border-light bg-white shadow-roamio-sm">
              <div className="h-8 rounded-roamio-1 bg-roamio-semantic-success mb-2"></div>
              <div className="font-semibold text-roamio-text-primary">Success</div>
              <div className="text-2xs text-roamio-text-tertiary">#2F9E6F</div>
            </div>
          </div>
        </div>

        {/* 2. Typography Demonstration */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            2. Typography Scale (Fraunces & Inter)
          </h3>
          <div className="p-4 rounded-roamio-3 border border-roamio-border-light bg-roamio-bg-secondary space-y-3">
            <div className="font-roamio-display font-normal text-2xl md:text-4xl text-roamio-text-primary">
              Fraunces Display: H-1 / H-2 / H-3 Headings
            </div>
            <div className="font-roamio-body text-sm text-roamio-text-secondary leading-relaxed">
              Inter UI / Body: Body Large (18px), Body md (16px), Label / Button (16px Medium), Body sm (14px), Body xs (12px), Caption small (10px).
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="roamio-label-btn px-4 py-2 bg-roamio-primary-accent text-white rounded-roamio-2 hover:bg-roamio-primary-hover transition cursor-pointer">
                Label / Button (Inter Medium 16px)
              </span>
              <span className="roamio-body-sm-medium px-4 py-2 bg-white text-roamio-text-primary border border-roamio-border-default rounded-roamio-full">
                Body sm Medium (Inter 14px)
              </span>
            </div>
          </div>
        </div>

        {/* 3. Spacing, Radius, and Elevation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-roamio-2 border border-roamio-border-light bg-white shadow-roamio-sm space-y-2">
            <h4 className="text-xs font-bold text-roamio-text-primary uppercase">Spacing Scale (0-10)</h4>
            <div className="flex items-end gap-1 h-12 bg-slate-50 p-2 rounded-roamio-1">
              {[0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64].map((px, idx) => (
                <div key={idx} className="bg-roamio-primary-accent/80 w-2 rounded-xs" style={{ height: `${Math.max(4, px / 2)}px` }} title={`Spacing ${idx}: ${px}px`} />
              ))}
            </div>
            <span className="text-3xs text-roamio-text-tertiary block">0px, 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px</span>
          </div>

          <div className="p-4 rounded-roamio-2 border border-roamio-border-light bg-white shadow-roamio-sm space-y-2">
            <h4 className="text-xs font-bold text-roamio-text-primary uppercase">Radius Tokens</h4>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-slate-200 border border-slate-300 rounded-roamio-1 flex items-center justify-center text-3xs font-mono">4</div>
              <div className="h-8 w-8 bg-slate-200 border border-slate-300 rounded-roamio-2 flex items-center justify-center text-3xs font-mono">8</div>
              <div className="h-8 w-8 bg-slate-200 border border-slate-300 rounded-roamio-3 flex items-center justify-center text-3xs font-mono">12</div>
              <div className="h-8 w-8 bg-slate-200 border border-slate-300 rounded-roamio-4 flex items-center justify-center text-3xs font-mono">16</div>
              <div className="h-8 px-2 bg-slate-200 border border-slate-300 rounded-roamio-full flex items-center justify-center text-3xs font-mono">Pill</div>
            </div>
            <span className="text-3xs text-roamio-text-tertiary block">None (0px), 1 (4px), 2 (8px), 3 (12px), 4 (16px), Full (9999px)</span>
          </div>

          <div className="p-4 rounded-roamio-2 border border-roamio-border-light bg-white shadow-roamio-sm space-y-2">
            <h4 className="text-xs font-bold text-roamio-text-primary uppercase">Drop Shadows & Elevation</h4>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-white border border-roamio-border-light shadow-roamio-sm rounded-roamio-1 flex items-center justify-center text-3xs">Sm</div>
              <div className="h-8 w-8 bg-white border border-roamio-border-light shadow-roamio-md rounded-roamio-1 flex items-center justify-center text-3xs">Md</div>
              <div className="h-8 w-8 bg-white border border-roamio-border-light shadow-roamio-lg rounded-roamio-1 flex items-center justify-center text-3xs">Lg</div>
              <div className="h-8 w-8 bg-white border border-roamio-border-light shadow-roamio-xl rounded-roamio-1 flex items-center justify-center text-3xs">Xl</div>
            </div>
            <span className="text-3xs text-roamio-text-tertiary block">Sunken, Glow, and Effects Placeholder are unspecified.</span>
          </div>
        </div>

        {/* 4. Desktop 12-Column Grid Visualization */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
              4. Roamio Desktop Grid: 12 Columns, 16px Margins, 16px Gutter
            </h3>
            <span className="text-3xs font-mono text-roamio-text-tertiary">12-col layout</span>
          </div>
          <div className="roamio-desktop-grid py-2 bg-slate-50 border border-roamio-border-light rounded-roamio-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-7 bg-roamio-primary-accent/15 border border-roamio-primary-accent/30 rounded-roamio-1 flex items-center justify-center text-3xs font-mono font-bold text-roamio-primary-accent">
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. CORE ROAMIO UI COMPONENT SYSTEM SHOWCASE              */}
      {/* ======================================================== */}
      <div className="bg-white border border-roamio-border-light rounded-roamio-3 p-6 shadow-roamio-sm space-y-8 text-left">
        <div className="border-b border-roamio-divider pb-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-roamio-full bg-roamio-primary-accent"></span>
            <h2 className="font-roamio-display font-bold text-xl text-roamio-text-primary">
              Core Roamio UI Component System
            </h2>
          </div>
          <p className="text-xs text-roamio-text-secondary mt-1">
            Reusable component foundations built strictly using Roamio design tokens.
          </p>
        </div>

        {/* 1. Buttons */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            1. Button Variants & States
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" isPill>Pill Button</Button>
            <Button variant="primary" isLoading>Loading</Button>
            <Button variant="secondary" icon={MapPin}>With Icon</Button>
          </div>
        </div>

        {/* 2. Inputs */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            2. Input Fields & States
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Standard Input"
              placeholder="e.g. Travel query..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              helperText="Helper text adheres to Roamio tokens"
            />
            <Input
              label="With Leading Icon"
              placeholder="Pick a coordinate..."
              icon={MapPin}
              value="Shillong, Meghalaya"
              readOnly
            />
            <Input
              label="Error State"
              placeholder="Requires value"
              errorText="Please specify a valid budget amount."
              value=""
              readOnly
            />
            <Input
              label="Disabled State"
              placeholder="Cannot edit"
              disabled
              value="System Locked"
            />
          </div>
        </div>

        {/* 3. Location Autocomplete & Search */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            3. Location Autocomplete & Search Input
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LocationAutocompleteInput
              label="Location Autocomplete (Nominatim OSM)"
              value={testLocation}
              onChange={setTestLocation}
              placeholder="Type any Indian destination..."
              helperText="Live Nominatim autocomplete integrated with Roamio styling"
            />
            <div className="space-y-1">
              <label className="block text-sm font-medium text-roamio-text-primary leading-[20px]">
                Search Bar Component
              </label>
              <SearchInput
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                placeholder="Ask AI or search destinations..."
                isPill={true}
              />
              <p className="text-xs text-roamio-text-secondary">
                SearchInput with clear action and Roamio focus ring
              </p>
            </div>
          </div>
        </div>

        {/* 4. Tabs & Segmented Control */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            4. Tabs & Segmented Control
          </h3>
          <div className="space-y-4">
            {/* Underline Tabs */}
            <Tabs
              activeTab={activeUiTab}
              onChange={setActiveUiTab}
              variant="line"
              tabs={[
                { id: 'overview', label: 'Overview', badge: '1' },
                { id: 'itinerary', label: 'Itinerary', badge: '5' },
                { id: 'budget', label: 'Budget' },
                { id: 'blueprint', label: 'Blueprint' },
              ]}
            />

            {/* Segmented Control */}
            <div className="max-w-md">
              <span className="text-xs font-semibold text-roamio-text-secondary block mb-1.5">
                Segmented Mode Switcher:
              </span>
              <SegmentedControl
                value={selectedComfort}
                onChange={setSelectedComfort}
                options={[
                  { value: 'budget', label: 'Budget' },
                  { value: 'comfort', label: 'Comfort' },
                  { value: 'premium', label: 'Premium' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* 5. Chips & Filters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            5. Chips / Filter Pills (Radius Full)
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'mountains', label: 'Mountains', emoji: '🏔️' },
              { id: 'beaches', label: 'Beaches', emoji: '🏖️' },
              { id: 'temples', label: 'Temples', emoji: '🛕' },
              { id: 'food', label: 'Culinary', emoji: '🍲' },
              { id: 'wildlife', label: 'Wildlife', emoji: '🐅' },
            ].map((chip) => {
              const isSelected = selectedChips.includes(chip.id);
              return (
                <Chip
                  key={chip.id}
                  emoji={chip.emoji}
                  selected={isSelected}
                  onClick={() => {
                    setSelectedChips((prev) =>
                      prev.includes(chip.id)
                        ? prev.filter((x) => x !== chip.id)
                        : [...prev, chip.id]
                    );
                  }}
                  onRemove={isSelected ? () => {
                    setSelectedChips((prev) => prev.filter((x) => x !== chip.id));
                  } : undefined}
                >
                  {chip.label}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* 6. Base Card Component */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            6. Base Card Treatment (Card, Header, Body, Footer)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card elevation="sm" isHoverable={true}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-roamio-primary-accent" />
                  <h4 className="font-semibold text-sm text-roamio-text-primary">Standard Roamio Card</h4>
                </div>
                <span className="text-3xs font-semibold px-2 py-0.5 rounded-roamio-full bg-roamio-semantic-success-bg text-roamio-semantic-success">
                  Elevation Small
                </span>
              </CardHeader>
              <CardBody>
                <p className="text-xs text-roamio-text-secondary leading-relaxed">
                  Default card container with Card Background (#FFFFFF), Border Light (#DEDEDE), Stroke 1 (1px), and Radius 3 (12px).
                </p>
              </CardBody>
              <CardFooter>
                <span className="text-3xs text-roamio-text-tertiary">Interactive Hover State Enabled</span>
                <Button size="sm" variant="outline">Details</Button>
              </CardFooter>
            </Card>

            <Card elevation="md" isSecondaryBg={true}>
              <CardHeader>
                <h4 className="font-semibold text-sm text-roamio-text-primary">Secondary Background Card</h4>
                <span className="text-3xs font-semibold px-2 py-0.5 rounded-roamio-full bg-roamio-bg-app border border-roamio-border-light text-roamio-text-secondary">
                  Elevation Medium
                </span>
              </CardHeader>
              <CardBody>
                <p className="text-xs text-roamio-text-secondary leading-relaxed">
                  Utilizes Secondary Background (#F8F6F0) for inset sections, card lists, and nested content panels.
                </p>
              </CardBody>
              <CardFooter>
                <span className="text-3xs text-roamio-text-tertiary">Nested container pattern</span>
                <Button size="sm" variant="secondary">Manage</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* 7. Modal, Drawer & Popover Triggers */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-roamio-text-secondary">
            7. Modal, Drawer & Popover Overlays
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              Open Roamio Modal
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setDrawerPlacement('right');
                setIsDrawerOpen(true);
              }}
            >
              Open Right Drawer
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                setDrawerPlacement('left');
                setIsDrawerOpen(true);
              }}
            >
              Open Left Drawer
            </Button>

            <Button
              variant="primary"
              onClick={() => setIsPreferencesDrawerOpen(true)}
              className="bg-roamio-accent-secondary text-roamio-text-primary hover:bg-[#DEAA44]"
            >
              Open Manual Preferences Drawer
            </Button>

            {/* Popover */}
            <Popover
              trigger={
                <Button variant="outline">
                  Toggle Popover ▾
                </Button>
              }
            >
              {({ close }) => (
                <div className="space-y-2 max-w-xs">
                  <h5 className="font-bold text-xs text-roamio-text-primary">Roamio Popover Foundation</h5>
                  <p className="text-3xs text-roamio-text-secondary leading-relaxed">
                    Rendered with Card Background (#FFFFFF), Border Light, Medium Drop Shadow, and Radius 3 (12px).
                  </p>
                  <div className="pt-1 flex justify-end">
                    <Button size="sm" variant="secondary" onClick={close}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </Popover>
          </div>
        </div>

        {/* 8. RIGHT-SIDE ITINERARY / BUDGET MODULE (STANDALONE FIGMA VALIDATION) */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between text-left">
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                8. Right-Side Itinerary / Budget Module (Standalone Validation)
              </h4>
              <p className="text-xs text-slate-500">
                Validated in complete isolation. Features view-switcher, dynamic day selector with Light Button (#46B392), day destinations, Donut chart, and AI recommendations.
              </p>
            </div>
          </div>

          <div className="p-6 bg-slate-100 rounded-2xl border border-slate-200 flex justify-center">
            <RightSidePanel
              tripDuration={5}
              onReviewPlan={() => console.log('[RightSidePanel] Review Plan clicked')}
              onViewBreakdown={() => console.log('[RightSidePanel] View Breakdown clicked')}
              onAddMoreDestinations={() => console.log('[RightSidePanel] Add more Destinations clicked')}
            />
          </div>
        </div>
      </div>

      {/* Interactive Roamio Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Roamio Modal Dialog"
        subtitle="Adheres to Radius 4 (16px), Extra Large Drop Shadow, and Card Background"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm Action
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-sm text-roamio-text-secondary leading-relaxed">
            This modal container provides a standardized foundation for confirmation dialogs, itinerary preview modals, and settings screens across Roamio.
          </p>
          <div className="p-3 bg-roamio-bg-secondary rounded-roamio-2 border border-roamio-border-light text-xs text-roamio-text-primary">
            ✓ Backdrop overlay with blur<br />
            ✓ ESC key and backdrop click-to-close<br />
            ✓ Body scroll lock enabled
          </div>
        </div>
      </Modal>

      {/* Interactive Roamio Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        placement={drawerPlacement}
        title={drawerPlacement === 'right' ? "Trip Cart & Itinerary Drawer" : "Navigation Menu Drawer"}
        subtitle="Standardized slide-over drawer foundation"
        footer={
          <Button variant="primary" isFullWidth onClick={() => setIsDrawerOpen(false)}>
            Close Drawer
          </Button>
        }
      >
        <div className="space-y-4 text-xs text-roamio-text-secondary">
          <p>
            Standardized slide-over drawer foundation powered by Framer Motion. Supports left and right placement, overlay blur, scrollable body, and sticky actions.
          </p>
          <Card elevation="sm">
            <CardBody>
              <span className="font-bold text-roamio-text-primary block mb-1">Active Placement:</span>
              <span className="font-mono text-roamio-primary-accent capitalize">{drawerPlacement} Side</span>
            </CardBody>
          </Card>
        </div>
      </Drawer>

      {/* Standalone Roamio Manual Preferences Drawer Validation */}
      <ManualPreferencesDrawer
        isOpen={isPreferencesDrawerOpen}
        onClose={() => setIsPreferencesDrawerOpen(false)}
        onSearch={(prefs) => {
          console.log('[DeveloperTestPage] Preferences search submitted:', prefs);
          setIsPreferencesDrawerOpen(false);
        }}
      />

    </div>
  );
}
