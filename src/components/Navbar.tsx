import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Menu,
  X,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import { useAuth } from "@clerk/clerk-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { itemCount } = useCart();
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
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
            <Link to="/" className="text-foreground hover:text-pickle-600 font-medium">Home</Link>
            <Link to="/products" className="text-foreground hover:text-pickle-600 font-medium">Shop</Link>
            <Link to="/about" className="text-foreground hover:text-pickle-600 font-medium">Our Story</Link>
            <Link to="/contact" className="text-foreground hover:text-pickle-600 font-medium">Contact</Link>

            {isSignedIn ? (
              <Link to="/dashboard" className="text-foreground hover:text-pickle-600 font-medium">Dashboard</Link>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate("/sign-in")}>Sign In</Button>
                <Button variant="outline" onClick={() => navigate("/sign-up")}>Sign Up</Button>
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
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Menu">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 bg-white">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-foreground hover:text-pickle-600 py-2 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/products" className="text-foreground hover:text-pickle-600 py-2 font-medium" onClick={() => setIsOpen(false)}>Shop</Link>
              <Link to="/about" className="text-foreground hover:text-pickle-600 py-2 font-medium" onClick={() => setIsOpen(false)}>Our Story</Link>
              <Link to="/contact" className="text-foreground hover:text-pickle-600 py-2 font-medium" onClick={() => setIsOpen(false)}>Contact</Link>

              {isSignedIn ? (
                <Link to="/dashboard" className="text-foreground hover:text-pickle-600 py-2 font-medium" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
              ) : (
                <>
                  <Button variant="outline" onClick={() => { setIsOpen(false); navigate("/sign-in"); }} className="w-full mt-2">
                    Sign In
                  </Button>
                  <Button variant="outline" onClick={() => { setIsOpen(false); navigate("/sign-up"); }} className="w-full mt-2">
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

      <CartDrawer open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}
