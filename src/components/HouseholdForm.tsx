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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(undefined);

      if (location === undefined) {
        setError('Please select a city');
        return;
      }
      if (members.some((m) => m.name.trim() === '')) {
        setError('All members must have a name');
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
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {error !== undefined && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          ⚠ {error}
        </div>
      )}

      {/* City Search */}
      <fieldset className="space-y-2">
        <legend className="text-lg font-semibold">Location</legend>
        <div className="relative">
          <label htmlFor="city-search" className="block text-sm font-medium">
            City
          </label>
          <input
            id="city-search"
            type="text"
            value={cityQuery}
            onChange={(e) => {
              setCityQuery(e.target.value);
              searchCity(e.target.value);
            }}
            onFocus={() => {
              if (cityResults.length > 0) setShowDropdown(true);
            }}
            placeholder="Search for a city..."
            autoComplete="off"
            aria-describedby="city-help"
            className="mt-1 block w-full min-h-[44px] rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          />
          <p id="city-help" className="mt-1 text-xs text-gray-500">
            Type at least 2 characters to search
          </p>
          {showDropdown && cityResults.length > 0 && (
            <ul
              className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800"
              role="listbox"
              aria-label="City search results"
            >
              {cityResults.map((r, i) => (
                <li key={`${r.name}-${r.latitude}-${i}`}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onClick={() => selectCity(r)}
                    className="w-full min-h-[44px] px-3 py-2 text-left hover:bg-blue-50 dark:hover:bg-gray-700"
                  >
                    {r.name}
                    {r.admin1 ? `, ${r.admin1}` : ''}, {r.country}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      {/* Members */}
      <fieldset className="space-y-3">
        <legend className="text-lg font-semibold">Family Members</legend>
        {members.map((member, idx) => (
          <div key={idx} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label htmlFor={`member-name-${idx}`} className="block text-sm font-medium">
                  Name
                </label>
                <input
                  id={`member-name-${idx}`}
                  type="text"
                  value={member.name}
                  onChange={(e) => updateMember(idx, 'name', e.target.value)}
                  maxLength={50}
                  className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
              </div>
              <div>
                <label htmlFor={`member-age-${idx}`} className="block text-sm font-medium">
                  Age Group
                </label>
                <select
                  id={`member-age-${idx}`}
                  value={member.ageGroup}
                  onChange={(e) => updateMember(idx, 'ageGroup', e.target.value)}
                  className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="infant">Infant (0-1 yr)</option>
                  <option value="child">Child (1-17 yrs)</option>
                  <option value="adult">Adult (18-64 yrs)</option>
                  <option value="elderly">Elderly (65+ yrs)</option>
                </select>
              </div>
              <div>
                <label htmlFor={`member-sensitivity-${idx}`} className="block text-sm font-medium">
                  Health Sensitivity
                </label>
                <select
                  id={`member-sensitivity-${idx}`}
                  value={member.sensitivity}
                  onChange={(e) => updateMember(idx, 'sensitivity', e.target.value)}
                  className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                >
                  <option value="none">None</option>
                  <option value="asthma">Asthma / Respiratory</option>
                  <option value="heart-condition">Heart Condition</option>
                </select>
              </div>
            </div>
            {members.length > 1 && (
              <button
                type="button"
                onClick={() => removeMember(idx)}
                className="mt-2 min-h-[44px] min-w-[44px] text-sm text-red-600 hover:underline dark:text-red-400"
                aria-label={`Remove ${member.name || 'member'}`}
              >
                ✕ Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addMember}
          disabled={members.length >= 10}
          className="min-h-[44px] min-w-[44px] rounded-lg border border-dashed border-gray-300 px-4 py-2 text-sm font-medium hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 dark:border-gray-600"
        >
          + Add Member
        </button>
      </fieldset>

      {/* Home Type */}
      <fieldset className="space-y-2">
        <legend className="text-lg font-semibold">Home Details</legend>
        <div className="flex gap-4">
          <label className="flex min-h-[44px] items-center gap-2">
            <input
              type="radio"
              name="homeType"
              value="apartment"
              checked={homeType === 'apartment'}
              onChange={(e) => setHomeType(e.target.value)}
            />
            <span>Apartment</span>
          </label>
          <label className="flex min-h-[44px] items-center gap-2">
            <input
              type="radio"
              name="homeType"
              value="independent-house"
              checked={homeType === 'independent-house'}
              onChange={(e) => setHomeType(e.target.value)}
            />
            <span>Independent House</span>
          </label>
        </div>

        <div>
          <label htmlFor="windowCondition" className="block text-sm font-medium">
            Window Condition
          </label>
          <select
            id="windowCondition"
            value={windowCondition}
            onChange={(e) => setWindowCondition(e.target.value)}
            className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="tight">Well Sealed (Tight)</option>
            <option value="average">Average</option>
            <option value="leaky">Drafty / Leaky</option>
          </select>
        </div>
      </fieldset>

      {/* Purifier */}
      <fieldset className="space-y-2">
        <legend className="text-lg font-semibold">Air Purifier</legend>
        <label className="flex min-h-[44px] items-center gap-2">
          <input
            type="checkbox"
            checked={hasPurifier}
            onChange={(e) => setHasPurifier(e.target.checked)}
          />
          <span>We have an air purifier</span>
        </label>
        {hasPurifier && (
          <div className="ml-6 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="cadr" className="block text-sm font-medium">
                CADR (m³/h)
              </label>
              <input
                id="cadr"
                type="number"
                min={0}
                max={1000}
                value={cadr}
                onChange={(e) => setCadr(Number(e.target.value))}
                className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
            <div>
              <label htmlFor="roomArea" className="block text-sm font-medium">
                Room Area (m²)
              </label>
              <input
                id="roomArea"
                type="number"
                min={1}
                max={200}
                value={roomArea}
                onChange={(e) => setRoomArea(Number(e.target.value))}
                className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Commute */}
      <fieldset className="space-y-2">
        <legend className="text-lg font-semibold">Commute</legend>
        <div>
          <label htmlFor="commuteMode" className="block text-sm font-medium">
            Primary Mode
          </label>
          <select
            id="commuteMode"
            value={commuteMode}
            onChange={(e) => setCommuteMode(e.target.value)}
            className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="car">Car</option>
            <option value="metro">Metro</option>
            <option value="bus">Bus</option>
            <option value="bicycle">Bicycle</option>
            <option value="walk">Walking</option>
            <option value="none">No Commute / WFH</option>
          </select>
        </div>
        <div>
          <label htmlFor="commuteHours" className="block text-sm font-medium">
            Hours per Day
          </label>
          <input
            id="commuteHours"
            type="number"
            min={0}
            max={12}
            step={0.5}
            value={commuteHours}
            onChange={(e) => setCommuteHours(Number(e.target.value))}
            className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </fieldset>

      {/* Cooking */}
      <fieldset className="space-y-2">
        <legend className="text-lg font-semibold">Cooking Habits</legend>
        <label className="flex min-h-[44px] items-center gap-2">
          <input
            type="checkbox"
            checked={gasStove}
            onChange={(e) => setGasStove(e.target.checked)}
          />
          <span>Gas Stove</span>
        </label>
        <div>
          <label htmlFor="timesPerDay" className="block text-sm font-medium">
            Cooking Sessions per Day
          </label>
          <input
            id="timesPerDay"
            type="number"
            min={0}
            max={10}
            value={timesPerDay}
            onChange={(e) => setTimesPerDay(Number(e.target.value))}
            className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          />
        </div>
      </fieldset>

      {/* Mask */}
      <div>
        <label htmlFor="maskAvailability" className="block text-lg font-semibold">
          Mask Available
        </label>
        <select
          id="maskAvailability"
          value={maskAvailability}
          onChange={(e) => setMaskAvailability(e.target.value)}
          className="mt-1 block w-full min-h-[44px] rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
        >
          <option value="none">No Mask</option>
          <option value="surgical">Surgical Mask</option>
          <option value="n95">N95 / FFP2 Mask</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full min-h-[44px] rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
      >
        {submitting ? 'Generating Plan...' : 'Generate Plan'}
      </button>
    </form>
  );
}
