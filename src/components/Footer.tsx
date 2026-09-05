const footerLinks = {
  Product: ['Features', 'Workflow', 'Integrations', 'Pricing', 'Changelog'],
  Company: ['About', 'Careers', 'Blog', 'Press', 'Partners'],
  Resources: ['Documentation', 'API Reference', 'Guides', 'Community', 'Status'],
  Legal: ['Privacy', 'Terms', 'Security', 'GDPR', 'Cookies'],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-brand-500 flex items-center justify-center border-b-4 border-brand-600">
                <span className="text-white font-display font-black text-base">D</span>
              </div>
              <span className="font-display font-black text-xl text-white tracking-tight">
                Deal<span className="text-brand-400">Flow</span>360
              </span>
            </a>
            <p className="text-sm font-bold text-slate-500 leading-relaxed mb-6 max-w-[240px]">
              The intelligent sales operations platform that manages the complete deal lifecycle.
            </p>
            <div className="flex items-center gap-3">
              {['X', 'Li', 'Gh'].map((social, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label={social}
                  className="w-10 h-10 rounded-[14px] bg-slate-800 hover:bg-brand-500 border-2 border-slate-700 hover:border-brand-600 flex items-center justify-center transition-all duration-200 font-black text-xs text-slate-400 hover:text-white"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display text-sm font-black text-white mb-5 uppercase tracking-widest">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm font-bold text-slate-500 hover:text-brand-400 transition-colors"
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
        <div className="border-t-2 border-slate-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-slate-600">
            © {new Date().getFullYear()} DealFlow360. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((item) => (
              <a key={item} href="#" className="text-sm font-bold text-slate-600 hover:text-brand-400 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
