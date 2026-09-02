export default function Loading() {
  return (
    <div className="min-h-[60vh] w-full flex flex-col items-center justify-center bg-cream/30 py-24 px-6">
      {/* Brand monogram animation */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-champagne-gold/30 border-t-champagne-gold animate-spin rounded-full" />
        <span className="absolute font-display text-xl text-dark-espresso tracking-widest font-light">
          TBE
        </span>
      </div>

      <p className="font-display text-lg text-dark-espresso tracking-[0.2em] uppercase animate-pulse">
        The Bombay Edit
      </p>
      <span className="text-[11px] text-muted-taupe uppercase tracking-[0.16em] mt-2 font-body">
        Loading the chronicle of style...
      </span>

      {/* Subtle skeleton placeholder grid */}
      <div className="w-full max-w-4xl mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 opacity-40">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] bg-sand/60 animate-pulse border border-beige-line" />
            <div className="h-4 bg-sand/80 w-3/4 animate-pulse" />
            <div className="h-3 bg-sand/50 w-1/2 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
