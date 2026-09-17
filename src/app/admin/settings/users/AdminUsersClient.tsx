'use client';
import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { UserCheck, UserX } from 'lucide-react';

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-purple-100 text-purple-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  STAFF: 'bg-gray-100 text-gray-700',
};

export function AdminUsersClient({ users }: { users: any[] }) {
  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto pb-32">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Admin Users</h1>
        <p className="text-sm text-gray-500 mt-1">Manage who can access the admin panel. User creation is done via the CLI or database for security.</p>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-500">User</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Role</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Last Login</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Created</th>
              <th className="text-center py-3 px-4 font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.length === 0 ? (
              <tr><td colSpan={5} className="py-16 text-center text-gray-400">No admin users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{u.name}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden md:table-cell">
                    {u.lastLoginAt ? formatDistanceToNow(new Date(u.lastLoginAt), { addSuffix: true }) : 'Never'}
                  </td>
                  <td className="py-3 px-4 text-gray-500 hidden lg:table-cell">
                    {format(new Date(u.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {u.isActive ? (
                      <span className="flex items-center justify-center gap-1 text-green-600 text-xs"><UserCheck className="w-3.5 h-3.5" /> Active</span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-red-500 text-xs"><UserX className="w-3.5 h-3.5" /> Inactive</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
        <strong>Note:</strong> Admin user creation and role changes are restricted to database-level operations for security.
        Contact a developer to add or modify admin accounts.
      </div>
    </div>
  );
}
