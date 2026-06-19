import Image from "next/image"
import Link from "next/link"
import logo from '@/images/unwomenlogo.png'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-[#399edc] dark:bg-gray-950 text-white mt-16">
      {/* Subscribe band */}
      <div className="bg-[#399edc] py-8 px-4 sm:px-6">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Stay in the loop</h3>
            <p className="text-white/70 text-sm mt-0.5">Subscribe for product news, offers and impact stories</p>
          </div>
          <form className="flex w-full sm:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 sm:w-64 px-4 py-2.5 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm outline-none focus:border-yellow-400 transition-colors"
            />
            <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-5 py-2.5 rounded-full text-sm transition-colors flex items-center gap-1.5 flex-shrink-0">
              Subscribe <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <Image src={logo} alt="UN Women Market Square" width={110} height={44} className="h-10 w-auto brightness-0 invert mb-4" />
          <p className="text-white/60 text-sm leading-relaxed">
            UN Women is the global champion for gender equality, working to develop and uphold standards and create an environment in which every woman and girl can exercise her human rights and live up to her full potential.
          </p>
          <div className="flex items-center gap-3 mt-5">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
              <button key={i} className="w-8 h-8 rounded-full bg-white/10 hover:bg-yellow-400 hover:text-gray-900 transition-colors flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">Quick Links</h4>
          <ul className="space-y-2.5">
            {[
              { href: '/', label: 'Home' },
              { href: '/products/shop', label: 'Shop' },
              { href: '/categories', label: 'Categories' },
              { href: '/blog', label: 'Blog' },
              { href: '/mentors', label: 'Mentors' },
              { href: '/auth/signup', label: 'Become a Vendor' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-white/70 hover:text-white group inline-flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Business Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">Business Categories</h4>
          <ul className="space-y-2.5">
            {[
              { href: '/products/shop/category/business/SME', label: 'SME' },
              { href: '/products/shop/category/business/SOHO', label: 'SOHO' },
              { href: '/products/shop/category/business/MICRO', label: 'Micro' },
              { href: '/products/shop/category/business/MACRO', label: 'Macro' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-white/70 hover:text-white group inline-flex items-center gap-1.5 transition-colors">
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4 mt-8">Opening Hours</h4>
          <p className="text-sm text-white/70">Mon – Fri: 8 am – 6 pm</p>
          <p className="text-sm text-white/70">Sat: 9 am – 3 pm</p>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-4">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-white/70">Freetown, Sierra Leone</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <a href="tel:+23279366751" className="text-sm text-white/70 hover:text-white transition-colors">+232 79 366 751</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <a href="mailto:info@slwms.org" className="text-sm text-white/70 hover:text-white transition-colors break-all">
                info@slwms.org
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/40">
          <p>© {new Date().getFullYear()} UN Women Market Square. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
