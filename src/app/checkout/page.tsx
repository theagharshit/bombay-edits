'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { generatePlaceholderImage } from '@/lib/utils';
import { calculateShipping } from '@/data/shipping';
import { CheckoutStep, ShippingZone } from '@/types/cart';
import { OrderService } from '@/frontend/services/orderService';
import { AddressService } from '@/frontend/services/addressService';
import { AddressRecord } from '@/backend/models/addressModel';
import { useAuth } from '@/frontend/context/AuthContext';
import { CreateOrderDTO } from '@/backend/types/api';
import { Plus, Check, User, ChevronRight, Edit3 } from 'lucide-react';

const steps: { key: CheckoutStep; label: string }[] = [
  { key: 'contact', label: 'Contact' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'payment', label: 'Payment' },
  { key: 'review', label: 'Review' },
];

const paymentMethods = [
  { id: 'upi', label: 'UPI', region: 'india' },
  { id: 'card', label: 'Credit / debit card', region: 'international' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { format } = useCurrency();
  const { customer, isAuthenticated, isLoading: _authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Saved addresses state for logged-in users
  const [savedAddresses, setSavedAddresses] = useState<AddressRecord[]>([]);
  const [_loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingNewAddress, setSavingNewAddress] = useState(false);
  const [_addressSaveError, setAddressSaveError] = useState<string | null>(null);
  const [isEditingContact, setIsEditingContact] = useState(false);

  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    shippingZone: 'mumbai' as ShippingZone,
    shippingMethod: 'standard',
    paymentMethod: 'upi',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-populate customer info if logged in
  useEffect(() => {
    if (isAuthenticated && customer) {
      setForm((prev) => ({
        ...prev,
        email: customer.email || prev.email,
        firstName: customer.firstName || prev.firstName,
        lastName: customer.lastName || prev.lastName,
        phone: customer.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, customer]);

  // Load saved addresses for logged-in member
  const loadSavedAddresses = useCallback(async () => {
    if (!isAuthenticated || !customer) return;
    try {
      setLoadingAddresses(true);
      const list = await AddressService.getAddresses(customer.email);
      setSavedAddresses(list || []);
      if (list && list.length > 0) {
        // Pick default address or first address
        const defaultAddr = list.find((a) => a.isDefault) || list[0];
        setSelectedAddressId(defaultAddr.id);
        setForm((prev) => ({
          ...prev,
          address:
            defaultAddr.addressLine1 +
            (defaultAddr.addressLine2 ? `, ${defaultAddr.addressLine2}` : ''),
          city: defaultAddr.city,
          state: defaultAddr.state || '',
          postalCode: defaultAddr.postalCode || '',
          country: defaultAddr.country || 'India',
          phone:
            defaultAddr.phone && defaultAddr.phone !== 'N/A' ? defaultAddr.phone : prev.phone || '',
        }));
        setShowNewAddressForm(false);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (err) {
      console.error('Failed to load saved addresses:', err);
      setShowNewAddressForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  }, [isAuthenticated, customer]);

  useEffect(() => {
    if (isAuthenticated && customer) {
      loadSavedAddresses();
    }
  }, [isAuthenticated, customer, loadSavedAddresses]);

  // Select an existing address card
  const handleSelectAddress = (addr: AddressRecord) => {
    setSelectedAddressId(addr.id);
    setShowNewAddressForm(false);
    setForm((prev) => ({
      ...prev,
      address: addr.addressLine1 + (addr.addressLine2 ? `, ${addr.addressLine2}` : ''),
      city: addr.city,
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      phone: addr.phone && addr.phone !== 'N/A' ? addr.phone : prev.phone || '',
    }));
    setErrors((prev) => ({
      ...prev,
      address: '',
      city: '',
      postalCode: '',
    }));
  };

  // Add new address in-place during checkout
  const handleSaveNewAddress = async () => {
    const addressErr = validateField('address', form.address);
    const cityErr = validateField('city', form.city);
    const postalCodeErr = validateField('postalCode', form.postalCode);

    if (addressErr || cityErr || postalCodeErr) {
      setErrors((prev) => ({
        ...prev,
        address: addressErr,
        city: cityErr,
        postalCode: postalCodeErr,
      }));
      return;
    }

    if (isAuthenticated && customer) {
      setSavingNewAddress(true);
      setAddressSaveError(null);
      try {
        const created = await AddressService.createAddress({
          name: `${form.firstName} ${form.lastName}`.trim() || customer.firstName,
          phone: form.phone || customer.phone || 'N/A',
          addressLine1: form.address,
          city: form.city,
          state: form.state || undefined,
          postalCode: form.postalCode || undefined,
          country: form.country || 'India',
          isDefault: savedAddresses.length === 0,
        });

        if (created) {
          await loadSavedAddresses();
          setSelectedAddressId(created.id);
          setShowNewAddressForm(false);
        }
      } catch (err: unknown) {
        console.error('Failed to save address:', err);
        // Even if saving to DB fails, allow continuing with the typed form address
        setShowNewAddressForm(false);
      } finally {
        setSavingNewAddress(false);
      }
    } else {
      setShowNewAddressForm(false);
    }
  };

  const shipping = calculateShipping(form.shippingZone, subtotal);
  const total = subtotal + shipping;

  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address';
        return '';
      case 'firstName':
        if (!value.trim()) return 'First name is required';
        return '';
      case 'lastName':
        if (!value.trim()) return 'Last name is required';
        return '';
      case 'address':
        if (!value.trim()) return 'Street address is required';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        return '';
      case 'postalCode':
        if (!value.trim()) return 'Postal code is required';
        return '';
      default:
        return '';
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    const fieldError = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
    if (submitError) setSubmitError(null);
  };

  const handleBlur = (field: string) => {
    const value = form[field as keyof typeof form] as string;
    const fieldError = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: fieldError }));
  };

  const validateStep = (step: CheckoutStep): boolean => {
    const newErrors: Record<string, string> = {};
    if (step === 'contact') {
      const emailErr = validateField('email', form.email);
      const firstNameErr = validateField('firstName', form.firstName);
      const lastNameErr = validateField('lastName', form.lastName);
      if (emailErr) newErrors.email = emailErr;
      if (firstNameErr) newErrors.firstName = firstNameErr;
      if (lastNameErr) newErrors.lastName = lastNameErr;
    }
    if (step === 'shipping') {
      const addressErr = validateField('address', form.address);
      const cityErr = validateField('city', form.city);
      const postalCodeErr = validateField('postalCode', form.postalCode);
      if (addressErr) newErrors.address = addressErr;
      if (cityErr) newErrors.city = cityErr;
      if (postalCodeErr) newErrors.postalCode = postalCodeErr;
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    const idx = steps.findIndex((s) => s.key === currentStep);
    if (idx < steps.length - 1) setCurrentStep(steps[idx + 1].key);
  };

  const prevStep = () => {
    const idx = steps.findIndex((s) => s.key === currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1].key);
  };

  const handlePlaceOrder = async () => {
    const isContactValid = validateStep('contact');
    const isShippingValid = validateStep('shipping');

    if (!isContactValid || !isShippingValid) {
      if (!isContactValid) {
        setCurrentStep('contact');
      } else {
        setCurrentStep('shipping');
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const orderPayload: CreateOrderDTO = {
        items: items.map((item) => ({
          productId: item.productId,
          slug: item.slug || item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          colour: item.colour || 'Standard',
        })),
        customer: {
          email: form.email.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim() || 'N/A',
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim() || '',
          postalCode: form.postalCode.trim() || '',
          country: form.country,
        },
        shippingZone: form.shippingZone,
        paymentMethod: form.paymentMethod === 'upi' ? 'UPI' : 'Credit Card',
        notes: form.notes || undefined,
      };

      const res = await OrderService.createOrder(orderPayload);

      clearCart();
      const orderRef = res.orderNumber || res.orderId;
      router.push(`/order-confirmation?orderNumber=${encodeURIComponent(orderRef)}`);
    } catch (err: unknown) {
      console.error('Failed to create order:', err);
      const message =
        err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-site py-32 text-center">
        <h1 className="font-display text-4xl text-ink mb-6 uppercase tracking-widest">Checkout</h1>
        <p className="text-sm text-text-muted mb-8 font-body">Your bag is empty.</p>
        <Link
          href="/shop"
          className="inline-block border border-ink text-ink px-8 py-3 text-xs uppercase tracking-widest font-medium hover:bg-ink hover:text-ivory transition-colors"
        >
          Return to shop
        </Link>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="container-site py-12 md:py-20 px-6 max-w-[1200px] mx-auto bg-ivory text-deep-brown">
      <h1 className="font-display text-3xl md:text-4xl text-chocolate mb-12 text-center uppercase tracking-widest">
        Secure Checkout
      </h1>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-4 mb-16 max-w-lg mx-auto">
        {steps.map((step, i) => (
          <div key={step.key} className="flex items-center gap-4">
            <button
              onClick={() => i < currentStepIndex && setCurrentStep(step.key)}
              disabled={i > currentStepIndex}
              className={`text-xs uppercase tracking-widest transition-colors ${
                i === currentStepIndex
                  ? 'text-chocolate font-medium border-b border-chocolate pb-1'
                  : i < currentStepIndex
                    ? 'text-text-muted cursor-pointer hover:text-chocolate'
                    : 'text-text-muted/40'
              }`}
            >
              {step.label}
            </button>
            {i < steps.length - 1 && <span className="text-text-muted/30">/</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
        {/* Form area */}
        <div className="lg:col-span-7">
          {/* Contact step */}
          {currentStep === 'contact' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-sm uppercase tracking-widest text-chocolate font-medium">
                  1. Contact Information
                </h2>
              </div>

              {/* When prefilled from logged-in account and not in edit mode */}
              {isAuthenticated && customer && !isEditingContact ? (
                <div className="bg-cream/70 border border-border p-4 sm:p-5 font-body space-y-2.5">
                  {/* Line 1: Contact information in one line */}
                  <div className="flex items-center gap-2 flex-wrap text-sm text-ink font-body">
                    <span className="font-display text-base font-medium">
                      {form.firstName || customer.firstName}{' '}
                      {form.lastName || customer.lastName || ''}
                    </span>
                    {(form.phone || customer.phone) &&
                      (form.phone !== 'N/A' || customer.phone !== 'N/A') && (
                        <>
                          <span className="text-text-muted/50">•</span>
                          <span className="text-xs text-text-muted font-mono">
                            {form.phone && form.phone !== 'N/A' ? form.phone : customer.phone}
                          </span>
                        </>
                      )}
                  </div>

                  {/* Line 2: Small "Logged in as" then that and then small button to edit */}
                  <div className="text-[11.5px] text-text-muted flex items-center gap-2 flex-wrap pt-0.5">
                    <div className="flex items-center gap-1.5">
                      <User size={11} className="text-chocolate shrink-0" />
                      <span>
                        Logged in as{' '}
                        <strong className="text-ink font-medium">{customer.email}</strong>
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-1.5 py-0.2 rounded-xs font-semibold ml-1">
                        <Check size={9} strokeWidth={2.5} /> Verified
                      </span>
                    </div>
                    <span className="text-text-muted/40">•</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingContact(true)}
                      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-chocolate hover:text-ink hover:underline font-medium cursor-pointer"
                    >
                      <Edit3 size={10} />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Continue CTA */}
                  <div className="pt-3 border-t border-border/50">
                    <button
                      type="button"
                      onClick={() => nextStep()}
                      className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-ink hover:underline font-medium cursor-pointer"
                    >
                      <span>Continue to Shipping Address</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                /* Editable Input Fields (Shown if guest OR when user clicked Edit) */
                <div className="space-y-6">
                  {isAuthenticated && customer && isEditingContact && (
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-xs text-text-muted">
                        Editing contact details for this order:
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingContact(false)}
                        className="text-xs text-text-muted hover:text-ink underline cursor-pointer"
                      >
                        Done editing
                      </button>
                    </div>
                  )}

                  <div>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      className={`w-full bg-transparent border-b ${errors.email ? 'border-wine placeholder:text-wine' : 'border-border focus:border-ink'} py-3 text-sm font-body text-ink focus:outline-none transition-colors placeholder:text-text-muted`}
                      placeholder="Email Address *"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-wine mt-1.5 font-body tracking-wide">
                        {errors.email}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <input
                        type="text"
                        value={form.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
                        className={`w-full bg-transparent border-b ${errors.firstName ? 'border-wine' : 'border-border focus:border-ink'} py-3 text-sm font-body text-ink focus:outline-none transition-colors placeholder:text-text-muted`}
                        placeholder="First Name *"
                      />
                      {errors.firstName && (
                        <p className="text-[11px] text-wine mt-1.5 font-body tracking-wide">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={form.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        onBlur={() => handleBlur('lastName')}
                        className={`w-full bg-transparent border-b ${errors.lastName ? 'border-wine' : 'border-border focus:border-ink'} py-3 text-sm font-body text-ink focus:outline-none transition-colors placeholder:text-text-muted`}
                        placeholder="Last Name *"
                      />
                      {errors.lastName && (
                        <p className="text-[11px] text-wine mt-1.5 font-body tracking-wide">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="w-full bg-transparent border-b border-border focus:border-ink py-3 text-sm font-body text-ink focus:outline-none transition-colors placeholder:text-text-muted"
                      placeholder="Phone Number (Optional)"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shipping step */}
          {currentStep === 'shipping' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h2 className="text-sm uppercase tracking-widest text-chocolate font-medium">
                  2. Shipping Address
                </h2>
                {isAuthenticated && customer && (
                  <Link
                    href="/account/addresses?returnUrl=/checkout"
                    className="text-xs uppercase tracking-widest text-ink hover:text-chocolate hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <span>Manage in Account</span>
                    <ChevronRight size={13} />
                  </Link>
                )}
              </div>

              {/* Logged in with saved addresses: Display interactive address selection cards */}
              {isAuthenticated && customer && savedAddresses.length > 0 && !showNewAddressForm ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-text-muted font-body block">
                      Choose Destination Address:
                    </span>
                    <Link
                      href="/account/addresses?returnUrl=/checkout&action=new"
                      className="text-xs uppercase tracking-wider text-chocolate hover:text-ink hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      <Plus size={12} />
                      <span>Add to Account</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {savedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;

                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectAddress(addr)}
                          className={`p-4 border transition-all cursor-pointer relative font-body ${
                            isSelected
                              ? 'bg-cream border-ink ring-1 ring-ink/30 shadow-xs'
                              : 'bg-transparent border-border hover:border-chocolate'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-display text-sm text-ink font-medium">
                              {addr.name}
                            </span>
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-wider bg-ink text-ivory px-2 py-0.5 font-medium">
                                  <Check size={10} /> Selected
                                </span>
                              )}
                              <Link
                                href={`/account/addresses?returnUrl=/checkout&edit=${addr.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wider text-chocolate hover:text-ink hover:underline font-medium py-0.5 px-1 cursor-pointer"
                                title="Edit this address in your account"
                              >
                                <Edit3 size={10} />
                                <span>Edit</span>
                              </Link>
                            </div>
                          </div>

                          <p className="text-xs text-deep-brown leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                          </p>
                          <p className="text-xs text-text-muted">
                            {addr.city}, {addr.state} {addr.postalCode}
                          </p>
                          <p className="text-xs text-text-muted">{addr.country || 'India'}</p>
                          {addr.phone && (
                            <p className="text-[11px] text-text-muted mt-2 font-mono">
                              {addr.phone}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Add new address card option */}
                    <Link
                      href="/account/addresses?returnUrl=/checkout&action=new"
                      className="p-4 border border-dashed border-border hover:border-chocolate bg-cream/30 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[120px] group"
                    >
                      <Plus
                        size={18}
                        className="text-chocolate mb-1.5 group-hover:scale-110 transition-transform"
                      />
                      <span className="text-xs uppercase tracking-wider text-ink font-medium">
                        Add New Address
                      </span>
                      <span className="text-[11px] text-text-muted mt-0.5">
                        Manage in your account & return to checkout
                      </span>
                    </Link>
                  </div>
                </div>
              ) : null}

              {/* When no saved addresses, guest mode, or adding new address */}
              {(!isAuthenticated ||
                !customer ||
                savedAddresses.length === 0 ||
                showNewAddressForm) && (
                <div className="space-y-6">
                  {isAuthenticated && customer && savedAddresses.length === 0 && (
                    <div className="p-4 bg-cream/70 border border-border flex items-center justify-between flex-wrap gap-3 font-body">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-chocolate font-medium">
                          No Saved Addresses Found
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          Enter your shipping details below, or add an address to your atelier
                          account.
                        </p>
                      </div>
                      <Link
                        href="/account/addresses?returnUrl=/checkout&action=new"
                        className="text-xs uppercase tracking-widest bg-ink text-ivory px-3.5 py-1.5 hover:bg-chocolate transition-colors font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Manage in Account</span>
                      </Link>
                    </div>
                  )}

                  {isAuthenticated && customer && savedAddresses.length > 0 && (
                    <div className="flex items-center justify-between pb-2">
                      <span className="text-xs uppercase tracking-wider text-chocolate font-medium">
                        Enter New Shipping Destination:
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowNewAddressForm(false)}
                        className="text-xs text-text-muted hover:text-ink underline cursor-pointer"
                      >
                        Cancel & Pick Saved Address
                      </button>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      onBlur={() => handleBlur('address')}
                      className={`w-full bg-transparent border-b ${errors.address ? 'border-wine' : 'border-border focus:border-ink'} py-3 text-sm font-body text-ink focus:outline-none transition-colors placeholder:text-text-muted`}
                      placeholder="Street Address *"
                    />
                    {errors.address && (
                      <p className="text-[11px] text-wine mt-1.5 font-body tracking-wide">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <input
                        type="text"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        onBlur={() => handleBlur('city')}
                        className={`w-full bg-transparent border-b ${errors.city ? 'border-wine' : 'border-border focus:border-ink'} py-3 text-sm font-body text-ink focus:outline-none transition-colors placeholder:text-text-muted`}
                        placeholder="City *"
                      />
                      {errors.city && (
                        <p className="text-[11px] text-wine mt-1.5 font-body tracking-wide">
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={form.postalCode}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        onBlur={() => handleBlur('postalCode')}
                        className={`w-full bg-transparent border-b ${errors.postalCode ? 'border-wine' : 'border-border focus:border-ink'} py-3 text-sm font-body text-ink focus:outline-none transition-colors placeholder:text-text-muted`}
                        placeholder="Postal Code *"
                      />
                      {errors.postalCode && (
                        <p className="text-[11px] text-wine mt-1.5 font-body tracking-wide">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                      type="text"
                      value={form.state}
                      onChange={(e) => updateField('state', e.target.value)}
                      className="w-full bg-transparent border-b border-border focus:border-ink py-3 text-sm font-body text-ink focus:outline-none transition-colors placeholder:text-text-muted"
                      placeholder="State / Province"
                    />
                    <select
                      value={form.country}
                      onChange={(e) => {
                        updateField('country', e.target.value);
                        updateField(
                          'shippingZone',
                          e.target.value === 'India' ? 'mumbai' : 'rest-of-world'
                        );
                      }}
                      className="w-full bg-transparent border-b border-border focus:border-ink py-3 text-sm font-body text-ink focus:outline-none transition-colors cursor-pointer appearance-none rounded-none"
                    >
                      <option value="India">India</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {isAuthenticated && customer && showNewAddressForm && (
                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSaveNewAddress}
                        disabled={savingNewAddress}
                        className="bg-ink text-ivory px-5 py-2.5 text-xs uppercase tracking-widest font-medium hover:bg-chocolate transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {savingNewAddress ? 'Saving Address...' : 'Save & Use This Address'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment step */}
          {currentStep === 'payment' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-sm uppercase tracking-widest text-chocolate font-medium border-b border-border pb-4">
                3. Payment Method
              </h2>
              <div className="space-y-4">
                {paymentMethods
                  .filter((m) =>
                    form.country === 'India' ? m.region === 'india' : m.region === 'international'
                  )
                  .map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${form.paymentMethod === method.id ? 'border-ink bg-cream' : 'border-border hover:border-chocolate'}`}
                    >
                      <span className="text-sm font-body text-ink uppercase tracking-widest">
                        {method.label}
                      </span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={form.paymentMethod === method.id}
                        onChange={(e) => updateField('paymentMethod', e.target.value)}
                        className="accent-ink"
                      />
                    </label>
                  ))}
              </div>
            </div>
          )}

          {/* Review step */}
          {currentStep === 'review' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <h2 className="text-sm uppercase tracking-widest text-chocolate font-medium border-b border-border pb-4">
                4. Review & Confirm
              </h2>
              <div className="border border-border p-6 space-y-6">
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-xs uppercase tracking-widest text-text-muted">Contact</span>
                  <span className="text-sm text-ink">{form.email}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-xs uppercase tracking-widest text-text-muted">Ship To</span>
                  <span className="text-sm text-ink text-right max-w-xs">
                    {form.firstName} {form.lastName}
                    <br />
                    {form.address}, {form.city} {form.postalCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs uppercase tracking-widest text-text-muted">Payment</span>
                  <span className="text-sm text-ink uppercase">
                    {paymentMethods.find((m) => m.id === form.paymentMethod)?.label}
                  </span>
                </div>
              </div>

              {submitError && (
                <div className="p-4 bg-wine/10 border border-wine text-wine text-xs uppercase tracking-wider">
                  {submitError}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 pt-8 border-t border-border">
            {currentStepIndex > 0 ? (
              <button
                onClick={prevStep}
                disabled={isSubmitting}
                className="text-xs uppercase tracking-widest text-text-muted hover:text-ink transition-colors disabled:opacity-50"
              >
                ← Back
              </button>
            ) : (
              <Link
                href="/cart"
                className="text-xs uppercase tracking-widest text-text-muted hover:text-ink transition-colors"
              >
                ← Return to Bag
              </Link>
            )}

            {currentStep === 'review' ? (
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-ink text-ivory px-12 py-4 text-xs uppercase tracking-widest font-medium hover:bg-chocolate transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-ivory border-t-transparent rounded-full animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="w-full sm:w-auto bg-ink text-ivory px-12 py-4 text-xs uppercase tracking-widest font-medium hover:bg-chocolate transition-colors shadow-sm"
              >
                Continue →
              </button>
            )}
          </div>
        </div>

        {/* Order Dossier */}
        <div className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-border mt-16 lg:mt-0">
          <div className="lg:sticky lg:top-32">
            <h2 className="text-sm uppercase tracking-widest text-chocolate font-medium border-b border-border pb-4 mb-8">
              Order Dossier
            </h2>

            <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={`${item.productId}-${item.size}`} className="flex gap-4">
                  <div className="w-20 aspect-[3/4] relative flex-shrink-0 border border-border">
                    <Image
                      src={item.image || generatePlaceholderImage(80, 107, item.productId)}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 py-1">
                    <p className="text-sm font-body text-ink truncate mb-1">{item.name}</p>
                    <p className="text-xs text-text-muted mb-auto">
                      {item.size} / Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-body text-ink">
                      {format(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm font-body border-t border-border pt-6">
              <div className="flex justify-between">
                <span className="text-text-muted uppercase text-xs tracking-widest">Subtotal</span>
                <span className="text-ink">{format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted uppercase text-xs tracking-widest">Shipping</span>
                <span className="text-ink">
                  {shipping === 0 ? 'Complimentary' : format(shipping)}
                </span>
              </div>
              <div className="border-t border-border pt-6 mt-4 flex justify-between items-end">
                <span className="text-chocolate uppercase text-xs tracking-widest">Total</span>
                <span className="text-ink font-display text-2xl">{format(total)}</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-[10px] uppercase tracking-widest text-text-muted mb-2">
                Need assistance?
              </p>
              <Link
                href="/contact"
                className="text-xs text-ink hover:text-chocolate transition-colors border-b border-ink pb-0.5"
              >
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
