import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@clerk/clerk-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleCart = () => setIsCartOpen(!isCartOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-display font-bold text-pickle-700">
                ADHYAA <span className="text-spice-600">PICKLES</span>
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {["/", "/products", "/about", "/contact"].map((path, idx) => {
                const labels = ["Home", "Shop", "Our Story", "Contact"];
                return (
                  <Link
                    key={path}
                    to={path}
                    className="text-foreground hover:text-pickle-600 font-medium"
                    onClick={closeMenu}
                  >
                    {labels[idx]}
                  </Link>
                );
              })}

              {isSignedIn ? (
                <Link
                  to="/dashboard"
                  className="text-foreground hover:text-pickle-600 font-medium"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Button variant="outline" onClick={() => navigate("/sign-in")}>
                    Sign In
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/sign-up")}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                aria-label="Cart"
                onClick={toggleCart}
                className="relative"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-spice-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                aria-label="Cart"
                onClick={toggleCart}
                className="relative mr-2"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-spice-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMenu}
                aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMenuOpen}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div
              className="md:hidden mt-4 pb-4 bg-white"
              role="menu"
              aria-label="Mobile Navigation"
            >
              <div className="flex flex-col space-y-4">
                {["/", "/products", "/about", "/contact"].map((path, idx) => {
                  const labels = ["Home", "Shop", "Our Story", "Contact"];
                  return (
                    <Link
                      key={path}
                      to={path}
                      className="text-foreground hover:text-pickle-600 py-2 font-medium"
                      onClick={closeMenu}
                      role="menuitem"
                    >
                      {labels[idx]}
                    </Link>
                  );
                })}

                {isSignedIn ? (
                  <Link
                    to="/dashboard"
                    className="text-foreground hover:text-pickle-600 py-2 font-medium"
                    onClick={closeMenu}
                    role="menuitem"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        closeMenu();
                        navigate("/sign-in");
                      }}
                      className="w-full mt-2"
                    >
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        closeMenu();
                        navigate("/sign-up");
                      }}
                      className="w-full mt-2"
                    >
                      Sign Up
                    </Button>
                  </>
                )}

                <div className="flex space-x-4 items-center pt-2">
                  <Button variant="ghost" size="icon" aria-label="Search">
                    <Search className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scrolling Bar */}
        <div className="bg-spice-600 text-white py-2 overflow-hidden whitespace-nowrap">
          <div
            className="inline-block animate-scroll px-4"
            style={{ minWidth: "100%" }}
          >
            🚨 Orders OPEN from June 1, 2025! 🚨 Please contact us via{" "}
            <a
              href="https://wa.me/7995059659"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold"
            >
              WhatsApp
            </a>{" "}
            for booking. Don’t miss your chance to savor the freshest pickles! 🥭📞
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Scroll animation styles */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-scroll {
          display: inline-block;
          white-space: nowrap;
          animation: scroll 20s linear infinite;
        }
      `}</style>
    </>
  );
}
