'use client';
import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { format, formatDistanceToNow } from 'date-fns';
import { updateContactStatus, saveContactNotes } from '@/app/actions/admin/contact';
import { toast } from 'sonner';
import { Pagination } from '@/app/admin/_components/Pagination';
import { ChevronDown, ChevronUp } from 'lucide-react';

export function ContactInboxClient({ data, meta, counts }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const setParam = (k: string, v: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (v) p.set(k, v); else p.delete(k);
    p.set('page', '1');
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };
  const handleSearch = useDebouncedCallback((v: string) => setParam('q', v), 300);

  const handleStatus = async (id: string, status: 'new' | 'in_progress' | 'resolved') => {
    try { await updateContactStatus(id, status); toast.success(`Marked as ${status}`); router.refresh(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleSaveNotes = async (id: string, n: string) => {
    try { await saveContactNotes(id, n); toast.success('Notes saved'); router.refresh(); }
    catch (e: any) { toast.error(e.message); }
  };

  const TABS = [
    { value: '', label: `All (${counts.all})` },
    { value: 'new', label: `New (${counts.new})` },
    { value: 'resolved', label: `Resolved (${counts.resolved})` },
  ];
  const currentStatus = searchParams.get('status') || '';

  const statusColor: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <h1 className="text-2xl font-semibold mb-8">Contact Inbox</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex bg-gray-100 rounded p-1">
          {TABS.map((t) => (
            <button key={t.value} onClick={() => setParam('status', t.value)}
              className={`px-3 py-1.5 rounded text-sm ${currentStatus === t.value ? 'bg-white shadow font-medium' : 'text-gray-600'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <input type="text" placeholder="Search messages..."
          defaultValue={searchParams.get('q') || ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="px-3 py-2 border rounded text-sm w-64" />
      </div>

      <div className="space-y-3">
        {data.length === 0 ? (
          <div className="p-16 text-center border rounded bg-white text-gray-400">No submissions found.</div>
        ) : (
          data.map((sub: any) => {
            const isOpen = expanded === sub.id;
            return (
              <div key={sub.id} className="bg-white border rounded shadow-sm overflow-hidden">
                <div
                  className="p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpanded(isOpen ? null : sub.id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{sub.name}</span>
                      <a href={`mailto:${sub.email}`} className="text-sm text-[var(--admin-accent)] hover:underline" onClick={e => e.stopPropagation()}>{sub.email}</a>
                      {sub.phone && <span className="text-sm text-gray-500">{sub.phone}</span>}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${statusColor[sub.status] || 'bg-gray-100 text-gray-600'}`}>{sub.status}</span>
                    </div>
                    {sub.subject && <div className="text-sm font-medium mt-1">{sub.subject}</div>}
                    <div className="text-sm text-gray-600 mt-1 line-clamp-2">{sub.message}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {formatDistanceToNow(new Date(sub.createdAt), { addSuffix: true })}
                      {sub.orderNumber && ` · Order #${sub.orderNumber}`}
                    </div>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />}
                </div>

                {isOpen && (
                  <div className="border-t p-5 bg-gray-50 space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Full Message</div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{sub.message}</p>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Internal Notes</div>
                      <textarea
                        defaultValue={sub.internalNotes || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [sub.id]: e.target.value }))}
                        placeholder="Add private notes..."
                        className="w-full border rounded p-2 text-sm min-h-[80px] bg-white"
                      />
                      <button
                        onClick={() => handleSaveNotes(sub.id, notes[sub.id] ?? sub.internalNotes ?? '')}
                        className="mt-2 px-3 py-1.5 border rounded text-xs hover:bg-white"
                      >Save Notes</button>
                    </div>

                    <div className="flex gap-2">
                      {sub.status !== 'in_progress' && (
                        <button onClick={() => handleStatus(sub.id, 'in_progress')} className="px-3 py-1.5 border rounded text-xs hover:bg-white">Mark In Progress</button>
                      )}
                      {sub.status !== 'resolved' && (
                        <button onClick={() => handleStatus(sub.id, 'resolved')} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700">Mark Resolved</button>
                      )}
                      {sub.status !== 'new' && (
                        <button onClick={() => handleStatus(sub.id, 'new')} className="px-3 py-1.5 border rounded text-xs hover:bg-white">Reopen</button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <Pagination {...meta} />
    </div>
  );
}
