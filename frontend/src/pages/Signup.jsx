import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice"; // <-- same import style as your Login page

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUserState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (!agree) {
      toast.error("Please accept the Terms & Privacy.");
      return;
    }
    setSubmitting(true);

    try {
      // 1) Register
      const reg = await axios.post(
        "http://localhost:3000/api/v1/user/register",
        user,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (!reg?.data?.success) {
        toast.error(reg?.data?.message || "Signup failed");
        setSubmitting(false);
        return;
      }

      toast.success("Account created! Signing you in…");

      // 2) Auto-login
      const login = await axios.post(
        "http://localhost:3000/api/v1/user/login",
        { email: user.email, password: user.password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (login?.data?.success) {
        const loggedInUser = login?.data?.user;

        // ✅ Guard: only dispatch a plain action if we have the user
        if (loggedInUser && typeof setUser === "function") {
          dispatch(setUser(loggedInUser));
        }

        toast.success("Welcome! You're now signed in.");
        navigate("/");
      } else {
        toast.error(login?.data?.message || "Please sign in.");
        navigate("/login");
      }
    } catch (err) {
      // Keep this local to the page; don't change store or other files
      console.log(err?.response?.data || err?.message);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbf7ef] dark:bg-neutral-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Toasts at top-center for this page */}
      <Toaster position="top-center" richColors />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
        {/* Back link */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: hero copy to match Sign-in page */}
          <section className="order-2 lg:order-1">
            <h1 className="font-serif text-[42px] leading-tight tracking-tight sm:text-6xl">
              <span className="block">Join us.</span>
              <span className="block mt-3">Start sharing</span>
              <span className="block">your story.</span>
            </h1>

            <p className="mt-6 max-w-xl text-slate-700 dark:text-slate-300">
              Create your account to publish posts, connect with readers, and
              track your growth.
            </p>

            <ul className="mt-8 space-y-4">
              {["Fast, secure setup", "No password sharing", "Privacy-first"].map(
                (t) => (
                  <li
                    key={t}
                    className="flex items-center gap-3 text-slate-800 dark:text-slate-200"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span>{t}</span>
                  </li>
                )
              )}
            </ul>
          </section>

          {/* Right: signup card */}
          <section className="order-1 lg:order-2">
            <Card className="mx-auto w-full max-w-lg rounded-2xl border-none shadow-xl bg-white dark:bg-neutral-900">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-center font-serif text-2xl sm:text-3xl">
                  Create an account
                </h2>
                <p className="mt-2 text-center text-sm">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {/* Name row */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="firstName" className="mb-2 block">
                        First name
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="firstName"
                          type="text"
                          name="firstName"
                          placeholder="First name"
                          value={user.firstName}
                          onChange={handleChange}
                          className="h-11 rounded-xl bg-white/90 dark:bg-neutral-800 pl-9 ring-1 ring-slate-200 dark:ring-neutral-700 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-neutral-400"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="lastName" className="mb-2 block">
                        Last name
                      </Label>
                      <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          id="lastName"
                          type="text"
                          name="lastName"
                          placeholder="Last name"
                          value={user.lastName}
                          onChange={handleChange}
                          className="h-11 rounded-xl bg-white/90 dark:bg-neutral-800 pl-9 ring-1 ring-slate-200 dark:ring-neutral-700 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-neutral-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={user.email}
                        onChange={handleChange}
                        className="h-11 rounded-xl bg-white/90 dark:bg-neutral-800 pl-9 ring-1 ring-slate-200 dark:ring-neutral-700 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-neutral-400"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <Label htmlFor="password" className="mb-2 block">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Create a password"
                        value={user.password}
                        onChange={handleChange}
                        className="h-11 rounded-xl bg-white/90 dark:bg-neutral-800 pl-9 pr-10 ring-1 ring-slate-200 dark:ring-neutral-700 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-neutral-400"
                      />
                      <button
                        type="button"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Terms */}
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 dark:border-neutral-600 text-slate-900 dark:text-neutral-100 focus:ring-slate-400 dark:focus:ring-neutral-400"
                      />
                      I agree to the{" "}
                      <Link to="/terms" className="underline hover:no-underline">
                        Terms
                      </Link>{" "}
                      &{" "}
                      <Link to="/privacy" className="underline hover:no-underline">
                        Privacy
                      </Link>
                    </label>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-black"
                  >
                    <span className="mr-2">Create account</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>

                {/* Small footer links */}
                <div className="mt-8 flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <Link to="/privacy" className="hover:underline">
                    Privacy
                  </Link>
                  <span>·</span>
                  <Link to="/terms" className="hover:underline">
                    Terms
                  </Link>
                  <span>·</span>
                  <Link to="/support" className="hover:underline">
                    Support
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Signup;
