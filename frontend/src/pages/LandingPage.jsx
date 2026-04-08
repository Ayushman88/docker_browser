import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const PRODUCT_TAGS = ["Isolated sessions", "Streamed desktop", "Account-based access"];

const DOCS_URL = (import.meta.env.VITE_DOCS_URL || "").trim();

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const docsHref = DOCS_URL || null;

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
            <a href="#platform">Platform</a>
            <a href="#documentation">Documentation</a>
            <a href="#security">Security</a>
            <a href="#faq">FAQ</a>
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
            <p className="hero-inspo-eyebrow">Cloud workspace isolation</p>
            <h1 className="hero-inspo-title">
              Disposable browser sessions with a{" "}
              <span className="hero-inspo-highlight">fresh environment every time.</span>
            </h1>
            <p className="hero-inspo-lede">
              Give your team a full desktop browser that runs outside the corporate laptop. Start a session when you
              need it, stream the desktop in the browser you already use, and end the session when the task is done.
              Nothing persists on the user device.
            </p>
            <div className="hero-inspo-tags">
              {PRODUCT_TAGS.map((t) => (
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
              <a href="#platform" className="btn btn-outline btn-lg btn-pill">
                Explore the platform
              </a>
            </div>
            <div className="hero-stats-row">
              <div className="mini-stat">
                <strong>Runtime</strong>
                <span>Container per session</span>
              </div>
              <div className="mini-stat">
                <strong>Delivery</strong>
                <span>In-browser streaming</span>
              </div>
              <div className="mini-stat">
                <strong>Access</strong>
                <span>Email verification</span>
              </div>
            </div>
          </div>

          <div className="hero-inspo-visual" id="product">
            <div className="visual-card visual-card--accent float-slow">
              <span className="visual-card-label">Live utilization</span>
              <p className="visual-stat">
                <span className="visual-stat-num">Active</span>
                <span className="visual-stat-sub">Session streaming</span>
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
                <span className="visual-card-title">Your sessions</span>
              </div>
              <ul className="visual-list">
                <li>
                  <span className="visual-avatar" aria-hidden />
                  <div>
                    <strong>Session 7f4a9c2e</strong>
                    <small>Runtime connected · host port assigned</small>
                  </div>
                  <span className="visual-pill visual-pill--ok">Running</span>
                </li>
                <li>
                  <span className="visual-avatar visual-avatar--alt" aria-hidden />
                  <div>
                    <strong>Next session</strong>
                    <small>Provision from the console when you are ready</small>
                  </div>
                  <span className="visual-pill">Idle</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="trust-strip shell-wide">
          <p className="trust-label">Built for teams that need separation of duties</p>
          <div className="trust-pillars">
            <div className="trust-pillar">
              <span className="trust-pillar-title">Isolation</span>
              <span className="trust-pillar-desc">Each task gets its own boundary.</span>
            </div>
            <div className="trust-pillar">
              <span className="trust-pillar-title">Visibility</span>
              <span className="trust-pillar-desc">Operators see what is running and who owns it.</span>
            </div>
            <div className="trust-pillar">
              <span className="trust-pillar-title">Control</span>
              <span className="trust-pillar-desc">Sessions are tied to the signed-in account.</span>
            </div>
          </div>
        </section>

        <section id="platform" className="features-inspo shell-wide">
          <div className="features-inspo-head">
            <h2>Everything in one platform</h2>
            <p className="features-inspo-sub">
              Rebrowser is a control plane for short-lived browsers. You provision, stream, and retire sessions from a
              single console instead of shipping another laptop or VPN profile for every edge case.
            </p>
          </div>
          <div className="features-inspo-grid">
            <article className="inspo-card">
              <div className="inspo-card-visual inspo-card-visual--blue" />
              <h3>Predictable lifecycle</h3>
              <p>
                Every session maps to a dedicated runtime with resource limits. When you end the session, the runtime is
                torn down so the next launch starts clean.
              </p>
            </article>
            <article className="inspo-card">
              <div className="inspo-card-visual inspo-card-visual--violet" />
              <h3>Operational clarity</h3>
              <p>
                The console lists session identifiers, runtime names, host networking, and timestamps so support and
                security teams can audit activity without guessing.
              </p>
            </article>
            <article className="inspo-card">
              <div className="inspo-card-visual inspo-card-visual--peach" />
              <h3>Familiar access</h3>
              <p>
                People sign in with a verified email address. A time-bound token protects API calls, and ownership rules
                make sure users only touch their own sessions.
              </p>
            </article>
          </div>
        </section>

        <section className="use-cases shell-wide">
          <div className="use-cases-head">
            <h2>Where teams use Rebrowser</h2>
            <p className="use-cases-sub">
              The same product pattern supports research, vendor access, and sensitive workflows where the endpoint must
              not retain data.
            </p>
          </div>
          <div className="use-cases-grid">
            <article className="use-case-card">
              <h3>Third-party and vendor access</h3>
              <p>
                Open partner tools from an environment that is not your corporate desktop. Close the session when the
                call ends.
              </p>
            </article>
            <article className="use-case-card">
              <h3>Research and investigations</h3>
              <p>
                Collect web evidence or test content from a neutral session so personal cookies, extensions, and cached
                credentials stay out of scope.
              </p>
            </article>
            <article className="use-case-card">
              <h3>Training and demonstrations</h3>
              <p>
                Hand learners a consistent browser experience for labs or walkthroughs, then reset instantly between
                cohorts.
              </p>
            </article>
          </div>
        </section>

        <section id="documentation" className="doc-section shell-wide">
          <div className="doc-section-head">
            <h2>Documentation</h2>
            <p className="doc-section-lede">
              From first login to production hardening, your administrators need a single narrative. Use the topics
              below as a table of contents. Host the long-form guides wherever your company keeps technical references.
            </p>
            {docsHref ? (
              <a className="doc-external-link" href={docsHref} target="_blank" rel="noreferrer">
                Open the full documentation site
              </a>
            ) : (
              <>
                <p className="doc-env-hint">
                  Your organization can host detailed guides that follow these topics. Ask your administrator for the
                  link.
                </p>
                {import.meta.env.DEV && (
                  <p className="doc-env-hint doc-env-hint--dev">
                    Local dev: set <code className="mono-inline">VITE_DOCS_URL</code> in <code className="mono-inline">frontend/.env</code> to
                    surface a public documentation button here.
                  </p>
                )}
              </>
            )}
          </div>
          <div className="doc-grid">
            <article className="doc-card" id="doc-getting-started">
              <h3>Getting started</h3>
              <p>
                Account creation flow, console overview, and how to launch your first session. Include prerequisites for
                your container platform and network egress rules.
              </p>
            </article>
            <article className="doc-card" id="doc-architecture">
              <h3>Architecture</h3>
              <p>
                How the control plane speaks to the runtime layer, which ports are exposed, and how streaming reaches the
                user browser. Essential for solution design reviews.
              </p>
            </article>
            <article className="doc-card" id="doc-api">
              <h3>API reference</h3>
              <p>
                Authenticated HTTP endpoints for session listing, creation, and teardown. Document headers, rate limits,
                and error semantics for client integrations.
              </p>
            </article>
            <article className="doc-card" id="doc-operations">
              <h3>Operations</h3>
              <p>
                Health checks, metrics signals, backup paths for persisted metadata, and upgrade playbooks. Pair with your
                existing on-call and incident runbooks.
              </p>
            </article>
          </div>
        </section>

        <section id="security" className="security-band shell-wide">
          <div className="security-band-inner">
            <h2>Security at the core</h2>
            <ul className="security-list">
              <li>
                <strong>Transport and headers.</strong> The product ships with hardened HTTP defaults suitable for
                internet-facing deployments when paired with your TLS termination strategy.
              </li>
              <li>
                <strong>Authentication and abuse prevention.</strong> Sign-in is gated behind email verification with
                throttling so automation cannot overwhelm your mail system or the API surface.
              </li>
              <li>
                <strong>Ownership and audit signals.</strong> Sessions are scoped to the authenticated identity, with
                structured audit events for security monitoring pipelines.
              </li>
            </ul>
          </div>
        </section>

        <section id="faq" className="faq-section shell-wide">
          <h2 className="faq-title">Frequently asked questions</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary>What am I actually running?</summary>
              <p>
                You are running a full desktop browser inside an isolated runtime. The product streams that desktop to
                you through your web browser so you do not install special client software.
              </p>
            </details>
            <details className="faq-item">
              <summary>What happens when I end a session?</summary>
              <p>
                The runtime is stopped and removed from the host. Local caches, downloads inside the session, and open
                tabs go away with it. Plan exports before you click end if you need to keep something.
              </p>
            </details>
            <details className="faq-item">
              <summary>Who can access my sessions?</summary>
              <p>
                Only the same signed-in identity that created a session can list or terminate it through the API. Your
                organization still sets policy for who may sign in at all.
              </p>
            </details>
            <details className="faq-item">
              <summary>Does the first launch take longer?</summary>
              <p>
                Yes, cold starts may take longer while images are prepared on the host. Later launches are typically
                faster. Document expected timing for your operators so users know what normal looks like.
              </p>
            </details>
          </div>
        </section>

        <section className="cta-inspo shell-wide">
          <div className="cta-inspo-inner">
            <h2>Ready to give your team a clean browser on demand?</h2>
            <p>
              Sign in, open the console, and start a session in minutes. Bring your own infrastructure guides for
              compliance, then map them to the documentation topics above.
            </p>
            <Link to={isAuthenticated ? "/dashboard" : "/sign-in"} className="btn btn-ink btn-lg btn-pill">
              {isAuthenticated ? "Go to console" : "Create an account"}
              <span className="btn-arrow" aria-hidden>
                →
              </span>
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer-inspo shell-wide">
        <div className="footer-inspo-row">
          <span className="footer-inspo-copy">© {new Date().getFullYear()} Rebrowser. All rights reserved.</span>
          <nav className="footer-inspo-nav" aria-label="Footer">
            <a href="#documentation">Documentation</a>
            <Link to="/sign-in">Sign in</Link>
            <a href="#faq">FAQ</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
