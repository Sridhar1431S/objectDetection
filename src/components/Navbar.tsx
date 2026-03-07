import { Link, useLocation } from "react-router-dom";
import { Scan } from "lucide-react";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Detection", path: "/detection" },
  { label: "History", path: "/history" },
  { label: "Stats", path: "/stats" },
  { label: "About", path: "/about" },
];

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10">
            <Scan className="h-5 w-5 text-primary" />
          </div>
          <span className="font-mono text-lg font-bold text-foreground">AI Detect</span>
        </Link>

        <nav className="flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-mono text-sm transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary pb-0.5"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
