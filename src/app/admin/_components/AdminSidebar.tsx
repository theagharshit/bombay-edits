'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Package,
  Layers,
  FolderTree,
  BarChart2,
  ShoppingCart,
  Users,
  Tag,
  Home,
  Menu,
  FileText,
  Image,
  Star,
  Mail,
  Send,
  Store,
  Truck,
  DollarSign,
  List,
  UserCog,
  ScrollText,
  LogOut,
} from 'lucide-react';

type NavItem = { name: string; href: string; icon: React.ElementType; exact?: boolean };
type NavGroup = { label: string | null; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [{ name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'CATALOG',
    items: [
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Collections', href: '/admin/collections', icon: Layers },
      { name: 'Categories', href: '/admin/categories', icon: FolderTree },
      { name: 'Inventory', href: '/admin/inventory', icon: BarChart2 },
    ],
  },
  {
    label: 'SALES',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Customers', href: '/admin/customers', icon: Users },
      { name: 'Discounts', href: '/admin/discounts', icon: Tag },
    ],
  },
  {
    label: 'CONTENT',
    items: [
      { name: 'Homepage', href: '/admin/homepage', icon: Home },
      { name: 'Navigation', href: '/admin/navigation', icon: Menu },
      { name: 'Pages', href: '/admin/pages', icon: FileText },
      { name: 'Media', href: '/admin/media', icon: Image },
    ],
  },
  {
    label: 'ENGAGE',
    items: [
      { name: 'Reviews', href: '/admin/reviews', icon: Star },
      { name: 'Contact Inbox', href: '/admin/contact', icon: Mail },
      { name: 'Newsletter', href: '/admin/newsletter', icon: Send },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { name: 'Store Details', href: '/admin/settings/store', icon: Store },
      { name: 'Shipping Zones', href: '/admin/settings/shipping', icon: Truck },
      { name: 'Currencies', href: '/admin/settings/currencies', icon: DollarSign },
      { name: 'Taxonomies', href: '/admin/settings/taxonomies', icon: List },
      { name: 'Admin Users', href: '/admin/settings/users', icon: UserCog },
      { name: 'Audit Log', href: '/admin/settings/audit', icon: ScrollText },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <div className="w-60 flex-shrink-0 border-r border-[var(--admin-border)] bg-[var(--admin-panel)] flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="h-14 flex items-center px-5 border-b border-[var(--admin-border)] flex-shrink-0">
        <span className="font-semibold text-base tracking-tight text-[var(--admin-text)]">
          The Bombay Edit
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="px-3 mb-1 text-[10px] font-semibold tracking-widest text-[var(--admin-text-faint)] uppercase">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-[var(--admin-radius)] text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[var(--admin-surface)] text-[var(--admin-text)]'
                        : 'text-[var(--admin-text-mute)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)]'
                    }`}
                  >
                    <item.icon
                      className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[var(--admin-accent)]' : ''}`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-3 border-t border-[var(--admin-border)] flex-shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: '/admin/login' })}
          className="flex items-center gap-2.5 px-3 py-2 w-full text-sm font-medium text-[var(--admin-text-mute)] hover:text-[var(--admin-danger)] hover:bg-[var(--admin-surface)] transition-colors rounded-[var(--admin-radius)]"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
