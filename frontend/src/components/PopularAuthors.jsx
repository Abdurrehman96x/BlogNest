// src/components/PopularAuthors.jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import userLogo from "../assets/user.jpg";
import { Button } from './ui/button';

export default function PopularAuthors() {
  const [popularUser, setPopularUser] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getAllUsers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/user/all-users`);
        if (res.data.success) setPopularUser(res.data.users);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getAllUsers();
  }, []);

  return (
    <section className="px-4 md:px-6 pb-16 bg-[#F5F1E8] dark:bg-gray-950">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center gap-3 pt-6">
          <h2 className="text-3xl md:text-4xl font-bold">Popular Authors</h2>
          <div className="h-1 w-24 rounded-full bg-[#138A36]" />
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {loading && [...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-black/10 dark:bg-white/10" />
          ))}

          {!loading && popularUser?.slice(0, 6)?.map((user, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-black/10 dark:border-white/10 p-4 bg-white dark:bg-gray-900 hover:-translate-y-1 hover:shadow-lg transition"
            >
              <img
                src={user.photoUrl || userLogo}
                alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                className="mx-auto rounded-full h-20 w-20 object-cover"
                loading="lazy"
              />
              <p className="mt-3 text-center font-semibold truncate">
                {(user.firstName || '') + ' ' + (user.lastName || '')}
              </p>
              <p className="text-xs text-center text-[#5B5B5B] dark:text-gray-400">
                @{user.username || 'author'}
              </p>
              <div className="mt-3 flex justify-center">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full hover:shadow dark:border-gray-700"
                >
                  View Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
