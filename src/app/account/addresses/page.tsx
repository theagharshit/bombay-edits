'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/frontend/components/ui/Button';
import { Badge } from '@/frontend/components/ui/Badge';
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
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false,
    });
  };

  return (
    <div className="container-site section-padding max-w-4xl mx-auto font-body">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-taupe mb-8">
        <Link href="/account" className="hover:text-dark-espresso transition-colors">
          Account
        </Link>
        <span>/</span>
        <span className="text-dark-espresso">Saved Addresses</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-beige-line pb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-dark-espresso mb-1">
            Saved Addresses
          </h1>
          <p className="text-[13px] text-chocolate-brown">
            Manage your personal delivery locations for swift checkout.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
          + Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-cream border border-beige-line p-8">
          <p className="font-display text-xl text-dark-espresso mb-2">No Saved Addresses</p>
          <p className="text-[13px] text-chocolate-brown mb-6">
            You have not stored any shipping addresses yet.
          </p>
          <Button variant="primary" size="sm" onClick={() => setShowAddModal(true)}>
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-6 border transition-colors flex flex-col justify-between ${
                addr.isDefault
                  ? 'border-dark-espresso bg-cream/70'
                  : 'border-beige-line bg-cream/30 hover:border-dark-espresso/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display text-lg text-dark-espresso font-medium">
                    {addr.name}
                  </span>
                  {addr.isDefault && <Badge variant="gold">Default</Badge>}
                </div>

                <div className="text-[13px] text-chocolate-brown space-y-1 leading-relaxed">
                  <p>{addr.addressLine1}</p>
                  {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                  <p className="uppercase tracking-wide text-[11px] text-muted-taupe">
                    {addr.country}
                  </p>
                  <p className="text-[12px] pt-1 text-dark-espresso">{addr.phone}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-beige-line/60">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-[11px] uppercase tracking-[0.14em] text-dark-espresso hover:text-champagne-gold transition-colors cursor-pointer"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] uppercase tracking-[0.14em] text-muted-taupe">
                    Primary Address
                  </span>
                )}

                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-[11px] uppercase tracking-[0.14em] text-red-700 hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-ivory border border-beige-line p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-beige-line pb-4 mb-6">
              <h2 className="font-display text-2xl text-dark-espresso">Add Delivery Address</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-dark-espresso hover:text-chocolate-brown text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4">
              <Input
                label="Full Name"
                value={newAddr.name}
                onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })}
                required
                placeholder="Recipient name"
              />
              <Input
                label="Phone Number"
                value={newAddr.phone}
                onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                required
                placeholder="+91 XXXXX XXXXX"
              />
              <Input
                label="Street Address"
                value={newAddr.addressLine1}
                onChange={(e) => setNewAddr({ ...newAddr, addressLine1: e.target.value })}
                required
                placeholder="Apartment, suite, street name"
              />
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Postal / PIN Code"
                  value={newAddr.postalCode}
                  onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                  required
                  placeholder="e.g. 400001"
                />
                <Input
                  label="Country"
                  value={newAddr.country}
                  onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })}
                  required
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-[12px] text-chocolate-brown cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                    className="accent-dark-espresso"
                  />
                  Set as default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-beige-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Address
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
