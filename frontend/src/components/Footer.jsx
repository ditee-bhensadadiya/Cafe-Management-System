export default function Footer() {
  return (
    <footer className="mt-24 border-t border-secondary/20 bg-cream dark:bg-espresso">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="steam-divider mb-6">
          <span /><span /><span /><span /><span />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-display text-xl font-semibold text-primary dark:text-secondary">Brew &amp; Co.</span>
          <p className="max-w-md text-sm text-espresso/60 dark:text-cream/50">
            Small-batch coffee, fresh bakes, and honest hospitality — made to order, every time.
          </p>
          <p className="mt-4 text-xs text-espresso/40 dark:text-cream/30">
            © {new Date().getFullYear()} Brew &amp; Co. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
