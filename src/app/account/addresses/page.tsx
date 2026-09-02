'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/frontend/components/ui/Input';
import { REGIONS, SupportedCountry } from '@/frontend/utils/geoRegions';

interface AddressItem {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [newAddr, setNewAddr] = useState({
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India' as SupportedCountry,
    isDefault: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/addresses');
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setAddresses(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const detectLocationAndSetCountry = async () => {
    setDetectingLocation(true);

    const fallbackToIndiaOrTz = () => {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz && (tz.includes('Kathmandu') || tz.includes('Nepal'))) {
          setNewAddr((prev) => ({
            ...prev,
            country: 'Nepal',
            phone: prev.phone || '+977 ',
          }));
          return;
        }
      } catch {
        // ignore
      }
      setNewAddr((prev) => ({
        ...prev,
        country: 'India',
        phone: prev.phone || '+91 ',
      }));
    };

    if (!('geolocation' in navigator)) {
      fallbackToIndiaOrTz();
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=5`
          );
          if (res.ok) {
            const data = await res.json();
            const countryCode = data.address?.country_code?.toUpperCase();
            if (countryCode === 'NP' || data.address?.country?.toLowerCase() === 'nepal') {
              setNewAddr((prev) => ({
                ...prev,
                country: 'Nepal',
                phone: prev.phone.startsWith('+91') ? '+977 ' : prev.phone || '+977 ',
              }));
              setDetectingLocation(false);
              return;
            }
          }
        } catch {
          // fallback
        }
        fallbackToIndiaOrTz();
        setDetectingLocation(false);
      },
      (_err) => {
        fallbackToIndiaOrTz();
        setDetectingLocation(false);
      },
      { timeout: 6000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openModal = () => {
    setShowAddModal(true);
    detectLocationAndSetCountry();
  };

  const handleCountryChange = (country: SupportedCountry) => {
    setNewAddr((prev) => ({
      ...prev,
      country,
      state: '',
      phone:
        country === 'Nepal' ? prev.phone.replace('+91', '+977') : prev.phone.replace('+977', '+91'),
    }));
  };

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleSetDefault = async (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );

    try {
      const res = await fetch(`/api/addresses/${id}/default`, {
        method: 'PATCH',
      });
      if (res.ok) {
        showNotification('Primary delivery address updated');
      } else {
        fetchAddresses();
      }
    } catch {
      fetchAddresses();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;

    setAddresses((prev) => prev.filter((a) => a.id !== id));

    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showNotification('Address removed successfully');
      } else {
        fetchAddresses();
      }
    } catch {
      fetchAddresses();
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.addressLine1 || !newAddr.city || !newAddr.phone) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAddr),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        if (json.data.isDefault) {
          setAddresses((prev) => [json.data, ...prev.map((a) => ({ ...a, isDefault: false }))]);
        } else {
          setAddresses((prev) => [...prev, json.data]);
        }

        setShowAddModal(false);
        setNewAddr({
          name: '',
          phone: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India',
          isDefault: false,
        });
        showNotification('New address added to your address book');
      } else {
        showNotification(json.error || 'Failed to add address', 'error');
      }
    } catch {
      showNotification('Network error saving address', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const currentCountryConfig = REGIONS[newAddr.country] || REGIONS.India;

  return (
    <div className="w-full min-h-screen bg-ivory text-dark-espresso font-body pt-8 pb-20 md:pt-14 md:pb-28">
      <div className="container-site max-w-6xl mx-auto px-6 sm:px-10 lg:px-12">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2.5 text-[11px] uppercase tracking-[0.2em] text-muted-taupe">
            <Link href="/" className="hover:text-dark-espresso transition-colors">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/account" className="hover:text-dark-espresso transition-colors">
              Account
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-dark-espresso font-medium">Saved Addresses</span>
          </div>
        </nav>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            className={`mb-8 p-5 text-[12px] tracking-wide uppercase font-medium flex items-center justify-between border shadow-2xs ${
              statusMessage.type === 'success'
                ? 'bg-cream text-dark-espresso border-champagne-gold/60'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs hover:opacity-70 cursor-pointer ml-4 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 pb-10 mb-12 md:mb-16 border-b border-beige-line">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase tracking-[0.28em] text-champagne-gold mb-2.5 block font-semibold">
              The Address Book
            </span>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-dark-espresso tracking-tight">
              Saved Addresses
            </h1>
            <p className="text-[13px] sm:text-[14px] text-chocolate-brown mt-3 leading-relaxed">
              Manage your residences, suites, and atelier destinations across India and Nepal for
              effortless couture checkout.
            </p>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center gap-2.5 bg-dark-espresso text-cream px-8 py-4 text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-chocolate-brown transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer shrink-0 rounded-none self-start sm:self-auto"
          >
            <span className="text-base leading-none">+</span>
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="p-10 border border-beige-line bg-cream/30 animate-pulse h-72"
              />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-24 bg-cream/40 border border-beige-line p-10 sm:p-16 max-w-2xl mx-auto my-6">
            <div className="w-14 h-14 mx-auto mb-6 border border-beige-line flex items-center justify-center text-muted-taupe bg-ivory">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="font-display text-2xl sm:text-3xl text-dark-espresso mb-3">
              No Saved Addresses
            </p>
            <p className="text-[13px] text-chocolate-brown mb-10 max-w-md mx-auto leading-relaxed">
              You have not registered any delivery addresses yet. Add your atelier or residential
              address to expedite future dispatches.
            </p>
            <button
              onClick={openModal}
              className="bg-dark-espresso text-cream px-10 py-4 text-[11px] uppercase tracking-[0.22em] hover:bg-chocolate-brown transition-colors cursor-pointer rounded-none"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-8 sm:p-10 border transition-all duration-300 flex flex-col justify-between relative ${
                  addr.isDefault
                    ? 'border-dark-espresso bg-cream/90 shadow-sm ring-1 ring-dark-espresso/10'
                    : 'border-beige-line bg-cream/30 hover:border-dark-espresso/60 hover:bg-cream/55'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-6 pb-5 border-b border-beige-line/70">
                    <div>
                      <span className="font-display text-2xl text-dark-espresso font-medium block">
                        {addr.name}
                      </span>
                      <span className="text-[12px] text-muted-taupe font-mono mt-1 block">
                        {addr.phone}
                      </span>
                    </div>
                    {addr.isDefault && (
                      <span className="bg-champagne-gold/20 text-dark-espresso text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-champagne-gold/50 font-semibold shrink-0">
                        Primary Default
                      </span>
                    )}
                  </div>

                  <div className="text-[13px] sm:text-[14px] text-chocolate-brown space-y-2 leading-relaxed">
                    <p className="font-medium text-dark-espresso text-[14px]">
                      {addr.addressLine1}
                    </p>
                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                    <p>
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ''}{' '}
                      {addr.postalCode && (
                        <span className="font-mono text-[12px] font-semibold text-dark-espresso">
                          {addr.postalCode}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-champagne-gold font-semibold pt-2">
                      {addr.country === 'India' ? '🇮🇳 India' : '🇳🇵 Nepal'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-10 pt-5 border-t border-beige-line/70">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] uppercase tracking-[0.18em] text-dark-espresso hover:text-champagne-gold transition-colors font-semibold cursor-pointer py-1"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] uppercase tracking-[0.18em] text-muted-taupe font-medium flex items-center gap-1.5">
                      <span className="text-champagne-gold font-bold">✓</span> Default Shipping
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-[11px] uppercase tracking-[0.18em] text-red-800/80 hover:text-red-950 hover:underline transition-colors cursor-pointer py-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modern Luxury Add Address Modal - Grand Architectural Pavilion */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto bg-black/70 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-ivory border border-beige-line shadow-2xl overflow-hidden my-auto rounded-none max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 sm:px-14 py-7 sm:py-9 border-b border-beige-line bg-cream/70 shrink-0">
              <div>
                <span className="text-[11px] uppercase tracking-[0.28em] text-champagne-gold block font-semibold">
                  Atelier Address Book
                </span>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-dark-espresso tracking-tight mt-1">
                  Add Delivery Address
                </h2>
                <p className="text-[13px] text-chocolate-brown mt-1.5 leading-relaxed">
                  Enter your residential, suite, or atelier destination for bespoke couture
                  dispatches.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-12 h-12 flex items-center justify-center text-dark-espresso hover:bg-cream border border-beige-line/70 hover:border-dark-espresso transition-colors cursor-pointer text-2xl rounded-none shrink-0"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAddress} className="p-8 sm:p-14 space-y-8 overflow-y-auto">
              {/* Section 1: Region Selection (India or Nepal only) */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] uppercase tracking-[0.22em] text-chocolate-brown font-semibold block">
                    01. Country / Destination Region
                  </span>
                  {detectingLocation && (
                    <span className="text-[11px] text-champagne-gold animate-pulse">
                      Detecting location...
                    </span>
                  )}
                </div>

                {/* Strict 2-Option Luxury Selector */}
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {(['India', 'Nepal'] as SupportedCountry[]).map((countryName) => {
                    const isSelected = newAddr.country === countryName;
                    return (
                      <button
                        key={countryName}
                        type="button"
                        onClick={() => handleCountryChange(countryName)}
                        className={`py-4 px-6 border text-[12px] uppercase tracking-[0.18em] font-medium transition-all duration-200 cursor-pointer text-center rounded-none flex items-center justify-center gap-2.5 ${
                          isSelected
                            ? 'bg-dark-espresso text-cream border-dark-espresso shadow-xs'
                            : 'bg-cream/40 text-dark-espresso border-beige-line hover:border-dark-espresso/60 hover:bg-cream/70'
                        }`}
                      >
                        <span className="text-base">{countryName === 'India' ? '🇮🇳' : '🇳🇵'}</span>
                        <span>{countryName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section 2: Contact Details */}
              <div className="border-t border-beige-line/70 pt-8">
                <span className="text-[11px] uppercase tracking-[0.22em] text-chocolate-brown font-semibold block mb-5">
                  02. Recipient Information
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <Input
                    label="Full Name / Attention"
                    value={newAddr.name}
                    onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                    required
                    placeholder="e.g. Madame Ananya Sharma"
                  />
                  <Input
                    label={`Phone Number (${currentCountryConfig.phoneCode})`}
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    required
                    placeholder={`${currentCountryConfig.phoneCode} 98200 00000`}
                  />
                </div>
              </div>

              {/* Section 3: Location & Street Details */}
              <div className="border-t border-beige-line/70 pt-8">
                <span className="text-[11px] uppercase tracking-[0.22em] text-chocolate-brown font-semibold block mb-5">
                  03. Location & Street Details
                </span>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    <Input
                      label="Street Address / Residence"
                      value={newAddr.addressLine1}
                      onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                      required
                      placeholder="Flat / Villa number, Building name, Street"
                    />
                    <Input
                      label="Landmark / Suite / Locality (Optional)"
                      value={newAddr.addressLine2}
                      onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                      placeholder="e.g. Near Kala Ghoda Gate, Worli Sea Face"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                    <Input
                      label="City / District"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      required
                      placeholder={newAddr.country === 'Nepal' ? 'e.g. Kathmandu' : 'e.g. Mumbai'}
                    />

                    {/* Dynamic State / Province Dropdown based on Country */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-[0.16em] text-chocolate-brown mb-2 font-medium">
                        State / Province ({newAddr.country})
                      </label>
                      <select
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        required
                        className="w-full bg-cream border border-beige-line px-4.5 py-3.5 text-[13px] text-dark-espresso focus:outline-none focus:border-dark-espresso transition-colors rounded-none cursor-pointer shadow-2xs"
                      >
                        <option value="">Select State / Province</option>
                        {currentCountryConfig.states.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label={currentCountryConfig.postalLabel}
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      required
                      placeholder={currentCountryConfig.postalPlaceholder}
                    />
                  </div>
                </div>
              </div>

              {/* Default Address Option */}
              <div className="pt-2 border-t border-beige-line/70">
                <label className="flex items-center gap-3.5 text-[13px] text-dark-espresso cursor-pointer select-none py-1.5">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="w-4.5 h-4.5 accent-dark-espresso cursor-pointer rounded-none"
                  />
                  <span className="font-medium">
                    Set as default delivery address for future orders & expedited checkout
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-8 border-t border-beige-line">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-full sm:w-auto px-10 py-4 text-[11px] uppercase tracking-[0.22em] text-dark-espresso hover:bg-cream border border-beige-line transition-colors cursor-pointer rounded-none font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-12 py-4 bg-dark-espresso text-cream text-[11px] uppercase tracking-[0.22em] font-medium hover:bg-chocolate-brown disabled:opacity-50 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer rounded-none"
                >
                  {submitting ? 'Saving Address...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
