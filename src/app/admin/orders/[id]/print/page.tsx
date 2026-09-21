import { prisma } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { NotFoundError } from '@/lib/admin/errors';
import { formatMoney } from '@/lib/admin/money';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id }, { orderNumber: id }],
    },
    include: { items: true },
  });

  if (!order) throw new NotFoundError('Order', id);

  return (
    <div className="bg-white text-black min-h-screen">
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @page { size: A4; margin: 20mm; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; left: 0; top: 0; width: 100%; }
          /* Hide admin chrome if it wraps this */
          nav, aside, header { display: none !important; }
        }
      `,
        }}
      />

      <div id="print-area" className="max-w-[800px] mx-auto p-8 font-sans">
        <div className="flex justify-between items-start border-b pb-8 mb-8">
          <div>
            <h1 className="text-3xl font-[var(--font-jost)] font-semibold mb-1">THE BOMBAY EDIT</h1>
            <p className="text-gray-500 text-sm">Packing Slip</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold mb-1">Order {order.orderNumber}</h2>
            <p className="text-sm text-gray-600">
              Placed: {format(new Date(order.createdAt), 'PPP')}
            </p>
          </div>
        </div>

        <div className="flex gap-16 mb-8">
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Ship To
            </h3>
            <div className="text-sm leading-relaxed">
              <strong>
                {order.customerFirstName} {order.customerLastName}
              </strong>
              <br />
              {order.shippingAddress}
              <br />
              {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
              <br />
              {order.shippingCountry}
              <br />
              <div className="mt-2 text-gray-600">
                Email: {order.customerEmail}
                <br />
                Phone: {order.customerPhone}
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Order Details
            </h3>
            <div className="text-sm leading-relaxed">
              <strong>Payment Method:</strong>{' '}
              <span className="capitalize">{order.paymentMethod}</span>
              <br />
              <strong>Payment Status:</strong>{' '}
              <span className="capitalize">{order.paymentStatus}</span>
              <br />
              <strong>Shipping Zone:</strong> {order.shippingZoneName || '-'}
              <br />
            </div>
          </div>
        </div>

        <table className="w-full text-sm mb-8">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Item</th>
              <th className="text-left py-2">SKU</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Price</th>
              <th className="text-right py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-4">
                  <div className="font-medium">{item.productNameSnapshot}</div>
                  <div className="text-xs text-gray-500">
                    {item.size && <span className="mr-2">Size: {item.size}</span>}
                    {item.colour && <span>Color: {item.colour}</span>}
                  </div>
                </td>
                <td className="py-4 text-gray-600">{item.productSlugSnapshot || '-'}</td>
                <td className="py-4 text-center">{item.quantity}</td>
                <td className="py-4 text-right text-gray-600">
                  {formatMoney(item.unitPrice, order.currency)}
                </td>
                <td className="py-4 text-right font-medium">
                  {formatMoney(item.unitPrice * item.quantity, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end text-sm">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal, order.currency)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatMoney(order.shippingCost, order.currency)}</span>
            </div>
            <div className="flex justify-between font-bold text-base pt-2 border-t">
              <span>Total</span>
              <span>{formatMoney(order.total, order.currency)}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-xs text-gray-400">
          <p>Thank you for shopping with The Bombay Edit!</p>
          <p>If you have any questions, please contact support.</p>
        </div>
      </div>

      {/* Auto-print script for convenience */}
      <script
        dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }}
      />
    </div>
  );
}
