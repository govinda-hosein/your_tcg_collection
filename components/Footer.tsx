import { Code } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card/50">
      <div className="mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6 lg:px-8">
        <a
          href="https://github.com/govinda-hosein/your_tcg_collection"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-center transition-colors hover:bg-primary/10 group"
        >
          <Code className="h-3.5 w-3.5 text-primary group-hover:text-primary/80" />
          <span className="text-xs font-medium text-primary group-hover:text-primary/80">
            Built with ❤️ - Want your own collection site? Click here to check
            out the repo on GitHub!
          </span>
        </a>
      </div>
    </footer>
  );
}
