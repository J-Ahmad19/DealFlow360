import { Navbar } from './components/Navbar';
import { Hero } from './components/sections/Hero';
import { DealJourney } from './components/sections/DealJourney';
import { SignatureComponents } from './components/sections/SignatureComponents';
import { Features } from './components/sections/Features';
import { CTASection } from './components/sections/CTASection';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main>
        <Hero />
        <DealJourney />
        <SignatureComponents />
        <Features />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

export default App;
