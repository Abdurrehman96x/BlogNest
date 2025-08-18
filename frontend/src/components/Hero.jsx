// src/components/Hero.jsx
import heroImg from "../assets/blog2.png";
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-[520px] py-12">
        {/* Left: text */}
        <div>
          <h1 className="font-serif tracking-tight text-5xl md:text-[80px] leading-[0.95]">
            Human
            <br /> stories & ideas
          </h1>

          <p className="mt-5 text-lg text-[#5B5B5B] dark:text-gray-400 max-w-xl">
            A place to read, write, and deepen your understanding.
          </p>

          <div className="mt-8">
            <Link to="/blogs">
              <Button
                size="lg"
                className="rounded-full px-6 h-11 bg-[#0E1111] text-white hover:opacity-90 dark:bg-white dark:text-gray-900"
              >
                Start reading
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: image */}
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-8 -z-10 rounded-[2rem] bg-[#138A36]/10 blur-2xl dark:bg-emerald-500/10"
          />
          <img
            src={heroImg}
            alt="Blogging illustration"
            className="mx-auto h-[420px] w-auto object-contain drop-shadow"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
