import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react"; // 👈 X bhi import karo

const HeaderSimple = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "py-2 bg-black backdrop-blur-lg border-b border-gray-800"
          : "py-4 bg-black" // 👈 Background black rakho
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-rose-600 rounded-lg flex items-center justify-center font-bold text-white italic text-xl">
            R7
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            RULE 7 <span className="text-blue-500">MEDIA</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a
            href="#how-it-works"
            className="text-gray-300 hover:text-white transition"
          >
            How it Works
          </a>
          <a
            href="#savings"
            className="text-gray-300 hover:text-white transition"
          >
            Savings
          </a>
          <Link
            to="/Statistics"
            className="text-gray-300 hover:text-white transition"
          >
            Explainers
          </Link>
          <a
            href="https://scanthemall.com/"
            className="text-gray-300 hover:text-white transition"
          >
            Viral Engine
          </a>
          <Link
            to="/login"
            className="px-5 py-2 rounded-full border border-gray-700 text-gray-300 hover:bg-gray-900 transition"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition shadow-lg"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden text-white"
        >
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black border-b border-gray-800 py-6 px-6">
          <div className="flex flex-col space-y-4">
            <a
              href="#how-it-works"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenu(false)}
            >
              How it Works
            </a>
            <a
              href="#savings"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenu(false)}
            >
              Savings
            </a>
            <Link
              to="/Statistics"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenu(false)}
            >
              Explainers
            </Link>
            <a
              href="#viral"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenu(false)}
            >
              Viral Engine
            </a>
            <Link
              to="/login"
              className="text-gray-300 hover:text-white py-2"
              onClick={() => setMobileMenu(false)}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="bg-blue-600 text-white px-4 py-3 rounded-lg text-center"
              onClick={() => setMobileMenu(false)}
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default HeaderSimple;
