import { useState } from 'react';
import { navLinks } from '../constants/index.js';

const NavItems = ({ onClick = () => { } }) => (
  <ul className="flex gap-8">
    {navLinks.map((item) => (
      <li key={item.id}>
        <a
          href={item.href}
          onClick={onClick}
          className="text-gray-200 hover:text-white transition-colors font-medium"
        >
          {item.name}
        </a>
      </li>
    ))}
  </ul>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 ">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between py-5 relative">
          {/* Left: Logo */}
          <a
            href="/"
            className="text-white font-bold text-xl hover:text-gray-200 transition-colors"
          >
            COSMO MINDS
          </a>

          {/* Center: Nav links */}
          <nav className="hidden backdrop-blur-md bg-white/10  px-6 py-2 rounded-full sm:flex absolute left-1/2 transform -translate-x-1/2">
            <NavItems />
          </nav>

          {/* Right: Mobile toggle */}
          <button
            onClick={toggleMenu}
            className="sm:hidden text-gray-200 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <img
              src={isOpen ? '/assets/close.svg' : '/assets/menu.svg'}
              alt="toggle"
              className="w-6 h-6"
            />
          </button>

          {/* Mobile menu */}
          {isOpen && (
            <div className="sm:hidden absolute top-full left-0 w-full bg-white/10 backdrop-blur-md border-t border-white/20 py-4">
              <NavItems onClick={closeMenu} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
