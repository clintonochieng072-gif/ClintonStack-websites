"use client";

interface FooterProps {
  text: string;
}

export default function Footer({ text }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
              C
            </div>
            <span className="font-semibold">Real-estate Website</span>
          </div>
          <p className="mt-4 text-sm text-slate-300 max-w-sm">{text}</p>
        </div>

        <div>
          <h5 className="font-semibold">Quick Links</h5>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>
              <a href="#about" className="hover:text-white">
                About
              </a>
            </li>
            <li>
              <a href="#services" className="hover:text-white">
                Services
              </a>
            </li>
            <li>
              <a href="#gallery" className="hover:text-white">
                Gallery
              </a>
            </li>
            <li>
              <a href="#contact" className="hover:text-white">
                Contact
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h5 className="font-semibold">Contact</h5>
          <p className="mt-4 text-sm text-slate-300">
            contact@clintonstack.com
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              F
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              T
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
            >
              I
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800 py-4 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Real-estate Website — Built with
        ClintonStack
      </div>
    </footer>
  );
}
