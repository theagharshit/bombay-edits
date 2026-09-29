'use client';

import React, { useState } from 'react';
import {
  Mail,
  Smartphone,
  Send,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Laptop,
  Tablet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  FileCode,
  Eye,
  Info,
} from 'lucide-react';

export type TemplateData = {
  id: string;
  title: string;
  category: string;
  description: string;
  subject: string;
  emailHtml: string;
  emailText: string;
  smsText: string | null;
  recipientEmail: string;
  recipientPhone: string | null;
};

export type AuditLogItem = {
  id: string;
  channel: 'email' | 'sms';
  provider: string;
  recipient: string;
  status: 'dispatched' | 'failed';
  timestamp: string;
  error?: string;
};

type RawAuditLogItem = {
  id?: string;
  messageId?: string;
  channel: 'email' | 'sms';
  provider: string;
  recipient: string;
  status?: 'dispatched' | 'failed';
  success?: boolean;
  timestamp: string;
  error?: string;
};

interface CommunicationsClientProps {
  initialTemplates: Record<string, TemplateData>;
  initialProviders: { email: string; sms: string };
  initialLogs: AuditLogItem[];
}

export function CommunicationsClient({
  initialTemplates,
  initialProviders,
  initialLogs,
}: CommunicationsClientProps) {
  const [templates] = useState<Record<string, TemplateData>>(initialTemplates);
  const [providers] = useState(initialProviders);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialLogs);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('contact-acknowledgment');
  const [channel, setChannel] = useState<'email' | 'sms'>('email');
  const [emailViewport, setEmailViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [copied, setCopied] = useState(false);
  const [isRefreshingLogs, setIsRefreshingLogs] = useState(false);

  // Test Dispatch state
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Filter logs by channel
  const [logFilter, setLogFilter] = useState<'all' | 'email' | 'sms'>('all');

  const currentTemplate = templates[selectedTemplateId] || Object.values(templates)[0];

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshLogs = async () => {
    setIsRefreshingLogs(true);
    try {
      const res = await fetch('/api/notifications/preview?format=data');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.auditLogs)) {
          setAuditLogs(
            data.auditLogs
              .map((item: RawAuditLogItem, idx: number) => ({
                id: item.id || `${item.messageId || 'log'}-${item.timestamp || Date.now()}-${idx}`,
                channel: item.channel,
                provider: item.provider,
                recipient: item.recipient,
                status: item.status || (item.success ? 'dispatched' : 'failed'),
                timestamp: item.timestamp,
                error: item.error,
              }))
              .sort(
                (a: AuditLogItem, b: AuditLogItem) =>
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              )
          );
        }
      }
    } catch (err) {
      console.error('Failed to refresh audit logs:', err);
    } finally {
      setIsRefreshingLogs(false);
    }
  };

  const handleDispatchTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) return;

    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notifications/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          template: currentTemplate.id,
          recipient: testRecipient,
          status: 'dispatched',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `Dispatched test ${channel.toUpperCase()} successfully!`,
        });
        refreshLogs();
      } else {
        setTestResult({
          success: false,
          message: data.error || data.message || 'Dispatch failed',
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err instanceof Error ? err.message : 'Network error during dispatch',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Calculate SMS metadata
  const smsMessage = currentTemplate.smsText || 'No SMS configured for this template.';
  const charCount = smsMessage.length;
  const segments = charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  const filteredLogs = auditLogs
    .filter((log) => {
      if (logFilter === 'all') return true;
      return log.channel === logFilter;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="p-4 md:p-8 max-w-[1520px] mx-auto space-y-8 pb-32">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[var(--admin-border)] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-[#4A3025]/10 text-[#4A3025] rounded font-medium">
              Atelier Notification Studio
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3" /> Live Dispatch Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#2C1810]">
            Communications & Dispatch Hub
          </h1>
          <p className="text-xs md:text-sm text-[#8A817C] mt-1 max-w-2xl">
            Preview, inspect, and test customer notification touchpoints across Email and SMS
            channels. Storefront consultation inquiries trigger instant confirmations while
            continuing full conversation via concierge email.
          </p>
        </div>

        {/* Live Provider Status Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xs">
            <Mail className="w-4 h-4 text-[#4A3025]" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-mono tracking-wider text-[#8A817C]">
                Email Gateway
              </p>
              <p className="text-xs font-semibold text-[#2C1810] flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${providers.email.includes('Resend') ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
                {providers.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xs">
            <Smartphone className="w-4 h-4 text-[#4A3025]" />
            <div className="text-left">
              <p className="text-[10px] uppercase font-mono tracking-wider text-[#8A817C]">
                SMS Gateway
              </p>
              <p className="text-xs font-semibold text-[#2C1810] flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${providers.sms.includes('Twilio') ? 'bg-emerald-500' : 'bg-amber-500'}`}
                />
                {providers.sms}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Template Selector & Settings (4 cols) */}
        <div className="xl:col-span-4 space-y-6">
          {/* Template Selection Card */}
          <div className="p-5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xs">
            <h2 className="text-xs font-mono uppercase tracking-wider text-[#8A817C] mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#4A3025]" /> Select Touchpoint Template
            </h2>

            <div className="space-y-2.5">
              {Object.values(templates).map((tmpl) => {
                const isSelected = tmpl.id === selectedTemplateId;
                return (
                  <button
                    key={tmpl.id}
                    onClick={() => {
                      setSelectedTemplateId(tmpl.id);
                      setTestResult(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-[#4A3025] bg-[#4A3025]/5 shadow-xs ring-1 ring-[#4A3025]/20'
                        : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#8A817C]">
                        {tmpl.category}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-[#8A817C]" />
                        {tmpl.smsText && <Smartphone className="w-3 h-3 text-[#8A817C]" />}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-[#2C1810] mb-1">{tmpl.title}</h3>
                    <p className="text-xs text-[#8A817C] line-clamp-2 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Test Dispatch Form */}
          <div className="p-5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-[#8A817C] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#4A3025]" /> Send Test Dispatch
              </h2>
              <span className="text-[10px] font-mono bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                Live Engine
              </span>
            </div>
            <p className="text-xs text-[#8A817C] mb-4">
              Dispatch a real sample notification for <strong>{currentTemplate.title}</strong> to
              verify deliverability and layout.
            </p>

            <form onSubmit={handleDispatchTest} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#8A817C] mb-1">
                  Recipient (
                  {channel === 'email' ? 'Email Address' : 'Mobile Number with +CountryCode'})
                </label>
                <input
                  type={channel === 'email' ? 'email' : 'tel'}
                  required
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder={
                    channel === 'email' ? 'e.g. your-email@domain.com' : 'e.g. +91 98200 12345'
                  }
                  className="w-full text-xs px-3 py-2.5 rounded border border-[var(--admin-border)] bg-white text-[#2C1810] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#4A3025]"
                />
              </div>

              <button
                type="submit"
                disabled={isSendingTest || (channel === 'sms' && !currentTemplate.smsText)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#4A3025] hover:bg-[#38241C] text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Dispatching sample...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    Send Test {channel === 'email' ? 'Email' : 'SMS'}
                  </>
                )}
              </button>
            </form>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`mt-3.5 p-3 rounded-lg text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 text-[11px] leading-relaxed break-all">
                  {testResult.message}
                </div>
              </div>
            )}
          </div>

          {/* Consultation Dialogue Notice Card */}
          {selectedTemplateId === 'contact-acknowledgment' && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-900 shadow-xs">
              <div className="flex items-center gap-2 font-medium text-xs mb-1.5">
                <Info className="w-4 h-4 text-amber-700" />
                <span>Atelier Concierge Rule</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-800">
                Inquiries are acknowledged instantly via email and SMS with their unique ticket
                number. Ongoing consultation dialogue continues privately via email so master
                stylists can converse directly with the client.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Previewer (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Channel and Viewport Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xs">
            {/* Channel Tabs */}
            <div className="flex items-center p-1 bg-neutral-100 rounded-lg">
              <button
                onClick={() => setChannel('email')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  channel === 'email'
                    ? 'bg-white text-[#2C1810] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Email Preview
              </button>
              <button
                onClick={() => setChannel('sms')}
                disabled={!currentTemplate.smsText}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  channel === 'sms'
                    ? 'bg-white text-[#2C1810] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Number / SMS {currentTemplate.smsText ? '' : '(N/A)'}
              </button>
            </div>

            {/* Email-Specific Controls */}
            {channel === 'email' && (
              <div className="flex items-center gap-3">
                {/* Viewport switcher */}
                <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                  <button
                    onClick={() => setEmailViewport('desktop')}
                    title="Desktop View (100%)"
                    className={`p-1.5 rounded transition-all ${
                      emailViewport === 'desktop'
                        ? 'bg-white text-[#2C1810] shadow-xs'
                        : 'text-neutral-500'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEmailViewport('tablet')}
                    title="Tablet View (768px)"
                    className={`p-1.5 rounded transition-all ${
                      emailViewport === 'tablet'
                        ? 'bg-white text-[#2C1810] shadow-xs'
                        : 'text-neutral-500'
                    }`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEmailViewport('mobile')}
                    title="Mobile View (375px)"
                    className={`p-1.5 rounded transition-all ${
                      emailViewport === 'mobile'
                        ? 'bg-white text-[#2C1810] shadow-xs'
                        : 'text-neutral-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preview vs Code toggle */}
                <div className="flex items-center bg-neutral-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('preview')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                      viewMode === 'preview'
                        ? 'bg-white text-[#2C1810] font-medium shadow-xs'
                        : 'text-neutral-500'
                    }`}
                  >
                    <Eye className="w-3 h-3" /> Visual
                  </button>
                  <button
                    onClick={() => setViewMode('code')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all ${
                      viewMode === 'code'
                        ? 'bg-white text-[#2C1810] font-medium shadow-xs'
                        : 'text-neutral-500'
                    }`}
                  >
                    <FileCode className="w-3 h-3" /> HTML
                  </button>
                </div>

                {/* Open in full tab */}
                <a
                  href={`/api/notifications/preview?template=${currentTemplate.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs text-[#8A817C] hover:text-[#2C1810] transition-colors p-1"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* PREVIEW CONTAINER: EMAIL */}
          {channel === 'email' && (
            <div className="space-y-3">
              {/* Mail Meta Header */}
              <div className="p-4 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] text-xs space-y-1.5 font-sans shadow-xs">
                <div className="flex items-baseline gap-3">
                  <span className="w-16 font-mono text-[11px] uppercase tracking-wider text-[#8A817C]">
                    Subject:
                  </span>
                  <span className="font-serif text-sm font-semibold text-[#2C1810]">
                    {currentTemplate.subject}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="w-16 font-mono text-[11px] uppercase tracking-wider text-[#8A817C]">
                    From:
                  </span>
                  <span className="text-neutral-700 font-mono text-[11px]">
                    The Bombay Edit Atelier &lt;orders@thebombayedit.com&gt;
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="w-16 font-mono text-[11px] uppercase tracking-wider text-[#8A817C]">
                    To:
                  </span>
                  <span className="text-neutral-700 font-mono text-[11px]">
                    {currentTemplate.recipientEmail}
                  </span>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="border border-[var(--admin-border)] rounded-xl overflow-hidden bg-neutral-100 p-4 md:p-6 flex justify-center">
                {viewMode === 'preview' ? (
                  <div
                    className="transition-all duration-300 shadow-lg rounded-lg overflow-hidden bg-white"
                    style={{
                      width:
                        emailViewport === 'desktop'
                          ? '100%'
                          : emailViewport === 'tablet'
                            ? '768px'
                            : '375px',
                      maxWidth: '100%',
                      height: '760px',
                    }}
                  >
                    <iframe
                      key={`${currentTemplate.id}-${emailViewport}`}
                      title={currentTemplate.title}
                      srcDoc={currentTemplate.emailHtml}
                      className="w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="w-full bg-[#1e1e1e] text-neutral-200 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[760px] relative">
                    <button
                      onClick={() => handleCopyText(currentTemplate.emailHtml)}
                      className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-[11px] text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
                    >
                      {copied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied ? 'Copied' : 'Copy HTML'}
                    </button>
                    <pre className="pt-8 whitespace-pre-wrap">{currentTemplate.emailHtml}</pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PREVIEW CONTAINER: SMS / PHONE NUMBER */}
          {channel === 'sms' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Smartphone Frame (7 cols) */}
              <div className="md:col-span-7 flex justify-center">
                <div className="w-[320px] sm:w-[350px] bg-neutral-900 rounded-[48px] p-4 shadow-2xl border-[4px] border-neutral-800 relative">
                  {/* Speaker & Dynamic Island */}
                  <div className="w-24 h-4 bg-black rounded-full mx-auto mb-3 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-neutral-900 mr-2" />
                    <div className="w-2 h-2 rounded-full bg-blue-900/50" />
                  </div>

                  {/* Phone Screen */}
                  <div className="bg-[#f2f2f7] rounded-[36px] overflow-hidden flex flex-col h-[540px] text-neutral-900 select-none">
                    {/* Status Bar */}
                    <div className="px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-semibold text-neutral-800">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span>5G</span>
                        <div className="w-5 h-2.5 border border-neutral-800 rounded-sm p-0.5 flex items-center">
                          <div className="w-3 h-full bg-neutral-800 rounded-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Messages App Header */}
                    <div className="px-4 py-3 bg-[#f8f8f8]/90 border-b border-neutral-200 flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#4A3025] text-white flex items-center justify-center font-serif text-sm shadow-xs mb-1">
                        TBE
                      </div>
                      <span className="text-xs font-semibold text-neutral-900 tracking-tight">
                        THE BOMBAY EDIT
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {currentTemplate.recipientPhone || '+91 98200 12345'}
                      </span>
                    </div>

                    {/* Message Bubble Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#e5ddd5]/30">
                      <div className="text-center">
                        <span className="text-[10px] uppercase font-mono text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                          Today 11:42 AM
                        </span>
                      </div>

                      {/* Bubble */}
                      <div className="max-w-[85%] bg-white text-neutral-900 text-[12px] leading-relaxed p-3.5 rounded-2xl rounded-tl-xs shadow-xs border border-neutral-200/80 whitespace-pre-wrap font-sans">
                        {smsMessage}
                      </div>

                      <div className="text-left text-[9px] text-neutral-400 pl-2">
                        Delivered via SMS Gateway
                      </div>
                    </div>

                    {/* Mock Input Bar */}
                    <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
                      <div className="flex-1 h-8 rounded-full bg-neutral-100 border border-neutral-200 px-3 flex items-center text-[11px] text-neutral-400">
                        Text Message • SMS
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#4A3025] text-white flex items-center justify-center">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical SMS Specs Card (5 cols) */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-5 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xs space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-[#8A817C] flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#4A3025]" /> SMS Gateway Telemetry
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="text-[#8A817C]">Character Count</span>
                      <span className="font-mono font-semibold text-[#2C1810]">
                        {charCount} characters
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="text-[#8A817C]">GSM-7 Segments</span>
                      <span className="font-mono font-semibold text-[#2C1810]">
                        {segments} {segments === 1 ? 'part' : 'concatenated parts'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="text-[#8A817C]">Encoding Standard</span>
                      <span className="font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        GSM 03.38 (7-bit)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                      <span className="text-[#8A817C]">Sender Identifier</span>
                      <span className="font-mono font-semibold text-[#2C1810]">
                        BOMBAYEDIT (Alpha)
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#8A817C]">Sample Recipient</span>
                      <span className="font-mono text-neutral-700">
                        {currentTemplate.recipientPhone || '+91 98200 12345'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyText(smsMessage)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-[var(--admin-border)] hover:bg-neutral-50 rounded text-xs text-[#2C1810] font-medium transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                    )}
                    {copied ? 'Copied Message Body' : 'Copy Message Body'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Live Notification Audit Trail */}
      <div className="p-6 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-serif font-semibold text-[#2C1810]">
                Live Dispatch Audit Trail
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4A3025]/10 text-[#4A3025]">
                {auditLogs.length} Total Dispatches
              </span>
            </div>
            <p className="text-xs text-[#8A817C] mt-0.5">
              Chronological log of customer communications triggered by storefront purchases,
              inquiries, and admin dispatches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setLogFilter('all')}
                className={`px-3 py-1 rounded transition-all ${
                  logFilter === 'all'
                    ? 'bg-white text-[#2C1810] font-medium shadow-xs'
                    : 'text-neutral-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setLogFilter('email')}
                className={`px-3 py-1 rounded transition-all ${
                  logFilter === 'email'
                    ? 'bg-white text-[#2C1810] font-medium shadow-xs'
                    : 'text-neutral-600'
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setLogFilter('sms')}
                className={`px-3 py-1 rounded transition-all ${
                  logFilter === 'sms'
                    ? 'bg-white text-[#2C1810] font-medium shadow-xs'
                    : 'text-neutral-600'
                }`}
              >
                SMS
              </button>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refreshLogs}
              disabled={isRefreshingLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--admin-border)] hover:bg-neutral-50 rounded text-xs text-[#2C1810] transition-colors cursor-pointer"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshingLogs ? 'animate-spin text-[#4A3025]' : 'text-neutral-500'}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Audit Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 text-[#8A817C] font-mono text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Channel</th>
                <th className="py-2.5 px-3">Provider</th>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Message ID / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400 italic">
                    No dispatches recorded yet in this server lifecycle. Submit a contact inquiry or
                    send a test notification above to record.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <tr
                    key={log.id ? `${log.id}-${idx}` : `log-${log.timestamp}-${idx}`}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-neutral-400" />
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          log.channel === 'email'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {log.channel === 'email' ? (
                          <Mail className="w-2.5 h-2.5" />
                        ) : (
                          <Smartphone className="w-2.5 h-2.5" />
                        )}
                        {log.channel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-700">
                      {log.provider}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#2C1810]">{log.recipient}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          log.status === 'dispatched'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.status === 'dispatched' ? (
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        ) : (
                          <AlertCircle className="w-2.5 h-2.5" />
                        )}
                        {log.status}
                      </span>
                    </td>
                    <td
                      className="py-2.5 px-3 font-mono text-[11px] text-neutral-500 truncate max-w-xs"
                      title={log.error || log.id}
                    >
                      {log.error ? <span className="text-rose-600">{log.error}</span> : log.id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
