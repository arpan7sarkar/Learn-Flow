import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Rocket, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useState } from 'react';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleFeaturesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('features');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById('features');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePricingClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById('pricing');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById('pricing');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 flex justify-center px-3 sm:px-4">
        <nav className="bg-[#050505]/80 backdrop-blur-md border border-white/10 rounded-full px-4 sm:px-6 h-12 sm:h-14 flex items-center shadow-2xl w-full max-w-4xl justify-between">
        
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-white text-black p-1 rounded-full group-hover:scale-110 transition-transform">
               <Rocket className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-sm tracking-wide text-brand-text">Learn-Flow</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <SignedOut>
               <Link 
                 to="/" 
                 className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                 onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
               >
                 Home
               </Link>
               <a 
                 href="#features" 
                 className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                 onClick={handleFeaturesClick}
               >
                 Features
               </a>
               <a 
                 href="#pricing" 
                 className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                 onClick={handlePricingClick}
               >
                 Pricing
               </a>
            </SignedOut>

            <SignedIn>
              {[
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'Planner', path: '/planner' },
                { name: 'AI Tutor', path: '/tutor' },
              ].map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={cn(
                    "text-xs font-medium transition-colors hover:text-white",
                    location.pathname === link.path ? "text-white" : "text-gray-400"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </SignedIn>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <SignedOut>
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="h-8 text-xs rounded-full px-4 text-gray-400 hover:text-white hover:bg-white/5">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button variant="outline" size="sm" className="h-8 text-xs rounded-full px-4 bg-white text-black border-none hover:bg-gray-200 hover:text-black font-semibold">
                  Get Started
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" appearance={{
                elements: {
                  avatarBox: "w-8 h-8 ring-2 ring-white/20"
                }
              }}/>
            </SignedIn>
          </div>

          {/* Mobile: User Button & Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <SignedIn>
              <UserButton afterSignOutUrl="/" appearance={{
                elements: {
                  avatarBox: "w-7 h-7 ring-2 ring-white/20"
                }
              }}/>
            </SignedIn>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </nav>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />
          
          {/* Menu Panel */}
          <div className="absolute top-20 left-3 right-3 bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-200">
            <SignedOut>
              <div className="flex flex-col gap-4 mb-6">
                <Link 
                  to="/" 
                  className="text-lg font-medium text-gray-200 hover:text-white transition-colors py-2"
                  onClick={closeMobileMenu}
                >
                  Home
                </Link>
                <a 
                  href="#features" 
                  className="text-lg font-medium text-gray-200 hover:text-white transition-colors py-2"
                  onClick={handleFeaturesClick}
                >
                  Features
                </a>
                <a 
                  href="#pricing" 
                  className="text-lg font-medium text-gray-200 hover:text-white transition-colors py-2"
                  onClick={handlePricingClick}
                >
                  Pricing
                </a>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                <Link to="/sign-in" onClick={closeMobileMenu}>
                  <Button variant="ghost" className="w-full h-12 text-sm rounded-full text-gray-400 hover:text-white hover:bg-white/5">
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up" onClick={closeMobileMenu}>
                  <Button className="w-full h-12 text-sm rounded-full bg-white text-black hover:bg-gray-200 font-semibold">
                    Get Started
                  </Button>
                </Link>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex flex-col gap-4">
                {[
                  { name: 'Dashboard', path: '/dashboard' },
                  { name: 'Planner', path: '/planner' },
                  { name: 'AI Tutor', path: '/tutor' },
                  { name: 'Upload Syllabus', path: '/upload' },
                ].map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={cn(
                      "text-lg font-medium transition-colors py-2",
                      location.pathname === link.path ? "text-white" : "text-gray-400 hover:text-white"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </SignedIn>
          </div>
        </div>
      )}
    </>
  );
}
