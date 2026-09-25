// ============================================================
// RIMA AI — Composant : Indicateur de chargement
// ============================================================
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export default function LoadingSpinner({ size = 'md', message, className }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-6 h-6', md: 'w-12 h-12', lg: 'w-20 h-20' };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div className={cn('relative', sizes[size])}>
        {/* Cercle extérieur animé */}
        <div className={cn(
          'absolute inset-0 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin',
          sizes[size]
        )} />
        {/* Cercle intérieur pulse */}
        <div className={cn(
          'absolute inset-2 rounded-full bg-primary-100 animate-pulse',
        )} />
      </div>
      {message && (
        <p className="text-center text-gray-600 font-medium text-lg animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
