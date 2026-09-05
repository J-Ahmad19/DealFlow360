import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Workflow from './components/Workflow';
import Benefits from './components/Benefits';
import Metrics from './components/Metrics';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white font-display">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Workflow />
        <Benefits />
        <Metrics />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
