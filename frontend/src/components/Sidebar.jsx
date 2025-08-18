import { ChartColumnBig, SquareUser } from 'lucide-react'
import { LiaCommentSolid } from "react-icons/lia";
import React from 'react'
import { NavLink } from 'react-router-dom'
import { FaRegEdit } from 'react-icons/fa';

const Sidebar = () => {
  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 text-lg font-semibold cursor-pointer p-3 rounded-xl w-full transition 
     ${isActive 
        ? "bg-gray-800 dark:bg-gray-900 text-white shadow-md" 
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
     }`;

  return (
    <div className='hidden md:block fixed top-0 left-0 h-screen w-[260px] border-r-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 p-6 z-10'>
      
      <div className='mt-16 space-y-3'>
        <NavLink to='/dashboard/profile' className={linkClasses}>
          <SquareUser className='text-xl' />
          <span>Profile</span>
        </NavLink>

        <NavLink to='/dashboard/your-blog' className={linkClasses}>
          <ChartColumnBig className='text-xl' />
          <span>Your Blogs</span>
        </NavLink>

        <NavLink to='/dashboard/comments' className={linkClasses}>
          <LiaCommentSolid className='text-xl' />
          <span>Comments</span>
        </NavLink>

        <NavLink to='/dashboard/write-blog' className={linkClasses}>
          <FaRegEdit className='text-xl' />
          <span>Create Blog</span>
        </NavLink>
      </div>
    </div>
  )
}

export default Sidebar
