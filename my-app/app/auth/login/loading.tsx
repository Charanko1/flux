export default function Loading() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        {/* Logo Berdenyut */}
        <div className="h-12 w-12 bg-yellow-400 rounded-xl animate-pulse" />
        <p className="text-gray-500 text-sm font-medium animate-pulse">Preparing your flow...</p>
      </div>
    </div>
  );
}