import {
  FaFilePdf,
  FaDownload,
  FaShieldAlt,
  FaLock,
  FaGlobe,
  FaRocket,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import Header from "../components/Header";
import Footer from "../components/Footer";
const WhitePaper = () => {
  const { user } = useSelector((state) => state.auth || { user: null });
  const isLoggedIn = !!user;
  return (
    <>
      {!isLoggedIn && <Header />}
      <div className="min-h-screen bg-[#08121c] text-white">
        <section className="text-center py-20 px-6 bg-gradient-to-r from-red-700 to-red-800">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Rule7Media White Paper
          </h1>

          <p className="text-gray-200 max-w-2xl mx-auto">
            Discover our auction-driven advertising ecosystem, secure
            infrastructure, and next-generation digital storytelling platform.
          </p>

          <div className="flex justify-center gap-5 mt-8">
            <a
              href="/ARD_WhitePaper.pdf"
              target="_blank"
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
            >
              <FaFilePdf />
              View PDF
            </a>

            <a
              href="/ARD_WhitePaper.pdf"
              download
              className="flex items-center gap-2 bg-black border border-white px-6 py-3 rounded-lg hover:bg-gray-900"
            >
              <FaDownload />
              Download
            </a>
          </div>
        </section>

        {/* ABOUT */}
        <section className="max-w-6xl mx-auto py-16 px-6 text-gray-300 space-y-6">
          <h2 className="text-2xl font-bold text-white">About Rule7Media</h2>

          <p>
            Rule7Media is a global ecosystem for high-end digital advertising,
            combining mobility networks, contextual targeting and auction-based
            pricing to deliver measurable campaign performance.
          </p>
        </section>

        {/* FEATURES */}
        <section className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 px-6 pb-16">
          <div className="bg-[#111b26] p-6 rounded-xl">
            <FaRocket className="text-red-600 text-2xl mb-3" />
            <h3 className="font-semibold mb-2">Performance Driven</h3>
            <p className="text-gray-400 text-sm">
              Data-first campaigns with measurable ROI.
            </p>
          </div>

          <div className="bg-[#111b26] p-6 rounded-xl">
            <FaGlobe className="text-red-600 text-2xl mb-3" />
            <h3 className="font-semibold mb-2">Global Reach</h3>
            <p className="text-gray-400 text-sm">
              Multi-country advertising network coverage.
            </p>
          </div>

          <div className="bg-[#111b26] p-6 rounded-xl">
            <FaShieldAlt className="text-red-600 text-2xl mb-3" />
            <h3 className="font-semibold mb-2">Enterprise Security</h3>
            <p className="text-gray-400 text-sm">
              Secure infrastructure with encryption and compliance.
            </p>
          </div>
        </section>

        {/* SECURITY */}
        <section className="text-center text-xs uppercase tracking-wider text-gray-400 pb-10 space-y-2">
          <div className="flex justify-center gap-6">
            <span className="flex items-center gap-2">
              <FaShieldAlt /> ISO 27001 Secure
            </span>

            <span className="flex items-center gap-2">
              <FaLock /> AES-256 Encryption
            </span>
          </div>
        </section>

        {/* PDF PREVIEW */}
        <section className="max-w-6xl mx-auto px-6 pb-20">
          <div className="border border-gray-700 rounded-lg overflow-hidden h-[80vh]">
            <iframe
              src="/ARD_WhitePaper.pdf"
              title="White Paper Preview"
              className="w-full h-full"
            />
          </div>
        </section>
      </div>
      {!isLoggedIn && <Footer />}
    </>
  );
};

export default WhitePaper;
