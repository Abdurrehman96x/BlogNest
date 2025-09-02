import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom"; 
import axios from "axios";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [input, setInput] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/v1/user/login`,
        input,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (data?.success && data?.user) {
        const u = data.user;
        dispatch(setUser(u));

        // remember email locally (optional)
        try {
          if (remember)
            localStorage.setItem("remember_email", u?.email || input.email);
          else localStorage.removeItem("remember_email");
        } catch {}

        toast.success(data.message || "Signed in");

        const isAdmin = u?.role === "admin" || u?.isAdmin === true;
        const from = location.state?.from?.pathname;

        const dest = isAdmin
          ? "/admin"
          : from && from !== "/admin"
          ? from
          : "/dashboard/profile";

        navigate(dest, { replace: true });
        return;
      }

      toast.error(data?.message || "Login failed");
    } catch (error) {
      const status = error?.response?.status;
      const payload = error?.response?.data;
      const msg = payload?.message || "Login failed";

      // blocked user → show blocked page
      if (status === 403 && (payload?.blocked || /block/i.test(msg))) {
        try {
          localStorage.removeItem("remember_email");
        } catch {}
        toast.error("Your account is blocked.");
        navigate("/blocked", { replace: true, state: { email: input.email } });
        return;
      }

      toast.error(msg);
      // eslint-disable-next-line no-console

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#fbf7ef] dark:bg-neutral-950 text-slate-900 dark:text-slate-100 transition-colors">
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
          {/* Left: Hero text */}
          <section className="order-2 lg:order-1">
            <h1 className="font-serif text-[42px] leading-tight tracking-tight sm:text-6xl">
              <span className="block">Welcome back.</span>
              <span className="block mt-3">Let’s keep</span>
              <span className="block">writing.</span>
            </h1>

            <p className="mt-6 max-w-xl text-slate-700 dark:text-slate-300">
              Sign in to continue your stories, track your growth, and connect
              with readers.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                "Secure authentication",
                "No password sharing",
                "Privacy-first",
              ].map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 text-slate-800 dark:text-slate-200"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Right: Sign-in card */}
          <section className="order-1 lg:order-2">
            <Card className="mx-auto w-full max-w-lg rounded-2xl border-none shadow-xl bg-white dark:bg-neutral-900">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-center font-serif text-2xl sm:text-3xl">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-center text-sm">
                  Or{" "}
                  <Link
                    to="/signup"
                    className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                  >
                    create a new account
                  </Link>
                </p>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="mb-2 block">
                      Email address
                    </Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={input.email}
                        onChange={handleChange}
                        required
                        className="pl-9 h-11 rounded-xl bg-white/90 dark:bg-neutral-800 ring-1 ring-slate-200 dark:ring-neutral-700 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-neutral-400"
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
                        placeholder="Your password"
                        value={input.password}
                        onChange={handleChange}
                        required
                        className="pl-9 pr-10 h-11 rounded-xl bg-white/90 dark:bg-neutral-800 ring-1 ring-slate-200 dark:ring-neutral-700 focus-visible:ring-2 focus-visible:ring-slate-400 dark:focus-visible:ring-neutral-400"
                      />
                      <button
                        type="button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
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

            

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-black"
                  >
                    <span className="mr-2">Sign in</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>

                  {/* Bottom CTA */}
                  <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/signup"
                      className="font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
                    >
                      Sign up
                    </Link>
                  </p>
                </form>

                {/* Footer links */}
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

export default Login;
