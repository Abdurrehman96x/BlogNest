// src/pages/Home.jsx
import Hero from '@/components/Hero';
import RecentBlog from '@/components/RecentBlog';
import PopularAuthors from '@/components/PopularAuthors';

export default function Home() {
  return (
    <div className="pt-20 bg-[#F5F1E8] text-[#0E1111] dark:bg-gray-950 dark:text-white min-h-screen">
      <Hero />
      <RecentBlog />
      <PopularAuthors />
    </div>
  );
}