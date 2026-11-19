export default function StoreLoading() {
  return (
    <main className="min-h-screen bg-white">
      <div className="h-20 border-b border-primary/10" />
      <div className="skeleton h-[29rem] w-full" />
      <div className="container-page py-16">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="skeleton h-96 rounded-card" />
          ))}
        </div>
      </div>
    </main>
  );
}
