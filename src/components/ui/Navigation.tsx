import NavigationLogo from './NavigationLogo';

interface NavigationProps {
  currentPath: string;
  basePath?: string;
}

const NAV_ROUTES = [
  { path: '/blog', label: 'Blog', title: 'Blog' },
  { path: '/projects', label: 'Projects', title: 'Projects' },
  { path: '/about', label: 'About', title: 'About' },
] as const;

function withBase(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  return `${b}${path.startsWith('/') ? path : `/${path}`}`;
}

export default function Navigation({ currentPath, basePath = '/' }: NavigationProps) {
  const homeHref = withBase(basePath, '/');

  const isActive = (href: string): boolean => {
    return currentPath === href || (href !== homeHref && currentPath.startsWith(href));
  };

  return (
    <nav className="navigation" aria-label="Main navigation">
      <div className="nav-brand">
        <a href={homeHref} className="brand-link" aria-label="Home">
          <NavigationLogo />
        </a>
      </div>

      <ul className="nav-links" role="list">
        {NAV_ROUTES.map(({ path, label, title }) => {
          const href = withBase(basePath, path);
          return (
            <li key={path}>
              <a
                href={href}
                className={`nav-link${isActive(href) ? ' active' : ''}`}
                aria-current={currentPath === href ? 'page' : undefined}
                title={title}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
