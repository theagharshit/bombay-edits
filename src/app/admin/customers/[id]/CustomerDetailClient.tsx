'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatMoney } from '@/lib/admin/money';
import { anonymiseCustomer } from '@/app/actions/admin/customers';
import { toast } from 'sonner';
import { formatDistanceToNow, format } from 'date-fns';
import { ConfirmDialog } from '@/app/admin/_components/ConfirmDialog';

type CustomerDetailProps = {
  customer: any;
  stats: any;
  isOwner: boolean;
};

export function CustomerDetailClient({ customer, stats, isOwner }: CustomerDetailProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAnonymise = async () => {
    setIsProcessing(true);
    try {
      await anonymiseCustomer(customer.id);
      toast.success('Customer successfully anonymised');
    } catch (err: any) {
      toast.error(err.message || 'Failed to anonymise customer');
    } finally {
      setIsProcessing(false);
    }
  };

  const isAnonymised = customer.firstName === 'Deleted' && customer.email.includes('anonymised.local');

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/customers" className="text-gray-500 hover:text-black">← Back</Link>
          <h1 className="text-2xl font-[var(--font-jost)] font-semibold">
            {customer.firstName} {customer.lastName}
          </h1>
          {isAnonymised && (
            <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs font-medium rounded-full uppercase tracking-wider">Anonymised</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOwner && !isAnonymised && (
            <ConfirmDialog 
              trigger={<button className="px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 text-sm">Anonymise Customer</button>}
              title="Anonymise Customer"
              description="This will permanently delete their PII (name, email, phone, addresses) but retain order history for reporting. This cannot be undone."
              confirmLabel="Anonymise"
              onConfirm={handleAnonymise}
            />
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* LEFT MAIN COLUMN */}
        <div className="w-full md:w-2/3 flex flex-col gap-6">
          
          {/* STATS HEADER */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">LTV</div>
              <div className="text-xl font-semibold">{formatMoney(stats.ltv, 'NPR')}</div>
            </div>
            <div className="bg-white border rounded p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Orders</div>
              <div className="text-xl font-semibold">{stats.orderCount}</div>
            </div>
            <div className="bg-white border rounded p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">AOV</div>
              <div className="text-xl font-semibold">{formatMoney(stats.aov, 'NPR')}</div>
            </div>
            <div className="bg-white border rounded p-4 text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Last Order</div>
              <div className="text-xl font-semibold">
                {stats.lastOrderDate ? formatDistanceToNow(new Date(stats.lastOrderDate), { addSuffix: true }) : '-'}
              </div>
            </div>
          </div>

          {/* ORDER HISTORY */}
          <div className="bg-white border rounded shadow-sm overflow-hidden">
            <h2 className="text-lg font-semibold p-5 border-b">Order History</h2>
            {customer.orders.length === 0 ? (
              <div className="p-5 text-gray-500 text-sm text-center">No orders placed yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-5 font-medium text-gray-500">Order</th>
                    <th className="text-left py-3 px-5 font-medium text-gray-500">Date</th>
                    <th className="text-center py-3 px-5 font-medium text-gray-500">Items</th>
                    <th className="text-right py-3 px-5 font-medium text-gray-500">Total</th>
                    <th className="text-right py-3 px-5 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {customer.orders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 px-5">
                        <Link href={`/admin/orders/${order.id}`} className="text-[var(--admin-accent)] hover:underline font-medium">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-5 text-gray-600">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                      <td className="py-3 px-5 text-center text-gray-600">{order.items.length}</td>
                      <td className="py-3 px-5 text-right font-medium">{formatMoney(order.total, order.currency)}</td>
                      <td className="py-3 px-5 text-right">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-[10px] uppercase tracking-wider font-medium">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* REVIEWS */}
          <div className="bg-white border rounded shadow-sm overflow-hidden">
            <h2 className="text-lg font-semibold p-5 border-b">Reviews Written</h2>
            {customer.reviews.length === 0 ? (
              <div className="p-5 text-gray-500 text-sm text-center">No reviews written.</div>
            ) : (
              <div className="divide-y">
                {customer.reviews.map((review: any) => (
                  <div key={review.id} className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <Link href={`/admin/products/${review.productId}`} className="font-medium text-[var(--admin-accent)] hover:underline">
                        {review.product?.name || 'Product'}
                      </Link>
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                      </div>
                    </div>
                    <div className="text-sm font-medium">{review.title}</div>
                    <div className="text-sm text-gray-600 mt-1 italic">"{review.body}"</div>
                    <div className="text-xs text-gray-400 mt-2">{format(new Date(review.createdAt), 'MMM d, yyyy')} • {review.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          
          {/* PROFILE CARD */}
          <div className="bg-white border rounded shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Profile</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">Email</span>
                {isAnonymised ? <span className="italic text-gray-400">{customer.email}</span> : <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">{customer.email}</a>}
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Phone</span>
                {customer.phone ? <span>{customer.phone}</span> : <span className="italic text-gray-400">Not provided</span>}
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Joined</span>
                <span>{format(new Date(customer.createdAt), 'MMMM d, yyyy')}</span>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Newsletter Subscribed</span>
                <span>TODO: Map to Mailchimp/Newsletter model</span>
              </div>
            </div>
          </div>

          {/* ADDRESSES */}
          <div className="bg-white border rounded shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Addresses</h2>
            {customer.addresses.length === 0 ? (
              <p className="text-sm text-gray-500">No saved addresses.</p>
            ) : (
              <div className="space-y-4">
                {customer.addresses.map((address: any) => (
                  <div key={address.id} className="text-sm border rounded p-3 bg-gray-50">
                    {address.isDefault && <div className="text-xs font-semibold text-[var(--admin-accent)] mb-1">Default</div>}
                    <div>{address.addressLine1}</div>
                    {address.addressLine2 && <div>{address.addressLine2}</div>}
                    <div>{address.city}, {address.state} {address.postalCode}</div>
                    <div>{address.country}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* WISHLIST (STUB, wishlistData is json) */}
          <div className="bg-white border rounded shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Wishlist</h2>
            <div className="text-sm text-gray-500">
              {/* If using json wishlistData, would parse it. Assuming WishlistItem relations exist but wait, customer has wishlistItems in schema? */}
              {customer.wishlistItems ? `${customer.wishlistItems.length} items in wishlist` : '0 items'}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
