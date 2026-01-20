import { useRef } from 'react';
import NavigationLogo from './NavigationLogo';

interface NavLink {
  href: string;
  label: string;
  title: string;
}

interface NavigationProps {
  currentPath: string;
}

const navLinks: NavLink[] = [
  { href: '/blog', label: 'Blog', title: 'Blog' },
  { href: '/projects', label: 'Projects', title: 'Projects' },
  { href: '/about', label: 'About', title: 'About' },
];

const DEBOUNCE_MS = 300;

export default function Navigation({ currentPath }: NavigationProps) {
  const isNavigatingRef = useRef(false);

  // React 19: No need for useCallback wrapper - compiler optimizes this
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isNavigatingRef.current) {
      e.preventDefault();
      return;
    }
    
    isNavigatingRef.current = true;
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, DEBOUNCE_MS);
  };

  const isActive = (href: string): boolean => {
    return currentPath === href || (href !== '/' && currentPath.startsWith(href));
  };

  return (
    <nav className="navigation" aria-label="Main navigation">
      <div className="nav-brand">
        <a href="/" className="brand-link" aria-label="Home" onClick={handleClick}>
          <NavigationLogo />
        </a>
      </div>

      <ul className="nav-links" role="list">
        {navLinks.map(({ href, label, title }) => (
          <li key={href}>
            <a
              href={href}
              className={`nav-link${isActive(href) ? ' active' : ''}`}
              aria-current={currentPath === href ? 'page' : undefined}
              title={title}
              onClick={handleClick}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
