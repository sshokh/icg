export default function QuestionsLayout({
  children,
}) {
  return (
    <section className="flex flex-col items-center w-full my-16 gap-4 py-8 md:py-10">
      <div className="inline-block w-full max-w-2xl text-center justify-center">
        {children}
      </div>
    </section>
  );
}
