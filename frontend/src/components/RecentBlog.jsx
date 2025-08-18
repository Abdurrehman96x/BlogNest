// src/components/RecentBlog.jsx
import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BlogCardList from './BlogCardList';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useNavigate } from 'react-router-dom';
import { setBlog } from '@/redux/blogSlice';

const TAGS = [
  'All',
  'Blogging',
  'Web Development',
  'Digital Marketing',
  'Cooking',
  'Photography',
  'Sports',
];

const SORTS = [
  { id: 'new', label: 'Newest' },
  { id: 'old', label: 'Oldest' },
  { id: 'pop', label: 'Most Popular' }, // assumes blog.likes or views
];

export default function RecentBlog() {
  const { blog = [] } = useSelector((s) => s.blog);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [sortBy, setSortBy] = useState('new');

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const getAllPublsihedBlogs = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/blog/get-published-blogs`,
          { withCredentials: true }
        );
        if (res.data.success) dispatch(setBlog(res.data.blogs));
      } catch (e) {
        setError('Could not load blogs. Please try again.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getAllPublsihedBlogs();
  }, [dispatch]);

  const filteredSorted = useMemo(() => {
    let data = [...blog];

    // search
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(
        (b) =>
          b?.title?.toLowerCase().includes(q) ||
          b?.category?.toLowerCase().includes(q) ||
          b?.author?.name?.toLowerCase().includes(q)
      );
    }

    // tag filter
    if (activeTag !== 'All') {
      data = data.filter((b) => b?.category === activeTag);
    }

    // sort
    if (sortBy === 'new') {
      data.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );
    } else if (sortBy === 'old') {
      data.sort(
        (a, b) => new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
      );
    } else if (sortBy === 'pop') {
      data.sort(
        (a, b) => (b?.likes || b?.views || 0) - (a?.likes || a?.views || 0)
      );
    }

    return data;
  }, [blog, query, activeTag, sortBy]);

  return (
    <section className="bg-[#F5F1E8] dark:bg-gray-950 pb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center gap-3 pt-6">
          <h2 className="text-3xl md:text-4xl font-bold">Recent Blogs</h2>
          <div className="h-1 w-24 rounded-full bg-[#138A36]" />
          <p className="text-sm text-[#5B5B5B] dark:text-gray-400">
            Handpicked fresh reads from our editors.
          </p>
        </div>

        {/* Search + Filters */}
        <div className="mt-6 flex flex-col gap-4">
          {/* search + sort row */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or category"
              className="pl-4 rounded-full bg-white dark:bg-gray-900 dark:border-gray-700"
            />

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Sort:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border px-3 py-2 bg-white dark:bg-gray-900 dark:border-gray-700 text-sm"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                className="rounded-full"
                onClick={() => {
                  setQuery('');
                  setActiveTag('All');
                  setSortBy('new');
                }}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* tag pills */}
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const active = t === activeTag;
              return (
                <Badge
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={[
                    'cursor-pointer rounded-full px-3 py-1 border',
                    active
                      ? 'bg-[#138A36] text-white border-[#138A36]'
                      : 'bg-white text-gray-900 border-black/10 hover:bg-white/80 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-700',
                  ].join(' ')}
                >
                  {t}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div>
            {loading && (
              <div className="grid gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-xl bg-black/10 dark:bg-white/10"
                  />
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="mt-2 px-1">
                {filteredSorted?.slice(0, 6)?.map((b, i) => (
                  <div
                    key={b._id || i}
                    className="group mb-4 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-gray-900 p-4 hover:-translate-y-0.5 hover:shadow transition"
                  >
                    <BlogCardList blog={b} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6">
              <Button
                variant="outline"
                className="rounded-full dark:border-gray-700"
                onClick={() => navigate('/blogs')}
              >
                View all posts
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="hidden lg:block bg-white dark:bg-gray-900 rounded-xl border border-black/10 dark:border-white/10 p-5">
            <h3 className="text-lg font-semibold">Suggested Blogs</h3>
            <ul className="mt-4 space-y-3">
              {[
                '10 Tips to Master React',
                'Understanding Tailwind CSS',
                'Improve SEO in 2025',
              ].map((title, idx) => (
                <li
                  key={idx}
                  className="text-sm text-[#0E1111] dark:text-gray-100 hover:underline cursor-pointer"
                >
                  {title}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-lg bg-[#138A36]/10 dark:bg-emerald-500/10 p-4">
              <h4 className="font-semibold">Subscribe to Newsletter</h4>
              <p className="text-sm text-[#5B5B5B] dark:text-gray-400">
                Get the latest posts delivered to your inbox.
              </p>
              <div className="mt-3 flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-white dark:bg-gray-900 rounded-full dark:border-gray-700"
                />
                <Button className="rounded-full">Subscribe</Button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
