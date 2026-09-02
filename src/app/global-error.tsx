'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          backgroundColor: '#F6EDE6',
          color: '#2A1C15',
          fontFamily: 'Georgia, serif',
          margin: 0,
          padding: 0,
        }}
      >
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '36px',
              fontWeight: 'normal',
              marginBottom: '16px',
              color: '#2A1C15',
            }}
          >
            The Bombay Edit
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#5B3721',
              maxWidth: '400px',
              marginBottom: '32px',
              lineHeight: '1.6',
            }}
          >
            A critical interruption occurred. Please refresh or attempt recovery.
          </p>
          <button
            onClick={() => reset()}
            style={{
              backgroundColor: '#2A1C15',
              color: '#F6EDE6',
              border: 'none',
              padding: '12px 32px',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.18em',
              cursor: 'pointer',
            }}
          >
            Reload Experience
          </button>
        </div>
      </body>
    </html>
  );
}
