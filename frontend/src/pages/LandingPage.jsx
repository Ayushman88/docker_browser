import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const tags = ["#Docker", "#noVNC", "#Ephemeral", "#Isolated", "#JWT"];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing landing--inspo">
      <div className="landing-bg" aria-hidden />

      <header className="landing-nav-wrap">
        <div className="nav-float shell-wide">
          <Link to="/" className="brand-light">
            <span className="brand-light-mark" aria-hidden />
            <span className="brand-light-text">Rebrowser</span>
          </Link>
          <nav className="nav-float-links" aria-label="Primary">
            <a href="#product">Product</a>
            <a href="#how-it-works">How it works</a>
            <a href="#security">Security</a>
          </nav>
          <div className="nav-float-cta">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-ink btn-sm btn-pill">
                Console <span className="btn-arrow" aria-hidden>→</span>
              </Link>
            ) : (
              <>
                <Link to="/sign-in" className="nav-float-signin">
                  Sign in
                </Link>
                <Link to="/sign-in" className="btn btn-ink btn-sm btn-pill">
                  Get started <span className="btn-arrow" aria-hidden>→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero-inspo shell-wide">
          <div className="hero-inspo-copy">
            <p className="hero-inspo-eyebrow">Remote ephemeral browser</p>
            <h1 className="hero-inspo-title">
              Isolated Chrome sessions for teams who need a{" "}
              <span className="hero-inspo-highlight">clean slate every time.</span>
            </h1>
            <p className="hero-inspo-lede">
              Stream a real desktop browser over noVNC from a disposable Docker container. End the session and it
              disappears—no residue on the host.
            </p>
            <div className="hero-inspo-tags">
              {tags.map((t) => (
                <span key={t} className="float-tag">
                  {t}
                </span>
              ))}
            </div>
            <div className="hero-inspo-actions">
              <Link to={isAuthenticated ? "/dashboard" : "/sign-in"} className="btn btn-ink btn-lg btn-pill">
                {isAuthenticated ? "Open console" : "Get started"}
                <span className="btn-arrow" aria-hidden>
                  →
                </span>
              </Link>
              <a href="#how-it-works" className="btn btn-outline btn-lg btn-pill">
                How it works
              </a>
            </div>
            <div className="hero-stats-row">
              <div className="mini-stat">
                <strong>Engine</strong>
                <span>Docker API</span>
              </div>
              <div className="mini-stat">
                <strong>Stream</strong>
                <span>noVNC</span>
              </div>
              <div className="mini-stat">
                <strong>Auth</strong>
                <span>Email OTP + JWT</span>
              </div>
            </div>
          </div>

          <div className="hero-inspo-visual" id="product">
            <div className="visual-card visual-card--accent float-slow">
              <span className="visual-card-label">Session health</span>
              <p className="visual-stat">
                <span className="visual-stat-num">Live</span>
                <span className="visual-stat-sub">Chrome + noVNC</span>
              </p>
              <div className="visual-bars" aria-hidden>
                <span style={{ height: "48%" }} />
                <span style={{ height: "72%" }} />
                <span style={{ height: "56%" }} />
                <span style={{ height: "88%" }} />
              </div>
            </div>
            <div className="visual-card visual-card--main float-slow-delayed">
              <div className="visual-card-head">
                <span className="visual-dot" />
                <span className="visual-card-title">Active containers</span>
              </div>
              <ul className="visual-list">
                <li>
                  <span className="visual-avatar" aria-hidden />
                  <div>
                    <strong>rebrowser-a1b2c3d4</strong>
                    <small>nkpro/chrome-novnc · :5980</small>
                  </div>
                  <span className="visual-pill visual-pill--ok">Running</span>
                </li>
                <li>
                  <span className="visual-avatar visual-avatar--alt" aria-hidden />
                  <div>
                    <strong>Your next session</strong>
                    <small>Provision from the console</small>
                  </div>
                  <span className="visual-pill">Ready</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="trust-strip shell-wide">
          <p className="trust-label">Built for isolated workloads</p>
          <div className="trust-logos">
            <span>Docker</span>
            <span>noVNC</span>
            <span>Express</span>
            <span>React</span>
            <span>Let's Encrypt–ready</span>
          </div>
        </section>

        <section id="how-it-works" className="features-inspo shell-wide">
          <div className="features-inspo-head">
            <h2>Why Rebrowser?</h2>
            <p className="features-inspo-sub">
              Everything you need to hand someone a browser without handing them your machine—clear container names,
              ports, and image in the dashboard.
            </p>
          </div>
          <div className="features-inspo-grid">
            <article className="inspo-card">
              <div className="inspo-card-visual inspo-card-visual--blue" />
              <h3>One session, one container</h3>
              <p>Named Docker containers with CPU, memory, and shared-memory limits. Stop the session and the container goes away.</p>
            </article>
            <article className="inspo-card">
              <div className="inspo-card-visual inspo-card-visual--violet" />
              <h3>See what is running</h3>
              <p>Session id, container name, Docker id, host port, and image—all in one professional console.</p>
            </article>
            <article className="inspo-card">
              <div className="inspo-card-visual inspo-card-visual--peach" />
              <h3>Email OTP sign-in</h3>
              <p>Short-lived JWTs and per-user session ownership so only you can open or end your browsers.</p>
            </article>
          </div>
        </section>

        <section id="security" className="cta-inspo shell-wide">
          <div className="cta-inspo-inner">
            <h2>Provision a clean browser in one click</h2>
            <p>Sign in with your email, open the console, and launch a new session. First start may take a moment while the image warms up.</p>
            <Link to={isAuthenticated ? "/dashboard" : "/sign-in"} className="btn btn-ink btn-lg btn-pill">
              {isAuthenticated ? "Go to console" : "Start now"}
              <span className="btn-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer-inspo shell-wide">
        <span>© Rebrowser · disposable remote browsers</span>
        <span className="footer-inspo-links">Docker · noVNC · Express · React</span>
      </footer>
    </div>
  );
}
