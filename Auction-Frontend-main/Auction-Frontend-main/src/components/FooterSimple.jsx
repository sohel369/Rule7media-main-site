import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram } from "lucide-react";

const FooterSimple = () => {
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Left Section - Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-rose-600 rounded flex items-center justify-center font-bold text-white italic">
                R7
              </div>
              <span className="text-lg font-bold text-white">
                RULE 7 <span className="text-blue-500">MEDIA</span>
              </span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8">
              Redefining contextual advertising solutions. Driven by first-party
              data, powered by human-curated ad channels.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/people/Rule-7-Media/61578118663553/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 rounded hover:bg-gray-800 transition"
              >
                <Facebook className="w-5 h-5 text-gray-400" />
              </a>
              <a
                href="https://x.com/Rule7Media"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 rounded hover:bg-gray-800 transition"
              >
                <Twitter className="w-5 h-5 text-gray-400" />
              </a>
              <a
                href="https://www.instagram.com/rule.7media"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-900 rounded hover:bg-gray-800 transition"
              >
                <Instagram className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>

          {/* Marketing Solutions */}
          <div>
            <h4 className="font-bold mb-6 text-white">Marketing Solutions</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="#"
                  className="text-gray-500 hover:text-white transition"
                >
                  Alternative Platforms
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-500 hover:text-white transition"
                >
                  Viral Marketing
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-500 hover:text-white transition"
                >
                  ROI Strategies
                </Link>
              </li>
              <li>
                <Link
                  to="#"
                  className="text-gray-500 hover:text-white transition"
                >
                  Audience Targeting
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold mb-6 text-white">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-gray-500 hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-conditions"
                  className="text-gray-500 hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookie-policy"
                  className="text-gray-500 hover:text-white transition"
                >
                  Cookie Preferences
                </Link>
              </li>
              <li>
                <Link
                  to="/Statistics"
                  className="text-gray-500 hover:text-white transition"
                >
                  Statistics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-xs">
            © 2025 Rule 7 Media. All rights reserved. 6 Marina Promenade,
            Paradise Point, Queensland, Australia.
          </p>
          <div className="flex gap-6 text-xs text-gray-600">
            <span>English (UK)</span>
            <span>AUD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSimple;
