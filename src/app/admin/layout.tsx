import './admin.css';
import AdminSessionProvider from './AdminSessionProvider';
import { AdminShell } from './_components/AdminShell';

export const metadata = {
  title: 'Operator Admin | The Bombay Edit',
};

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <AdminShell>{children}</AdminShell>
    </AdminSessionProvider>
  );
}
