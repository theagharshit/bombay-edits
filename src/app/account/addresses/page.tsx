'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/frontend/components/ui/Input';

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
    country: 'India',
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

  useEffect(() => {
    fetchAddresses();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  const handleSetDefault = async (id: string) => {
    // Optimistic UI update
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

    // Optimistic UI update
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

  return (
    <div className="w-full min-h-screen bg-ivory text-dark-espresso font-body py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-6 md:px-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-taupe mb-8">
          <Link href="/account" className="hover:text-dark-espresso transition-colors">
            Account
          </Link>
          <span>/</span>
          <span className="text-dark-espresso font-medium">Saved Addresses</span>
        </div>

        {/* Status Notification Banner */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 text-[12px] tracking-wide uppercase font-medium flex items-center justify-between border ${
              statusMessage.type === 'success'
                ? 'bg-cream text-dark-espresso border-champagne-gold/60'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs hover:opacity-70 cursor-pointer ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-8 mb-10 border-b border-beige-line">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-taupe mb-2 block font-medium">
              Address Book
            </span>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-dark-espresso tracking-tight">
              Saved Addresses
            </h1>
            <p className="text-[13px] text-chocolate-brown mt-2 max-w-lg leading-relaxed">
              Manage your residential and atelier delivery locations for effortless couture
              checkout.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-dark-espresso text-cream px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-chocolate-brown transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer shrink-0 rounded-none"
          >
            <span>+</span>
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="p-8 border border-beige-line bg-cream/30 animate-pulse h-64"
              />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-20 bg-cream/50 border border-beige-line p-10 max-w-xl mx-auto">
            <div className="w-12 h-12 mx-auto mb-4 border border-beige-line flex items-center justify-center text-muted-taupe">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="font-display text-2xl text-dark-espresso mb-2">No Saved Addresses</p>
            <p className="text-[13px] text-chocolate-brown mb-8 max-w-md mx-auto leading-relaxed">
              You have not registered any delivery addresses yet. Add your address to expedite
              future orders.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-dark-espresso text-cream px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-chocolate-brown transition-colors cursor-pointer rounded-none"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between relative ${
                  addr.isDefault
                    ? 'border-dark-espresso bg-cream/80 shadow-xs'
                    : 'border-beige-line bg-cream/30 hover:border-dark-espresso/60 hover:bg-cream/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-beige-line/60">
                    <div>
                      <span className="font-display text-xl text-dark-espresso font-medium block">
                        {addr.name}
                      </span>
                      <span className="text-[12px] text-muted-taupe font-mono mt-0.5 block">
                        {addr.phone}
                      </span>
                    </div>
                    {addr.isDefault && (
                      <span className="bg-champagne-gold/20 text-dark-espresso text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 border border-champagne-gold/40 font-medium">
                        Primary Default
                      </span>
                    )}
                  </div>

                  <div className="text-[13px] text-chocolate-brown space-y-1.5 leading-relaxed">
                    <p className="font-medium text-dark-espresso">{addr.addressLine1}</p>
                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                    <p>
                      {addr.city}
                      {addr.state ? `, ${addr.state}` : ''}{' '}
                      {addr.postalCode && (
                        <span className="font-mono text-[12px]">{addr.postalCode}</span>
                      )}
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.16em] text-muted-taupe pt-1">
                      {addr.country}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-8 pt-4 border-t border-beige-line/60">
                  {!addr.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[11px] uppercase tracking-[0.16em] text-dark-espresso hover:text-champagne-gold transition-colors font-medium cursor-pointer"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] uppercase tracking-[0.16em] text-muted-taupe font-medium">
                      ✓ Default Shipping
                    </span>
                  )}

                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="text-[11px] uppercase tracking-[0.16em] text-red-800/80 hover:text-red-900 hover:underline transition-colors cursor-pointer"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto bg-black/65 backdrop-blur-md animate-fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-ivory border border-beige-line shadow-2xl overflow-hidden my-auto rounded-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 sm:px-14 py-8 border-b border-beige-line bg-cream/70">
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
            <form onSubmit={handleAddAddress} className="p-8 sm:p-14 space-y-8">
              {/* Section 1: Contact Details */}
              <div>
                <span className="text-[11px] uppercase tracking-[0.22em] text-chocolate-brown font-semibold block mb-4">
                  01. Recipient Information
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
                    label="Phone Number"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    required
                    placeholder="+91 98200 00000"
                  />
                </div>
              </div>

              {/* Section 2: Location & Street Details */}
              <div className="border-t border-beige-line/70 pt-8">
                <span className="text-[11px] uppercase tracking-[0.22em] text-chocolate-brown font-semibold block mb-4">
                  02. Location & Street Details
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
                      label="City"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      required
                      placeholder="e.g. Mumbai"
                    />
                    <Input
                      label="State / Province"
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      required
                      placeholder="e.g. Maharashtra"
                    />
                    <Input
                      label="PIN / Postal Code"
                      value={newAddr.postalCode}
                      onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                      required
                      placeholder="e.g. 400018"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
                    <Input
                      label="Country"
                      value={newAddr.country}
                      onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                      required
                      placeholder="e.g. India"
                    />
                  </div>
                </div>
              </div>

              {/* Default Address Option */}
              <div className="pt-2 border-t border-beige-line/70">
                <label className="flex items-center gap-3.5 text-[13px] text-dark-espresso cursor-pointer select-none py-1">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="w-4 h-4 accent-dark-espresso cursor-pointer rounded-none"
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
