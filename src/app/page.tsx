import HeaderAnalyzer from "@/components/header-analyzer";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-accent-foreground">
            Header Analyzer
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Paste an email header or full .eml content to analyze its security and trace its path.
          </p>
        </div>
        <HeaderAnalyzer />
      </div>
    </main>
  );
}
