import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { signIn } from "@/app/actions/auth";

export default function SignInPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<main className="sign-in-shell"><div className="sign-in-aside" /><div className="sign-in-main"><div className="sign-in-card">Loading sign-in...</div></div></main>}>
      <SignInContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignInContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="sign-in-shell">
      <section className="sign-in-aside">
        <Link className="brand sign-in-brand" href="/">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span className="brand-name">Kartik<strong> Education</strong><small>LEARNING, CONNECTED</small></span>
        </Link>
        <div className="sign-in-message">
          <span className="sign-in-kicker">ONE SCHOOL GROUP. ONE SHARED VISION.</span>
          <h1>Every campus,<br />moving forward.</h1>
          <p>A clearer view of the people, progress, and possibilities across your schools.</p>
          <div className="campus-illustration" aria-hidden="true">
            <div className="sun-shape" />
            <div className="hill hill-back" />
            <div className="school-building"><div className="roof" /><div className="building-front"><span /><span /><span /><span /><i /></div></div>
            <div className="hill hill-front" />
            <span className="illustration-star star-one">✳</span><span className="illustration-star star-two">✦</span>
          </div>
        </div>
        <div className="sign-in-aside-footer"><span>© 2026 Kartik Education</span><span>Thoughtfully designed for education</span></div>
      </section>

      <section className="sign-in-main">
        <div className="sign-in-card">
          <span className="sign-in-icon"><GraduationCap size={21} /></span>
          <p className="sign-in-eyebrow">WELCOME BACK</p>
          <h2>Sign in to your workspace</h2>
          <p className="sign-in-description">Use your school group account to continue.</p>
          {error === "invalid" && <p className="sign-in-error" role="alert">We couldn&apos;t verify those credentials. Please try again.</p>}
          <form action={signIn} className="sign-in-form">
            <label htmlFor="email">Work email</label>
            <input id="email" name="email" type="email" autoComplete="username" placeholder="you@school.org" required />
            <div className="password-label"><label htmlFor="password">Password</label><a href="mailto:support@kartik.education?subject=Password%20reset">Forgot password?</a></div>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
            <button type="submit">Sign in <ArrowRight size={16} /></button>
          </form>
          <div className="sign-in-help">Having trouble accessing your account? <a href="mailto:support@kartik.education">Contact support</a></div>
        </div>
        <div className="sign-in-mobile-brand"><span className="brand-mark"><span /><span /><span /><span /></span> Kartik <strong>Education</strong></div>
      </section>
    </main>
  );
}
