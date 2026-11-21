'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string | undefined;
}

interface MemberState {
  name: string;
  ageGroup: string;
  sensitivity: string;
}

interface LocationState {
  city: string;
  latitude: number;
  longitude: number;
}

function QuickPresetsBar({ onLoadPreset }: { onLoadPreset: (preset: 'delhi' | 'mumbai') => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-200/80 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-slate-900/70">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">
          ⚡
        </span>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Quick Fill Demo Data:
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onLoadPreset('delhi')}
          className="inline-flex min-h-[44px] items-center rounded-xl border border-blue-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-700 dark:bg-slate-800 dark:text-sky-300 dark:hover:bg-slate-700"
        >
          Delhi Family (4 members, infant, asthma)
        </button>
        <button
          type="button"
          onClick={() => onLoadPreset('mumbai')}
          className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Mumbai Couple (2 seniors, air purifier)
        </button>
      </div>
    </div>
  );
}

function MemberRow({
  member,
  idx,
  onUpdate,
  onRemove,
  canRemove,
}: {
  member: MemberState;
  idx: number;
  onUpdate: (index: number, field: keyof MemberState, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/50">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label
            htmlFor={`member-name-${idx}`}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Name
          </label>
          <input
            id={`member-name-${idx}`}
            type="text"
            value={member.name}
            placeholder="e.g. Baby Sharma"
            onChange={(e) => onUpdate(idx, 'name', e.target.value)}
            maxLength={50}
            className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label
            htmlFor={`member-age-${idx}`}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Age Group
          </label>
          <select
            id={`member-age-${idx}`}
            value={member.ageGroup}
            onChange={(e) => onUpdate(idx, 'ageGroup', e.target.value)}
            className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="infant">👶 Infant (0-1 yr)</option>
            <option value="child">🧒 Child (1-17 yrs)</option>
            <option value="adult">👤 Adult (18-64 yrs)</option>
            <option value="elderly">👴 Elderly (65+ yrs)</option>
          </select>
        </div>
        <div>
          <label
            htmlFor={`member-sensitivity-${idx}`}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Health Sensitivity
          </label>
          <select
            id={`member-sensitivity-${idx}`}
            value={member.sensitivity}
            onChange={(e) => onUpdate(idx, 'sensitivity', e.target.value)}
            className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="none">None</option>
            <option value="asthma">⚠️ Asthma / Respiratory</option>
            <option value="heart-condition">⚠️ Heart Condition</option>
          </select>
        </div>
      </div>
      {canRemove && (
        <div className="mt-2.5 flex justify-end">
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="inline-flex min-h-[44px] items-center text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline dark:text-rose-400"
            aria-label={`Remove ${member.name || 'member'}`}
          >
            ✕ Remove Member
          </button>
        </div>
      )}
    </div>
  );
}

function CitySearchFieldset({
  cityQuery,
  onCityQueryChange,
  showDropdown,
  setShowDropdown,
  cityResults,
  location,
  onSelectCity,
}: {
  cityQuery: string;
  onCityQueryChange: (val: string) => void;
  showDropdown: boolean;
  setShowDropdown: (val: boolean) => void;
  cityResults: GeoResult[];
  location: LocationState | undefined;
  onSelectCity: (r: GeoResult) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/60">
      <legend className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-xs text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          📍
        </span>
        <span>1. Household Location</span>
      </legend>
      <div className="relative mt-3">
        <label
          htmlFor="city-search"
          className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
        >
          Search City
        </label>
        <input
          id="city-search"
          type="text"
          value={cityQuery}
          onChange={(e) => onCityQueryChange(e.target.value)}
          onFocus={() => {
            if (cityResults.length > 0) setShowDropdown(true);
          }}
          placeholder="Type city name (e.g. New Delhi, Mumbai, Bengaluru)..."
          autoComplete="off"
          aria-describedby="city-help"
          className="mt-1.5 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
        />
        <p id="city-help" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Type at least 2 characters to search Open-Meteo geocoding.
        </p>

        {location && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span>✓ Selected: {location.city}</span>
            <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
              ({location.latitude.toFixed(2)}, {location.longitude.toFixed(2)})
            </span>
          </div>
        )}

        {showDropdown && cityResults.length > 0 && (
          <ul
            className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
            role="listbox"
            aria-label="City search results"
          >
            {cityResults.map((r, i) => (
              <li key={`${r.name}-${r.latitude}-${i}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => onSelectCity(r)}
                  className="w-full min-h-[44px] px-4 py-2.5 text-left text-sm text-slate-800 hover:bg-blue-50 focus:bg-blue-50 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:bg-slate-700"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{r.name}</span>
                  {r.admin1 ? `, ${r.admin1}` : ''}, {r.country}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </fieldset>
  );
}

function HomeStructureFieldset({
  homeType,
  setHomeType,
  windowCondition,
  setWindowCondition,
}: {
  homeType: string;
  setHomeType: (val: string) => void;
  windowCondition: string;
  setWindowCondition: (val: string) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/60">
      <legend className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-xs text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          🏠
        </span>
        <span>3. Home Structure &amp; Windows</span>
      </legend>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Home Type
          </span>
          <div className="mt-2 flex gap-3">
            <label className="flex min-h-[44px] flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <input
                type="radio"
                name="homeType"
                value="apartment"
                checked={homeType === 'apartment'}
                onChange={(e) => setHomeType(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span>Apartment</span>
            </label>
            <label className="flex min-h-[44px] flex-1 cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-800 hover:border-blue-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <input
                type="radio"
                name="homeType"
                value="independent-house"
                checked={homeType === 'independent-house'}
                onChange={(e) => setHomeType(e.target.value)}
                className="h-4 w-4 text-blue-600"
              />
              <span>Independent House</span>
            </label>
          </div>
        </div>

        <div>
          <label
            htmlFor="windowCondition"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Window Condition
          </label>
          <select
            id="windowCondition"
            value={windowCondition}
            onChange={(e) => setWindowCondition(e.target.value)}
            className="mt-2 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="tight">Well Sealed (Tight - low infiltration)</option>
            <option value="average">Average Seal</option>
            <option value="leaky">Drafty / Leaky (High infiltration)</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
}

function PurifierFieldset({
  hasPurifier,
  setHasPurifier,
  cadr,
  setCadr,
  roomArea,
  setRoomArea,
}: {
  hasPurifier: boolean;
  setHasPurifier: (val: boolean) => void;
  cadr: number;
  setCadr: (val: number) => void;
  roomArea: number;
  setRoomArea: (val: number) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/60">
      <legend className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-xs text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          💨
        </span>
        <span>4. Air Purifier</span>
      </legend>

      <div className="mt-3">
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={hasPurifier}
            onChange={(e) => setHasPurifier(e.target.checked)}
            className="h-5 w-5 rounded-md text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            We have an active air purifier in the main living space
          </span>
        </label>

        {hasPurifier && (
          <div className="mt-3 grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-2 dark:border-slate-800 dark:bg-slate-900/40">
            <div>
              <label
                htmlFor="cadr"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                CADR Rating (Clean Air Delivery Rate, m³/h)
              </label>
              <input
                id="cadr"
                type="number"
                min={0}
                max={1000}
                value={cadr}
                onChange={(e) => setCadr(Number(e.target.value))}
                className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label
                htmlFor="roomArea"
                className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Room Area (m²)
              </label>
              <input
                id="roomArea"
                type="number"
                min={1}
                max={200}
                value={roomArea}
                onChange={(e) => setRoomArea(Number(e.target.value))}
                className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    </fieldset>
  );
}

function CommuteAndCookingFieldset({
  commuteMode,
  setCommuteMode,
  commuteHours,
  setCommuteHours,
  gasStove,
  setGasStove,
  timesPerDay,
  setTimesPerDay,
}: {
  commuteMode: string;
  setCommuteMode: (val: string) => void;
  commuteHours: number;
  setCommuteHours: (val: number) => void;
  gasStove: boolean;
  setGasStove: (val: boolean) => void;
  timesPerDay: number;
  setTimesPerDay: (val: number) => void;
}) {
  return (
    <fieldset className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/60">
      <legend className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-xs text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          🚗
        </span>
        <span>5. Daily Commute &amp; Cooking Habits</span>
      </legend>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="commuteMode"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Primary Commute Mode
          </label>
          <select
            id="commuteMode"
            value={commuteMode}
            onChange={(e) => setCommuteMode(e.target.value)}
            className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="car">🚗 Car (Closed / AC)</option>
            <option value="metro">🚇 Metro</option>
            <option value="bus">🚌 Bus</option>
            <option value="bicycle">🚲 Bicycle</option>
            <option value="walk">🚶 Walking</option>
            <option value="none">🏠 Work from Home / No Commute</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="commuteHours"
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Commute Hours per Day
          </label>
          <input
            id="commuteHours"
            type="number"
            min={0}
            max={12}
            step={0.5}
            value={commuteHours}
            onChange={(e) => setCommuteHours(Number(e.target.value))}
            className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={gasStove}
              onChange={(e) => setGasStove(e.target.checked)}
              className="h-5 w-5 rounded-md text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              🍳 Gas stove in active use (creates internal combustion particles)
            </span>
          </label>
          <div className="mt-2 max-w-xs">
            <label
              htmlFor="timesPerDay"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              Cooking Sessions per Day
            </label>
            <input
              id="timesPerDay"
              type="number"
              min={0}
              max={10}
              value={timesPerDay}
              onChange={(e) => setTimesPerDay(Number(e.target.value))}
              className="mt-1 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>
      </div>
    </fieldset>
  );
}

export default function HouseholdForm() {
  const router = useRouter();
  const [location, setLocation] = useState<LocationState | undefined>(undefined);
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<GeoResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [members, setMembers] = useState<MemberState[]>([
    { name: '', ageGroup: 'adult', sensitivity: 'none' },
  ]);
  const [homeType, setHomeType] = useState('apartment');
  const [windowCondition, setWindowCondition] = useState('average');
  const [hasPurifier, setHasPurifier] = useState(false);
  const [cadr, setCadr] = useState(150);
  const [roomArea, setRoomArea] = useState(20);
  const [commuteMode, setCommuteMode] = useState('car');
  const [commuteHours, setCommuteHours] = useState(1);
  const [gasStove, setGasStove] = useState(true);
  const [timesPerDay, setTimesPerDay] = useState(2);
  const [maskAvailability, setMaskAvailability] = useState('n95');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const searchCity = useCallback((query: string) => {
    if (debounceRef.current !== undefined) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setCityResults([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?name=${encodeURIComponent(query)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { results: GeoResult[] };
        setCityResults(data.results);
        setShowDropdown(true);
      } catch {
        // Silently fail geocoding
      }
    }, 300);
  }, []);

  const handleCityQueryChange = useCallback(
    (val: string) => {
      setCityQuery(val);
      searchCity(val);
    },
    [searchCity],
  );

  const selectCity = useCallback((result: GeoResult) => {
    setLocation({ city: result.name, latitude: result.latitude, longitude: result.longitude });
    setCityQuery(`${result.name}, ${result.country}`);
    setShowDropdown(false);
    setCityResults([]);
  }, []);

  const updateMember = useCallback((index: number, field: keyof MemberState, value: string) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  }, []);

  const addMember = useCallback(() => {
    setMembers((prev) =>
      prev.length < 10 ? [...prev, { name: '', ageGroup: 'adult', sensitivity: 'none' }] : prev,
    );
  }, []);

  const removeMember = useCallback((index: number) => {
    setMembers((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }, []);

  const loadPreset = useCallback((preset: 'delhi' | 'mumbai') => {
    if (preset === 'delhi') {
      setLocation({ city: 'New Delhi', latitude: 28.6139, longitude: 77.209 });
      setCityQuery('New Delhi, India');
      setMembers([
        { name: 'Baby Sharma', ageGroup: 'infant', sensitivity: 'none' },
        { name: 'Riya', ageGroup: 'child', sensitivity: 'asthma' },
        { name: 'Amit', ageGroup: 'adult', sensitivity: 'none' },
        { name: 'Priya', ageGroup: 'adult', sensitivity: 'none' },
      ]);
      setHomeType('apartment');
      setWindowCondition('leaky');
      setHasPurifier(true);
      setCadr(250);
      setRoomArea(30);
      setCommuteMode('car');
      setCommuteHours(1.5);
      setGasStove(true);
      setTimesPerDay(3);
      setMaskAvailability('n95');
    } else {
      setLocation({ city: 'Mumbai', latitude: 19.076, longitude: 72.8777 });
      setCityQuery('Mumbai, India');
      setMembers([
        { name: 'Rajesh Gupta', ageGroup: 'elderly', sensitivity: 'heart-condition' },
        { name: 'Sunita Gupta', ageGroup: 'elderly', sensitivity: 'none' },
      ]);
      setHomeType('apartment');
      setWindowCondition('tight');
      setHasPurifier(true);
      setCadr(200);
      setRoomArea(25);
      setCommuteMode('none');
      setCommuteHours(0);
      setGasStove(false);
      setTimesPerDay(2);
      setMaskAvailability('n95');
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(undefined);

      if (location === undefined) {
        setError('Please select a city from the location search');
        return;
      }
      if (members.some((m) => m.name.trim() === '')) {
        setError('All family members must have a name');
        return;
      }

      setSubmitting(true);
      try {
        const body = {
          location,
          members: members.map((m) => ({
            name: m.name.trim(),
            ageGroup: m.ageGroup,
            sensitivity: m.sensitivity,
          })),
          homeType,
          windowCondition,
          purifier: hasPurifier ? { cadrM3PerHour: cadr, roomAreaM2: roomArea } : null,
          commuteMode,
          commuteHours,
          cookingHabits: { gasStove, timesPerDay },
          maskAvailability,
        };

        const res = await fetch('/api/household', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = (await res.json()) as { error?: { message?: string } };
          throw new Error(errData.error?.message ?? 'Failed to save household');
        }

        const saved = (await res.json()) as { id: string };
        router.push(`/plan?id=${saved.id}`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSubmitting(false);
      }
    },
    [
      location,
      members,
      homeType,
      windowCondition,
      hasPurifier,
      cadr,
      roomArea,
      commuteMode,
      commuteHours,
      gasStove,
      timesPerDay,
      maskAvailability,
      router,
    ],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <QuickPresetsBar onLoadPreset={loadPreset} />

      {error !== undefined && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-300 bg-rose-50/90 p-4 text-sm font-medium text-rose-800 shadow-xs dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
        >
          ⚠ {error}
        </div>
      )}

      <CitySearchFieldset
        cityQuery={cityQuery}
        onCityQueryChange={handleCityQueryChange}
        showDropdown={showDropdown}
        setShowDropdown={setShowDropdown}
        cityResults={cityResults}
        location={location}
        onSelectCity={selectCity}
      />

      <fieldset className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/60">
        <legend className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-xs text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            👨‍👩‍👧‍👦
          </span>
          <span>2. Family Members &amp; Health Vulnerabilities</span>
        </legend>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Infants, seniors, and individuals with respiratory issues receive specialized exposure
          thresholds.
        </p>

        <div className="mt-4 space-y-3">
          {members.map((member, idx) => (
            <MemberRow
              key={idx}
              member={member}
              idx={idx}
              onUpdate={updateMember}
              onRemove={removeMember}
              canRemove={members.length > 1}
            />
          ))}

          <button
            type="button"
            onClick={addMember}
            disabled={members.length >= 10}
            className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:border-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
          >
            + Add Member
          </button>
        </div>
      </fieldset>

      <HomeStructureFieldset
        homeType={homeType}
        setHomeType={setHomeType}
        windowCondition={windowCondition}
        setWindowCondition={setWindowCondition}
      />

      <PurifierFieldset
        hasPurifier={hasPurifier}
        setHasPurifier={setHasPurifier}
        cadr={cadr}
        setCadr={setCadr}
        roomArea={roomArea}
        setRoomArea={setRoomArea}
      />

      <CommuteAndCookingFieldset
        commuteMode={commuteMode}
        setCommuteMode={setCommuteMode}
        commuteHours={commuteHours}
        setCommuteHours={setCommuteHours}
        gasStove={gasStove}
        setGasStove={setGasStove}
        timesPerDay={timesPerDay}
        setTimesPerDay={setTimesPerDay}
      />

      <div className="rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/60">
        <label
          htmlFor="maskAvailability"
          className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-sky-100 text-xs text-sky-700 dark:bg-sky-950 dark:text-sky-300">
            😷
          </span>
          <span>6. Mask Type Available at Home</span>
        </label>
        <select
          id="maskAvailability"
          value={maskAvailability}
          onChange={(e) => setMaskAvailability(e.target.value)}
          className="mt-3 block min-h-[44px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="none">No Mask Available (0% protection)</option>
          <option value="surgical">Surgical / Cloth Mask (~50% particle filtration)</option>
          <option value="n95">N95 / FFP2 Mask (~95% PM2.5 filtration)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-bold text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:from-blue-500 dark:to-indigo-500"
      >
        {submitting ? (
          <>
            <span
              className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
              aria-hidden="true"
            />
            <span>Generating Plan...</span>
          </>
        ) : (
          <>
            <span>Generate Plan</span>
            <span aria-hidden="true">→</span>
          </>
        )}
      </button>
    </form>
  );
}
