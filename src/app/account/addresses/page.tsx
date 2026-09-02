'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/frontend/components/ui/Input';

interface AddressItem {
  id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<AddressItem[]>([
    {
      id: 'addr-1',
      name: 'Ananya Sharma',
      phone: '+91 98201 23456',
      addressLine1: 'B-402, Sea Green Apartments, Worli Sea Face',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400018',
      country: 'India',
      isDefault: true,
    },
    {
      id: 'addr-2',
      name: 'Ananya Sharma (Atelier)',
      phone: '+91 98201 23456',
      addressLine1: '14 Kala Ghoda, Fort Heritage District',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400001',
      country: 'India',
      isDefault: false,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
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

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.name || !newAddr.addressLine1 || !newAddr.city) return;

    const item: AddressItem = {
      id: `addr-${Date.now()}`,
      ...newAddr,
    };

    if (item.isDefault) {
      setAddresses((prev) => [item, ...prev.map((a) => ({ ...a, isDefault: false }))]);
    } else {
      setAddresses((prev) => [...prev, item]);
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
            className="inline-flex items-center justify-center gap-2 bg-dark-espresso text-cream px-6 py-3.5 text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-chocolate-brown transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer shrink-0"
          >
            <span>+</span>
            <span>Add New Address</span>
          </button>
        </div>

        {/* Addresses Grid */}
        {addresses.length === 0 ? (
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
              className="bg-dark-espresso text-cream px-8 py-3 text-[11px] uppercase tracking-[0.2em] hover:bg-chocolate-brown transition-colors cursor-pointer"
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
                      {addr.city}, {addr.state}{' '}
                      <span className="font-mono text-[12px]">{addr.postalCode}</span>
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

      {/* Modern Luxury Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-2xl bg-ivory border border-beige-line shadow-2xl overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-6 border-b border-beige-line bg-cream/40">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-muted-taupe block font-medium">
                  Atelier Dispatch
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-dark-espresso tracking-tight">
                  Add Delivery Address
                </h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 flex items-center justify-center text-dark-espresso hover:bg-cream border border-transparent hover:border-beige-line transition-colors cursor-pointer text-lg"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddAddress} className="p-6 sm:p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
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

              <Input
                label="Street Address / Residence"
                value={newAddr.addressLine1}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                required
                placeholder="Flat / Villa number, Apartment name, Street"
              />

              <Input
                label="Apartment, Suite, Landmark (Optional)"
                value={newAddr.addressLine2}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine2: e.target.value })}
                placeholder="e.g. Near Kala Ghoda Gate"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="PIN / Postal Code"
                  value={newAddr.postalCode}
                  onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                  required
                  placeholder="e.g. 400018"
                />
                <Input
                  label="Country"
                  value={newAddr.country}
                  onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                  required
                  placeholder="e.g. India"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 text-[13px] text-chocolate-brown cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="w-4 h-4 accent-dark-espresso cursor-pointer"
                  />
                  <span>Set as default shipping address for express checkout</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-beige-line">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-dark-espresso hover:bg-cream border border-beige-line transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-dark-espresso text-cream text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-chocolate-brown transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
