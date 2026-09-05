const footerLinks = {
  Product: ['Features', 'Workflow', 'Integrations', 'Pricing', 'Changelog'],
  Company: ['About', 'Careers', 'Blog', 'Press', 'Partners'],
  Resources: ['Documentation', 'API Reference', 'Guides', 'Community', 'Status'],
  Legal: ['Privacy', 'Terms', 'Security', 'GDPR', 'Cookies'],
};

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">D</span>
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                Deal<span className="text-brand-400">Flow</span>360
              </span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-[240px]">
              The intelligent sales operations platform that manages the complete deal lifecycle.
            </p>
            <div className="flex items-center gap-3">
              {['X', 'Li', 'Gh'].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs font-bold text-slate-400">{social}</span>
                </a>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm font-bold text-white mb-4 tracking-wide">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © {new Date().getFullYear()} DealFlow360. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-400 transition-colors">
              Cookie Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
