import { ArrowRight, GraduationCap } from "lucide-react";
import { signIn } from "@/app/actions/auth";

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const { error } = await searchParams;

  return (
    <main className="sign-in-shell">
      <section className="sign-in-aside">
        <a className="brand sign-in-brand" href="/">
          <span className="brand-mark"><span /><span /><span /><span /></span>
          <span className="brand-name">ed<strong>ucore</strong><small>LEARNING, CONNECTED</small></span>
        </a>
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
        <div className="sign-in-aside-footer"><span>© 2024 Educ-core Technologies</span><span>Thoughtfully designed for education</span></div>
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
            <div className="password-label"><label htmlFor="password">Password</label><a href="mailto:support@educore.school?subject=Password%20reset">Forgot password?</a></div>
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
            <button type="submit">Sign in <ArrowRight size={16} /></button>
          </form>
          <div className="sign-in-help">Having trouble accessing your account? <a href="mailto:support@educore.school">Contact support</a></div>
        </div>
        <div className="sign-in-mobile-brand"><span className="brand-mark"><span /><span /><span /><span /></span> Educ<strong>core</strong></div>
      </section>
    </main>
  );
}
