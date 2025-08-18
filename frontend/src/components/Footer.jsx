import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../assets/logo.png'
import { FaFacebook, FaInstagram, FaPinterest, FaTwitterSquare } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-gray-300 py-10'>
      <div className='max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10'>
        
        {/* Logo + Info */}
        <div>
          <Link to='/' className='flex gap-3 items-center'>
            <img src={Logo} alt="Logo" className='invert w-12 h-12' />
            <h1 className='text-3xl font-bold'>BlogNest</h1>
          </Link>
          <p className='mt-3 text-sm leading-relaxed'>
            Sharing insights, tutorials, and ideas on web development and tech.
          </p>
          <p className='mt-3 text-sm'>
            Email: <a href="mailto:abdurehman96x@email.com" className='text-red-400 hover:underline'>
              abdurehman96x@email.com
            </a>
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className='text-xl font-semibold mb-3'>Quick Links</h3>
          <ul className='space-y-2 text-sm'>
            <li><Link to="/" className='hover:text-red-400 transition'>Home</Link></li>
            <li><Link to="/blogs" className='hover:text-red-400 transition'>Blogs</Link></li>
            <li><Link to="/about" className='hover:text-red-400 transition'>About Us</Link></li>
            <li><Link to="/faqs" className='hover:text-red-400 transition'>FAQs</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className='text-xl font-semibold mb-3'>Follow Us</h3>
          <div className='flex space-x-4 text-2xl'>
            <a href="#" className='hover:text-red-400'><FaFacebook /></a>
            <a href="#" className='hover:text-red-400'><FaInstagram /></a>
            <a href="#" className='hover:text-red-400'><FaTwitterSquare /></a>
            <a href="#" className='hover:text-red-400'><FaPinterest /></a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className='text-xl font-semibold mb-3'>Stay in the Loop</h3>
          <p className='text-sm'>Subscribe for updates, tutorials, and insights.</p>
          <form className='mt-4 flex'>
            <input 
              type="email" 
              placeholder='Your email address'
              className='w-full p-2 rounded-l-md bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500'
            />
            <button 
              type='submit' 
              className='bg-red-600 text-white px-4 rounded-r-md hover:bg-red-700 transition'>
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section */}
      <div className='mt-10 border-t border-gray-700 pt-6 text-center text-sm'>
        <p>
          &copy; {new Date().getFullYear()} <span className='text-red-400 font-semibold'>Abdur Rehman Malik</span>. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default Footer
