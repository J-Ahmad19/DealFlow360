export function Footer() {
  return (
    <footer className="border-t border-rule bg-cadence/50 paper-grain">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-accent rounded-control flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-lg font-bold text-ink tracking-tight">
                DealFlow<span className="text-accent">360</span>
              </span>
            </a>
            <p className="text-sm text-ink-muted leading-relaxed">
              The intelligent sales command desk for B2B operations.
              Precise, editorial, and enterprise-ready.
            </p>
          </div>

          {/* Links */}
          {[
            {
              title: 'Product',
              links: ['Quotation Builder', 'Approval Workflow', 'Deal Health', 'Billing', 'API'],
            },
            {
              title: 'Company',
              links: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
            },
            {
              title: 'Support',
              links: ['Documentation', 'Help Center', 'Status', 'Contact', 'Security'],
            },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-bold text-ink uppercase tracking-widest mb-4">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-ink-muted hover:text-accent transition-colors duration-150"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-rule flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-ink-faint">
            &copy; 2026 DealFlow360. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((link) => (
              <a
                key={link}
                href="#"
                className="text-xs text-ink-faint hover:text-accent transition-colors"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
