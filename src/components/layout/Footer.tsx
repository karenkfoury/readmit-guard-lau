import { LAULogo } from '@/components/brand/LAULogo';

export function Footer() {
  return (
    <footer className="bg-lau-bg border-t border-lau-border">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <LAULogo size="sm" layout="stacked" variant="anthracite" className="items-start" />
            <p className="text-sm text-muted-foreground font-body mt-3 leading-relaxed">
              An LAU Health initiative preventing 30-day hospital readmissions through AI-driven post-discharge monitoring.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm font-body text-muted-foreground">
              <li><a href="/" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="/" className="hover:text-primary transition-colors">How it works</a></li>
              <li><a href="/login" className="hover:text-primary transition-colors">For Doctors</a></li>
              <li><a href="/login" className="hover:text-primary transition-colors">For Patients</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-3">Contact</h4>
            <p className="text-sm text-muted-foreground font-body leading-relaxed">
              Affiliated with the Lebanese American University
            </p>
          </div>
        </div>
        <div className="border-t border-lau-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground font-body">
            © 2026 Lebanese American University. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 font-body">
            Built for the LAU Health Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
}
