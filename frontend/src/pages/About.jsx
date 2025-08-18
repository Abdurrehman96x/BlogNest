import React from "react";
import aboutImg from "../assets/About-blog.avif";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen pt-28 px-4 md:px-0 mb-7">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="md:text-6xl text-4xl font-extrabold mb-4 text-black dark:text-white">
            About BlogNest
          </h1>

          <p className="text-lg text-gray-600 dark:text-gray-300">
            A place to share thoughts, inspire others, and grow together.
          </p>
        </div>

        {/* Image + Text Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-10 items-center">
          <motion.img
            src={aboutImg}
            alt="Blog Illustration"
            className="w-full h-80 object-cover rounded-3xl shadow-xl transform transition duration-500 hover:scale-105"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          />

          <motion.div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 md:p-10 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            <p className="text-lg mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
              Welcome to <span className="font-semibold">BlogNest</span>! We
              created this platform for readers, writers, and thinkers to
              connect through stories, tutorials, and creative insights. Whether
              you're a passionate blogger or someone who loves reading, this
              space is built for you.
            </p>
            <p className="text-lg mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
              Our mission is to empower individuals to express themselves
              freely. We offer simple yet powerful tools to write, publish, and
              engage with others in meaningful ways.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
              Thank you for being a part of our growing{" "}
              <span className="font-semibold text-indigo-500">community</span>.
            </p>
          </motion.div>
        </div>

        {/* Footer Quote */}
        <div className="mt-20 text-center">
          <blockquote className="relative text-2xl italic text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-5xl text-indigo-500">
              ❝
            </span>
            <p className="px-6">Words are powerful. Use them to inspire.</p>
            <span className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-5xl text-indigo-500">
              ❞
            </span>
          </blockquote>
        </div>
      </div>
    </div>
  );
};

export default About;
