import { Plane } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Plane size={18} />
          <span>AVIATOR PRO</span>
        </div>
        <p className="footer-disclaimer">18+ | Play Responsibly | Gambling can be addictive.</p>
        <p className="footer-copy">© 2024 AviatorPro. All rights reserved.</p>
      </div>
    </footer>
  );
}