import { useState } from "react";
import api from "../lib/api";
import { toast } from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import PasswordRequirements from "../components/PasswordRequirements";
import { EyeClosed, Eye } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordToggle, setPasswordToggle] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    if (!emailReg.test(email)) {
      toast.error("Invalid email");
      return;
    }
    if (!passwordReg.test(password)) {
      toast.error("Invalid password");
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.post("/auth/signup", { email, password });
      if (data?.ok) {
        toast.success("Check your email to confirm");
        navigate("/login");
      } else {
        toast.error(data?.error || "Signup failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    try {
      const { data } = await api.get("/auth/google-url", {
        params: { redirect: window.location.origin },
      });
      if (data?.ok && data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Unable to start Google sign-in");
      }
    } catch (err) {
      toast.error("Unable to start Google sign-in");
    }
  }

  return (
    <section className="mx-auto max-w-sm space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Create account
        </h1>
        <p className="text-white/70">Start taking notes.</p>
      </header>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="relative w-full mt-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email Address"
            className="peer w-full h-10 glass-input rounded-lg p-2 placeholder-transparent focus:outline-none"
          />
          <label
            htmlFor="email"
            className="pointer-events-none absolute left-2 -top-2.5 text-sm text-white/70 bg-transparent px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-white"
          >
            Email Address
          </label>
        </div>
        <div className="relative w-full mt-4">
          <input
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            type={passwordToggle ? "text" : "password"}
            placeholder="Password"
            id="password"
            className="peer w-full h-10 glass-input rounded-lg p-2 placeholder-transparent focus:outline-none"
          />
          <label
            htmlFor="password"
            className="pointer-events-none  absolute left-2 -top-2.5 text-sm text-white/70 bg-transparent px-1 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-white/50 peer-placeholder-shown:top-2 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-white"
          >
            Password
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="peer glass-input"
            onClick={() => {
              setPasswordToggle(!passwordToggle);
            }}
          />
          <label className="text-sm text-white/70 peer-checked:text-white">
            Show password
          </label>
        </div>
        <PasswordRequirements password={password} />
        <button
          disabled={loading}
          className="w-full rounded-lg glass-button-primary px-3 py-2 text-white disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Signing up…" : "Sign up"}
        </button>
      </form>
      <button
        onClick={onGoogle}
        className="w-full rounded-lg glass-button px-3 py-2 cursor-pointer text-white"
      >
        Continue with Google
      </button>
      <p className="text-sm text-white/70">
        Already have an account?{" "}
        <Link to="/login" className="underline text-white">
          Log in
        </Link>
      </p>
    </section>
  );
}
