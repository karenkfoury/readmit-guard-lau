import { cn } from '@/lib/utils';

interface LAULogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'green' | 'white' | 'anthracite';
  layout?: 'stacked' | 'horizontal';
  withDescriptor?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { text: 'text-lg', desc: 'text-[9px]', gap: 'gap-1' },
  md: { text: 'text-2xl', desc: 'text-[10px]', gap: 'gap-1.5' },
  lg: { text: 'text-4xl', desc: 'text-xs', gap: 'gap-2' },
};

const colorMap = {
  green: 'text-[#006751]',
  white: 'text-white',
  anthracite: 'text-[#3A3E3F]',
};

export function LAULogo({ size = 'md', variant = 'green', layout = 'horizontal', withDescriptor = true, className }: LAULogoProps) {
  const s = sizeMap[size];
  const color = colorMap[variant];

  return (
    <div className={cn(
      layout === 'stacked' ? `flex flex-col items-center ${s.gap}` : `flex items-center ${s.gap}`,
      className,
    )}>
      <span className={cn('font-heading font-extrabold tracking-tight leading-none', s.text, color)}>
        LAU
      </span>
      {withDescriptor && (
        <span className={cn('font-body leading-tight', s.desc, color, layout === 'stacked' ? 'text-center' : '')}>
          Lebanese American University
        </span>
      )}
    </div>
  );
}

export function LAUHealthLockup({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="font-heading font-extrabold text-2xl tracking-tight text-[#006751]">LAU</span>
      <div className="w-px h-6 bg-[#D9E3DF]" />
      <span className="font-heading font-bold text-lg tracking-tight text-[#3A3E3F]">ReAdmit Guard</span>
    </div>
  );
}
