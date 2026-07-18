export default function IllustrationBlob({ children, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-[2rem] bg-[#EAF6EF] ${className}`}>
      <div className="absolute -left-12 top-8 h-56 w-56 rounded-[45%_55%_60%_40%] bg-[#D9F0E3] blur-2xl" />
      <div className="absolute -right-16 bottom-4 h-72 w-72 rounded-[60%_40%_45%_55%] bg-emerald-100/80 blur-2xl" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
