const Accent = () => (
  <>
    <circle cx="64" cy="38" r="5" fill="#A7F3D0" />
    <path d="M306 50l8 8-8 8-8-8 8-8z" fill="#86EFAC" />
    <path d="M52 224l10 4-10 4-4 10-4-10-10-4 10-4 4-10 4 10z" fill="#BBF7D0" />
  </>
);

export function HeroCarpool() {
  return (
    <svg viewBox="0 0 380 300" className="h-full w-full" role="img" aria-label="Employees sharing an eco-friendly car ride">
      <Accent />
      <path d="M72 216c35-58 63-84 112-72 51 13 82-42 126-10 40 29 20 89-31 108-62 23-163 28-207-26z" fill="#D9F0E3" />
      <path d="M71 206c24-38 63-62 114-64 60-2 101 28 127 62" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeDasharray="9 9" />
      <path d="M103 191l31-43c7-9 16-14 28-14h72c12 0 22 6 29 16l27 41" fill="#16A34A" />
      <rect x="82" y="177" width="229" height="58" rx="28" fill="#059669" />
      <path d="M150 146h42v35h-66l20-28c1-3 3-5 4-7zm54 0h30c5 0 10 3 13 7l18 28h-61v-35z" fill="#EAF6EF" />
      <circle cx="129" cy="235" r="20" fill="#0F172A" />
      <circle cx="264" cy="235" r="20" fill="#0F172A" />
      <circle cx="129" cy="235" r="8" fill="#EAF6EF" />
      <circle cx="264" cy="235" r="8" fill="#EAF6EF" />
      <circle cx="128" cy="96" r="18" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
      <path d="M115 131c6-21 30-21 37 0" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <circle cx="250" cy="93" r="18" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
      <path d="M236 128c7-20 30-20 37 0" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <path d="M107 88c-2-24 37-25 41-3" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
      <path d="M231 83c11-21 43-7 37 15" stroke="#059669" strokeWidth="4" strokeLinecap="round" />
      <path d="M58 147c0-16 28-16 28 0 0 15-14 28-14 28s-14-13-14-28z" fill="#34D399" />
      <circle cx="72" cy="147" r="5" fill="white" />
      <path d="M310 98c0-15 26-15 26 0 0 14-13 26-13 26s-13-12-13-26z" fill="#10B981" />
      <circle cx="323" cy="98" r="5" fill="white" />
    </svg>
  );
}

export function DriverIllustration() {
  return (
    <svg viewBox="0 0 260 200" className="h-full w-full" role="img" aria-label="Driver with route">
      <path d="M40 150c23-47 57-75 102-65 45 9 68 37 85 64-44 31-136 31-187 1z" fill="#D9F0E3" />
      <rect x="52" y="118" width="154" height="42" rx="21" fill="#16A34A" />
      <path d="M72 119l19-25h73l22 25" fill="#059669" />
      <path d="M95 96h29v23H78l13-18c1-3 2-4 4-5zm38 0h27l17 23h-44V96z" fill="#ECFDF5" />
      <circle cx="86" cy="160" r="13" fill="#0F172A" /><circle cx="173" cy="160" r="13" fill="#0F172A" />
      <circle cx="129" cy="56" r="18" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
      <path d="M108 86c9-18 34-18 43 0" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 60c38-29 93-33 153-11" stroke="#059669" strokeWidth="3" strokeDasharray="7 8" strokeLinecap="round" />
      <path d="M201 44l11 6-11 6" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PassengerIllustration() {
  return (
    <svg viewBox="0 0 260 200" className="h-full w-full" role="img" aria-label="Passenger selecting a ride">
      <path d="M42 151c24-49 62-76 113-60 44 13 58 42 67 65-50 26-134 26-180-5z" fill="#D9F0E3" />
      <path d="M56 134c40-35 87-39 142-8" stroke="#059669" strokeWidth="3" strokeDasharray="8 8" fill="none" strokeLinecap="round" />
      <path d="M70 90c0-24 40-24 40 0 0 22-20 42-20 42S70 112 70 90z" fill="#16A34A" />
      <circle cx="90" cy="91" r="7" fill="white" />
      <circle cx="168" cy="62" r="20" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3" />
      <path d="M146 100c11-23 34-23 45 0" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" />
      <rect x="121" y="126" width="91" height="36" rx="18" fill="#10B981" />
      <path d="M142 126l12-18h35l14 18" fill="#059669" />
      <circle cx="145" cy="162" r="10" fill="#0F172A" /><circle cx="193" cy="162" r="10" fill="#0F172A" />
    </svg>
  );
}

export function EmptyStateIllustration() {
  return (
    <svg viewBox="0 0 260 190" className="h-full w-full" role="img" aria-label="Empty route state">
      <path d="M49 145c27-45 57-66 99-58 39 8 62 31 73 57-42 25-126 28-172 1z" fill="#D9F0E3" />
      <path d="M63 127c35-37 78-44 134-19" stroke="#059669" strokeWidth="3" strokeDasharray="7 9" fill="none" strokeLinecap="round" />
      <path d="M67 88c0-18 31-18 31 0 0 17-16 32-16 32S67 105 67 88z" fill="#34D399" />
      <path d="M173 83c0-18 31-18 31 0 0 17-16 32-16 32s-15-15-15-32z" fill="#10B981" />
      <circle cx="82" cy="88" r="5" fill="white" /><circle cx="188" cy="83" r="5" fill="white" />
      <rect x="88" y="128" width="82" height="30" rx="15" fill="#16A34A" />
      <circle cx="105" cy="158" r="9" fill="#0F172A" /><circle cx="153" cy="158" r="9" fill="#0F172A" />
      <path d="M123 57l7 7-7 7-7-7 7-7z" fill="#86EFAC" />
    </svg>
  );
}
