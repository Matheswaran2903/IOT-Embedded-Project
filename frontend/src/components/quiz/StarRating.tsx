import { Star } from 'lucide-react';

export default function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="mb-3">
      <p className="mb-1 text-sm font-medium">{label}</p>
      <div className="flex gap-1" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)}>
            <Star size={28} className={n <= value ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500 hover:text-yellow-300'} />
          </button>
        ))}
      </div>
    </div>
  );
}
