export default function Logo({ size = 32, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="pagepeek-logo-grad"
          x1="0"
          y1="0"
          x2="36"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2563eb" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>

      <rect width="36" height="36" rx="9" fill="url(#pagepeek-logo-grad)" />

      <rect
        x="6.5"
        y="7.5"
        width="23"
        height="21"
        rx="3.5"
        fill="white"
        fillOpacity="0.14"
        stroke="white"
        strokeWidth="1.5"
      />

      <line
        x1="6.5"
        y1="13.5"
        x2="29.5"
        y2="13.5"
        stroke="white"
        strokeWidth="1"
        strokeOpacity="0.4"
      />

      <circle cx="10" cy="10.5" r="1.1" fill="white" fillOpacity="0.95" />
      <circle cx="13" cy="10.5" r="1.1" fill="white" fillOpacity="0.6" />
      <circle cx="16" cy="10.5" r="1.1" fill="white" fillOpacity="0.6" />

      <circle
        cx="18"
        cy="20.5"
        r="3.8"
        stroke="white"
        strokeWidth="1.4"
      />
      <circle cx="18" cy="20.5" r="1.4" fill="white" />

      <path
        d="M10.5 17.5v-1.5h1.5M25.5 17.5v-1.5h-1.5M10.5 23.5v1.5h1.5M25.5 23.5v1.5h-1.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.8"
      />
    </svg>
  );
}
