export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {children}
    </div>
  );
}
