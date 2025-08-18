import BlogCard from '@/components/BlogCard'
import React, { useEffect } from 'react'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setBlog } from '@/redux/blogSlice'

const Blog = () => {
  const dispatch = useDispatch()
  const { blog } = useSelector(store => store.blog)

  useEffect(() => {
    const getAllPublsihedBlogs = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/blog/get-published-blogs`,
          { withCredentials: true }
        )
        if (res.data.success) {
          dispatch(setBlog(res.data.blogs))
        }
      } catch (error) {
        console.log(error)
      }
    }
    getAllPublsihedBlogs()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Content */}
      <main className="flex-grow">
        <section className="max-w-6xl mx-auto px-4 md:px-0 pt-24 pb-16">
          {/* Heading */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
              Our Blogs
            </h1>
            <hr className="w-28 mx-auto border-2 border-red-500 rounded-full" />
          </div>

          {/* Blog Grid */}
          <div className="grid gap-10 grid-cols-1 md:grid-cols-3">
            {blog?.map((blog, index) => (
              <BlogCard blog={blog} key={index} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Blog
