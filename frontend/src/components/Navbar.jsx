import React, { useState } from 'react'
import { Button } from './ui/button'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Input } from './ui/input'
import Logo from "../assets/logo.png"
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'sonner'
import axios from 'axios'
import { setUser } from '@/redux/authSlice'
import userLogo from "../assets/user.jpg"
import { HiMenuAlt1, HiMenuAlt3 } from "react-icons/hi";
import { Search, LogOut, User, ChartColumnBig } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaMoon, FaRegEdit, FaSun } from 'react-icons/fa'
import { toggleTheme } from '@/redux/themeSlice'
import { LiaCommentSolid } from 'react-icons/lia'
import ResponsiveMenu from './ResponsiveMenu'

const Navbar = () => {
    const { user } = useSelector(store => store.auth)
    const { theme } = useSelector(store => store.theme)
    const [searchTerm, setSearchTerm] = useState('');
    const [openNav, setOpenNav] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const logoutHandler = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/user/logout`,
                { withCredentials: true }
            );
            if (res.data.success) {
                navigate("/")
                dispatch(setUser(null))
                toast.success(res.data.message)
            }
        } catch (error) {

            toast.error(error.response?.data?.message || "Logout failed")
        }
    }

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim() !== '') {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('')
        }
    };

    const toggleNav = () => setOpenNav(!openNav)

    return (
        <div className="py-3 fixed w-full border-b border-gray-200 dark:border-gray-700 
                        bg-white/70 dark:bg-gray-900/70 backdrop-blur-md z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-6">
                
                {/* Logo */}
                <Link to="/" className="flex gap-2 items-center">
                    <img src={Logo} alt="logo" className="w-9 h-9 dark:invert" />
                    <h1 className="font-bold text-2xl md:text-3xl tracking-tight">BlogNest</h1>
                </Link>

                {/* Search */}
                <form onSubmit={handleSearch} className="relative hidden md:block">
                    <Input
                        type="text"
                        placeholder="Search..."
                        className="rounded-full pl-4 pr-10 w-72 
                                   shadow-sm focus:ring-2 focus:ring-blue-500 
                                   dark:bg-gray-800 dark:border-gray-600"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-2.5 text-gray-500 hover:text-blue-500">
                        <Search size={18} />
                    </button>
                </form>

                {/* Nav */}
                <nav className="flex items-center gap-4 md:gap-6">
                    <ul className="hidden md:flex gap-8 font-medium text-lg">
                        <NavLink to="/" className={({ isActive }) =>
                            `hover:text-blue-500 transition ${isActive ? "text-blue-600" : ""}`}>
                            Home
                        </NavLink>
                        <NavLink to="/blogs" className={({ isActive }) =>
                            `hover:text-blue-500 transition ${isActive ? "text-blue-600" : ""}`}>
                            Blogs
                        </NavLink>
                        <NavLink to="/about" className={({ isActive }) =>
                            `hover:text-blue-500 transition ${isActive ? "text-blue-600" : ""}`}>
                            About
                        </NavLink>
                    </ul>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => dispatch(toggleTheme())}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            {theme === 'light' ? <FaMoon /> : <FaSun />}
                        </button>

                        {/* User / Auth */}
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage src={user.photoUrl || userLogo} />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 dark:bg-gray-800 shadow-lg rounded-xl">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                                            <User className="mr-2 h-4 w-4" /> Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/dashboard/your-blog')}>
                                            <ChartColumnBig className="mr-2 h-4 w-4" /> Your Blog
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/dashboard/comments')}>
                                            <LiaCommentSolid className="mr-2 h-4 w-4" /> Comments
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/dashboard/write-blog')}>
                                            <FaRegEdit className="mr-2 h-4 w-4" /> Write Blog
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={logoutHandler} className="text-red-500">
                                        <LogOut className="mr-2 h-4 w-4" /> Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex gap-2">
                                <Link to="/login"><Button size="sm">Login</Button></Link>
                                <Link to="/signup" className="hidden md:block">
                                    <Button size="sm" variant="outline">Signup</Button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        {openNav ? (
                            <HiMenuAlt3 onClick={toggleNav} className="w-7 h-7 md:hidden cursor-pointer" />
                        ) : (
                            <HiMenuAlt1 onClick={toggleNav} className="w-7 h-7 md:hidden cursor-pointer" />
                        )}
                    </div>
                </nav>
            </div>

            {/* Responsive Menu */}
            <ResponsiveMenu openNav={openNav} setOpenNav={setOpenNav} logoutHandler={logoutHandler} />
        </div>
    )
}

export default Navbar
