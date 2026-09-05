'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/frontend/context/AuthContext';
import { ContactService, ContactTicketRecord } from '@/frontend/services/contactService';
import {
  MessageSquare,
  Clock,
  Package,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Mail,
} from 'lucide-react';

function ConsultationsContent() {
  const { customer, isAuthenticated, isLoading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get('email') || '';

  const [tickets, setTickets] = useState<ContactTicketRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Guest inquiry state
  const [guestEmail, setGuestEmail] = useState<string>(urlEmail);
  const [guestLoading, setGuestLoading] = useState<boolean>(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestQueried, setGuestQueried] = useState<boolean>(false);

  useEffect(() => {
    async function loadTickets() {
      if (authLoading) return;

      // 1. Authenticated user: fetch their registered tickets
      if (isAuthenticated && customer) {
        try {
          setLoading(true);
          setError(null);
          const data = await ContactService.getTickets();
          setTickets(data || []);
        } catch (err) {
          console.error('Failed to load consultation tickets:', err);
          setError('Unable to retrieve consultation tickets at this time.');
        } finally {
          setLoading(false);
        }
        return;
      }

      // 2. Guest user with email in URL: auto-load
      if (urlEmail) {
        setGuestLoading(true);
        setGuestError(null);
        try {
          const data = await ContactService.getTickets({ email: urlEmail });
          setTickets(data || []);
          setGuestQueried(true);
        } catch {
          setGuestError('Failed to lookup tickets for this email.');
        } finally {
          setGuestLoading(false);
          setLoading(false);
        }
        return;
      }

      setLoading(false);
    }

    loadTickets();
  }, [customer, isAuthenticated, authLoading, urlEmail]);

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) {
      setGuestError('Please enter your email address to find your consultation tickets.');
      return;
    }

    setGuestLoading(true);
    setGuestError(null);
    try {
      const data = await ContactService.getTickets({ email: guestEmail.trim().toLowerCase() });
      setTickets(data || []);
      setGuestQueried(true);
    } catch {
      setGuestError('Failed to retrieve consultation tickets.');
    } finally {
      setGuestLoading(false);
    }
  };

  const formatDate = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  // Display status badge only for meaningful advisor updates (no 'new' or 'received' shown to user)
  const getTicketStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 text-[10px] uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            In Review
          </span>
        );
      case 'replied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-sky-50 text-sky-900 border border-sky-200 text-[10px] uppercase tracking-wider font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
            Replied
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-900 border border-emerald-200 text-[10px] uppercase tracking-wider font-semibold">
            <CheckCircle2 size={11} className="text-emerald-700" />
            Resolved
          </span>
        );
      case 'new':
      default:
        // No status tag shown for new/initial state
        return null;
    }
  };

  return (
    <main className="bg-[var(--color-ivory)] pt-[60px] pb-16 min-h-[calc(100vh-60px)] flex flex-col justify-start">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6" style={{ zoom: 1.01 }}>
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-2 text-[11px] font-body text-[var(--color-muted)]">
          <Link href="/" className="hover:text-[var(--color-ink)] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/account" className="hover:text-[var(--color-ink)] transition-colors">
            Account
          </Link>
          <span>/</span>
          <span className="text-[var(--color-ink)] font-medium">Consultations</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-[var(--color-line)] pb-5 mb-8 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-muted)] font-body block font-medium">
              Atelier Support & Bespoke Records
            </span>
            <h1
              className="text-2xl md:text-3xl text-[var(--color-ink)] italic font-normal"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Consultations & Inquiries
            </h1>
            <p className="font-body text-[13px] text-[var(--color-muted)] mt-1">
              Track styling appointments, custom fit discussions, and customer support tickets.
            </p>
          </div>

          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 border border-[var(--color-ink)] text-[var(--color-ink)] hover:bg-[var(--color-ink)] hover:text-[var(--color-ivory)] px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors font-medium shrink-0 cursor-pointer"
          >
            <MessageSquare size={13} strokeWidth={1.5} />
            <span>New Consultation</span>
          </Link>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="text-center py-16 bg-[#f7f2ea] border border-[var(--color-line)] p-8 font-body">
            <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-[var(--color-ink)] mb-3" />
            <p className="text-[12.5px] text-[var(--color-muted)]">
              Retrieving consultation tickets...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-10 bg-red-50 border border-red-200 p-6 text-red-900 font-body text-[13px]">
            <p>{error}</p>
          </div>
        ) : !isAuthenticated && (!guestQueried || tickets.length === 0) ? (
          /* Guest Lookup Screen */
          <div className="bg-[#f7f2ea] border border-[var(--color-line)] p-6 sm:p-10 max-w-xl mx-auto font-body">
            <div className="text-center mb-6">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted)] block font-medium mb-1">
                Atelier Concierge
              </span>
              <h2
                className="text-2xl text-[var(--color-ink)] italic"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Track Your Consultation
              </h2>
              <p className="text-[12.5px] text-[var(--color-muted)] mt-1.5 leading-relaxed">
                If you submitted an inquiry or styling request as a guest, enter the email address
                used below to view ticket history and responses.
              </p>
            </div>

            <form onSubmit={handleGuestLookup} className="space-y-4 max-w-md mx-auto">
              {guestError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-[12px]">
                  {guestError}
                </div>
              )}

              <div>
                <label
                  htmlFor="guest_email"
                  className="block text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink)] mb-1 font-medium"
                >
                  Contact Email Address
                </label>
                <div className="relative">
                  <input
                    id="guest_email"
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="e.g. anya@atelier.com"
                    className="w-full bg-[var(--color-ivory)] border border-[var(--color-line)] px-3.5 py-2.5 text-[12.5px] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
                  />
                  <Mail
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={guestLoading}
                className="w-full bg-[var(--color-ink)] text-[var(--color-ivory)] py-2.5 text-[11px] uppercase tracking-[0.16em] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {guestLoading ? 'Searching records...' : 'Find Consultation Records'}
              </button>

              <div className="text-center pt-2">
                <span className="text-[11.5px] text-[var(--color-muted)]">
                  Have an Atelier account?{' '}
                  <Link
                    href="/account"
                    className="text-[var(--color-ink)] font-medium underline underline-offset-2 hover:opacity-80"
                  >
                    Sign In
                  </Link>
                </span>
              </div>
            </form>
          </div>
        ) : tickets.length === 0 ? (
          /* Empty Tickets State */
          <div className="bg-[#f7f2ea] border border-[var(--color-line)] p-10 text-center font-body max-w-md mx-auto">
            <MessageSquare
              size={32}
              strokeWidth={1.2}
              className="mx-auto text-[var(--color-muted)] mb-3"
            />
            <h3
              className="text-xl text-[var(--color-ink)] italic mb-1.5"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              No Consultation Records Found
            </h3>
            <p className="text-[12.5px] text-[var(--color-muted)] mb-6 leading-relaxed">
              {isAuthenticated
                ? "You haven't initiated any inquiries or styling consultations under this account yet."
                : `No open or archived tickets found for ${guestEmail}.`}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                href="/contact"
                className="bg-[var(--color-ink)] text-[var(--color-ivory)] px-5 py-2.5 text-[10.5px] uppercase tracking-[0.16em] font-medium hover:opacity-90 transition-opacity"
              >
                Schedule Consultation
              </Link>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setGuestQueried(false);
                    setGuestEmail('');
                  }}
                  className="border border-[var(--color-ink)] text-[var(--color-ink)] px-5 py-2.5 text-[10.5px] uppercase tracking-[0.16em] font-medium hover:bg-[#ece5d9] transition-colors"
                >
                  Search Different Email
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Tickets List */
          <div className="space-y-4 font-body">
            {/* Header info bar */}
            <div className="flex items-center justify-between text-[11.5px] text-[var(--color-muted)] pb-2 px-1">
              <span>
                Showing <strong>{tickets.length}</strong> consultation{' '}
                {tickets.length === 1 ? 'ticket' : 'tickets'}
                {guestQueried && !isAuthenticated && (
                  <span className="text-[var(--color-ink)]"> for {guestEmail}</span>
                )}
              </span>
              {!isAuthenticated && (
                <button
                  type="button"
                  onClick={() => {
                    setGuestQueried(false);
                    setTickets([]);
                  }}
                  className="underline hover:text-[var(--color-ink)] text-[11px] cursor-pointer"
                >
                  Clear search
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-[#f7f2ea] border border-[var(--color-line)] p-4 sm:p-5 hover:border-[var(--color-ink)]/40 transition-colors flex flex-col gap-3"
                >
                  {/* Top Bar: Ticket ID, Date, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-line)] pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[12px] font-semibold text-[var(--color-ink)]">
                        #{ticket.id}
                      </span>
                      <span className="text-[11px] text-[var(--color-muted)] flex items-center gap-1">
                        <Clock size={11} /> {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {getTicketStatusBadge(ticket.status)}
                    </div>
                  </div>

                  {/* Middle Details: Subject & Message snippet */}
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[var(--color-muted)]">
                        Topic:
                      </span>
                      <h3 className="text-[13.5px] font-medium text-[var(--color-ink)]">
                        {ticket.subject || 'General Inquiry'}
                      </h3>
                    </div>

                    <p className="text-[12.5px] text-[#4A3025] leading-relaxed bg-[var(--color-ivory)] border border-[var(--color-line)] p-3 rounded-xs">
                      {ticket.message}
                    </p>
                  </div>

                  {/* Bottom Meta: Customer info and Order Reference */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[11.5px] text-[var(--color-muted)] pt-1">
                    <div className="flex flex-wrap items-center gap-4">
                      <span>
                        Sender:{' '}
                        <strong className="text-[var(--color-ink)] font-normal">
                          {ticket.name}
                        </strong>{' '}
                        ({ticket.email})
                      </span>
                      {ticket.phone && (
                        <span>
                          Phone:{' '}
                          <strong className="text-[var(--color-ink)] font-normal">
                            {ticket.phone}
                          </strong>
                        </span>
                      )}
                      {ticket.orderNumber && (
                        <span className="inline-flex items-center gap-1 text-[var(--color-ink)] bg-[#eadecd] px-2 py-0.5 border border-[var(--color-line)] font-mono text-[10.5px]">
                          <Package size={11} />
                          Order Ref: {ticket.orderNumber}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/contact?orderNumber=${encodeURIComponent(ticket.orderNumber || '')}&email=${encodeURIComponent(ticket.email)}&name=${encodeURIComponent(ticket.name)}&subject=${encodeURIComponent(`Follow-up: ${ticket.subject || 'Consultation'}`)}`}
                        className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[var(--color-ink)] hover:underline font-medium"
                      >
                        Follow up with Concierge
                        <ArrowRight size={11} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ConsultationsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[var(--color-ivory)] pt-[60px] min-h-screen flex items-center justify-center font-body text-[13px] text-[var(--color-muted)]">
          Loading Atelier consultations...
        </div>
      }
    >
      <ConsultationsContent />
    </Suspense>
  );
}
