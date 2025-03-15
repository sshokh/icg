export default function AuthLayout({ children }) {
  return (
    <section className="flex flex-col items-center w-full gap-4">
      <div className="inline-block w-full max-w-2xl text-center justify-center">
        {children}
      </div>
    </section>
  );
}
