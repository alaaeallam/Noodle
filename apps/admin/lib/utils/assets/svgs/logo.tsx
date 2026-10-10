export interface AppLogoProps {
  // 'dark' = on a light/paper background (app-bar); 'light' = on the dark nile-deep sidebar
  variant?: 'dark' | 'light';
}

// BTB (Between The Buns) brand mark — same Anton "BTB" square as the store
// app's BrandMark (apps/store/lib/ui/screens/login/index.tsx).
export function AppLogo({ variant = 'dark' }: AppLogoProps) {
  const isLight = variant === 'light';
  const squareColor = isLight ? '#FF1D02' : '#0A0A0A';
  const labelColor = isLight ? '#FFFFFF' : '#0A0A0A';

  return (
    <div
      className="relative flex items-center justify-center gap-2 p-2"
      dir="ltr"
      role="img"
      aria-label="BTB Admin"
    >
      <div
        className="flex h-10 w-10 items-center justify-center"
        style={{ backgroundColor: squareColor }}
      >
        <span
          className="font-brand text-[15px] leading-none tracking-wide"
          style={{ color: '#FFFFFF' }}
        >
          BTB
        </span>
      </div>
      <span
        className="font-brand text-[18px] uppercase leading-none tracking-wider"
        style={{ color: labelColor }}
      >
        Admin
      </span>
    </div>
  );
}
