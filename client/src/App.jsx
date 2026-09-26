import { useState } from 'react';
import GrainOverlay from './components/GrainOverlay.jsx';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import WorkGrid from './components/WorkGrid.jsx';
import PhotoGallery from './components/PhotoGallery.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import ContactModal from './components/ContactModal.jsx';
import { useSiteData } from './hooks/useSiteData.js';

export default function App() {
  const { data } = useSiteData();
  const { site, work, about, photography } = data;
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <GrainOverlay />

      <Header
  markInitials={site.markInitials}
  markSuffix={site.markSuffix}
  onContactClick={() => setContactOpen(true)}
  instagram={site.social?.instagram}
/>

      <Hero hero={site.hero} />

      <Marquee items={site.marquee} />

      <WorkGrid categories={work} />

      <PhotoGallery photography={photography} />

      <About about={about} />

      <Contact contact={site.contact} />

      <Footer
        markInitials={site.markInitials}
        markSuffix={site.markSuffix}
        social={site.social}
      />

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
