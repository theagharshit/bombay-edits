import { prisma } from '@/backend/db/prisma';
import { isPrismaConnected } from '@/backend/db/prisma';
import { requireAdmin } from '@/lib/admin/auth';
import { formatMoney } from '@/lib/admin/money';
import Link from 'next/link';
import { ShoppingCart, Users, AlertTriangle, TrendingUp, Clock, DatabaseZap } from 'lucide-react';
import { format, startOfDay, subDays } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await requireAdmin();

  // Check database connectivity first
  const dbConnected = await isPrismaConnected();

  if (!dbConnected) {
    return (
      <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
          <DatabaseZap className="w-10 h-10 text-amber-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-amber-800 mb-2">Database Unavailable</h2>
          <p className="text-sm text-amber-700 max-w-md mx-auto mb-4">
            Cannot connect to PostgreSQL at <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">localhost:5432</code>.
            Please ensure the database server is running and the <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">DATABASE_URL</code> in your <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs">.env</code> is correct.
          </p>
          <div className="text-xs text-amber-600 bg-amber-100 rounded p-3 font-mono max-w-lg mx-auto text-left">
            brew services start postgresql@17<br />
            createdb bombay_edits<br />
            npx prisma db push
          </div>
        </div>
      </div>
    );
  }

  const today = startOfDay(new Date());
  const yesterday = startOfDay(subDays(new Date(), 1));
  const last30 = subDays(new Date(), 30);

  const [
    todayOrders,
    yesterdayOrders,
    openOrders,
    last30Revenue,
    totalCustomers,
    lowStockProducts,
    pendingReviews,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({ where: { createdAt: { gte: today }, status: { not: 'cancelled' } }, _sum: { total: true }, _count: { id: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: yesterday, lt: today }, status: { not: 'cancelled' } }, _sum: { total: true }, _count: { id: true } }),
    prisma.order.count({ where: { status: { in: ['new', 'confirmed'] } } }),
    prisma.order.aggregate({ where: { createdAt: { gte: last30 }, status: { not: 'cancelled' } }, _sum: { total: true } }),
    prisma.customer.count(),
    prisma.productSizeStock.findMany({
      where: { stockQuantity: { lte: 3 } },
      include: { product: { select: { id: true, name: true, lowStockThreshold: true } }, size: true },
      take: 10,
    }),
    prisma.review.count({ where: { status: 'PENDING' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: { id: true, orderNumber: true, customerFirstName: true, customerLastName: true, total: true, currency: true, status: true, createdAt: true },
    }),
  ]);

  const todaySales = todayOrders._sum.total || 0;
  const todayCount = todayOrders._count.id;
  const yesterdaySales = yesterdayOrders._sum.total || 0;
  const pctChange = yesterdaySales > 0 ? Math.round(((todaySales - yesterdaySales) / yesterdaySales) * 100) : 0;

  const STATUS_COLORS: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-yellow-100 text-yellow-700',
    shipped: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Today's Revenue</span>
            <TrendingUp className="w-4 h-4 text-gray-300" />
          </div>
          <div className="text-2xl font-bold">{formatMoney(todaySales, 'NPR')}</div>
          <div className="text-xs text-gray-500 mt-1">
            {todayCount} orders
            {yesterdaySales > 0 && (
              <span className={`ml-2 font-medium ${pctChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {pctChange >= 0 ? '+' : ''}{pctChange}% vs yesterday
              </span>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Open Orders</span>
            <ShoppingCart className="w-4 h-4 text-gray-300" />
          </div>
          <div className="text-2xl font-bold">{openOrders}</div>
          <Link href="/admin/orders?status=new" className="text-xs text-[var(--admin-accent)] hover:underline mt-1 block">View new orders →</Link>
        </div>

        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">30-Day Revenue</span>
            <TrendingUp className="w-4 h-4 text-gray-300" />
          </div>
          <div className="text-2xl font-bold">{formatMoney(last30Revenue._sum.total || 0, 'NPR')}</div>
          <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
        </div>

        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Customers</span>
            <Users className="w-4 h-4 text-gray-300" />
          </div>
          <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
          <Link href="/admin/customers" className="text-xs text-[var(--admin-accent)] hover:underline mt-1 block">View all →</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-[var(--admin-accent)] hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y">
              {recentOrders.length === 0 ? (
                <tr><td className="py-12 text-center text-gray-400">No orders yet.</td></tr>
              ) : (
                recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-3 px-5">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-[var(--admin-accent)] hover:underline">
                        {order.orderNumber}
                      </Link>
                      <div className="text-xs text-gray-400">{order.customerFirstName} {order.customerLastName}</div>
                    </td>
                    <td className="py-3 px-5 font-medium text-right">{formatMoney(order.total, order.currency)}</td>
                    <td className="py-3 px-5 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Alerts */}
        <div className="space-y-4">
          {/* Low Stock */}
          <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Low Stock
              </h2>
              <Link href="/admin/inventory" className="text-xs text-[var(--admin-accent)] hover:underline">Manage</Link>
            </div>
            <div className="divide-y">
              {lowStockProducts.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">All good! No low stock.</div>
              ) : (
                lowStockProducts.map((s: any) => (
                  <div key={s.id} className="px-5 py-3 flex items-center justify-between gap-2">
                    <div>
                      <Link href={`/admin/products/${s.productId}`} className="text-sm font-medium hover:underline text-[var(--admin-accent)]">{s.product.name}</Link>
                      <div className="text-xs text-gray-400">Size: {s.size.sizeCode}</div>
                    </div>
                    <span className={`text-sm font-bold ${s.stockQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>{s.stockQuantity}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Reviews */}
          {pendingReviews > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <div className="font-semibold text-amber-800">{pendingReviews} review{pendingReviews > 1 ? 's' : ''} awaiting moderation</div>
                <Link href="/admin/reviews?status=PENDING" className="text-xs text-amber-700 hover:underline">Review now →</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
