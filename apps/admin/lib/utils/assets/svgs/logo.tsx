export interface AppLogoProps {
  // 'dark' = on a light/paper background (app-bar); 'light' = on the dark nile-deep sidebar
  variant?: 'dark' | 'light';
}

export function AppLogo({ variant = 'dark' }: AppLogoProps) {
  const isLight = variant === 'light';
  const routeColor = isLight ? '#FBF7EF' : '#0D5C63';
  const wordmarkColor = isLight ? '#FBF7EF' : '#0D5C63';
  const steamColor = isLight ? '#FFB238' : '#E4572E';

  return (
    <div className="flex items-center justify-center relative p-2" dir="ltr">
      <svg
        width="150"
        height="42"
        viewBox="0 0 320 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Wasel wordmark"
        direction="ltr"
      >
        <path
          d="M4 66 C 24 66, 30 40, 52 40"
          fill="none"
          stroke={routeColor}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="1 10"
        />
        <g transform="translate(52,22)">
          <circle cx="22" cy="22" r="22" fill="#FFB238" />
          <path
            d="M16 -2 q4 -5 0 -10"
            fill="none"
            stroke={steamColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <path
            d="M27 0 q4 -5 0 -10"
            fill="none"
            stroke={steamColor}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
        </g>
        <text
          x="112"
          y="66"
          direction="ltr"
          fontFamily="'Baloo Bhaijaan 2',sans-serif"
          fontWeight="800"
          fontSize="56"
          fill={wordmarkColor}
        >
          Wasel
        </text>
      </svg>
    </div>
  );
}
