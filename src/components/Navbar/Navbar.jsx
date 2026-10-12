
import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={`navbar ${menuOpen ? "menu-open" : ""}`}>
      <div className="container">
        <div className="row navbar-row">

          {/* LOGO */}
          <div className="span-3 navbar-brand">
            <a href="#home" className="logo" onClick={closeMenu}>
              NEXORA
            </a>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="span-6 navbar-navigation">
            <nav className="nav-links">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#services">Services</a>
              <a href="#work">Work</a>
            </nav>
          </div>

          {/* DESKTOP CONTACT + MOBILE HAMBURGER */}
          <div className="span-3 navbar-actions">
            <a
              className="contact-button desktop-contact"
              href="#contact"
            >
              Contact
            </a>

            <button
              type="button"
              className="menu-toggle"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* MOBILE DROPDOWN MENU */}
          <div
            id="mobile-navigation"
            className={`mobile-menu ${menuOpen ? "active" : ""}`}
            aria-hidden={!menuOpen}
          >
            <nav className="mobile-nav-links">
              <a href="#home" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
                Home
              </a>

              <a href="#about" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
                About
              </a>

              <a href="#services" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
                Services
              </a>

              <a href="#work" onClick={closeMenu} tabIndex={menuOpen ? 0 : -1}>
                Work
              </a>
            </nav>

            <a
              className="contact-button mobile-contact"
              href="#contact"
              onClick={closeMenu}
              tabIndex={menuOpen ? 0 : -1}
            >
              Contact
            </a>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;
