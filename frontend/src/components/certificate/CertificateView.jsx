import { Award, ShieldCheck } from "lucide-react";

export function CertificateView({ certificate, verificationUrl }) {
  if (!certificate) return null;

  const {
    recipientName,
    moduleTitle,
    week,
    certificateCode,
    issuedAt,
  } = certificate;

  const formattedDate = issuedAt
    ? new Date(issuedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  return (
    <div className="hs-cert-container" id="printable-certificate">
      <div className="hs-cert-border-outer">
        <div className="hs-cert-border-inner">
          {/* Corner Decors */}
          <div className="hs-cert-corner hs-cert-corner-tl" />
          <div className="hs-cert-corner hs-cert-corner-tr" />
          <div className="hs-cert-corner hs-cert-corner-bl" />
          <div className="hs-cert-corner hs-cert-corner-br" />

          {/* Watermark */}
          <div className="hs-cert-watermark">
            <img
              src={`${import.meta.env.BASE_URL}swc-logo.webp`}
              alt="SWC IIT Guwahati watermark"
            />
          </div>

          <div className="hs-cert-content">
            {/* Header: Logos & Authority */}
            <header className="hs-cert-header">
              <div className="hs-cert-logo-badge">
                <img
                  src={`${import.meta.env.BASE_URL}swc-logo.webp`}
                  alt="SWC Logo"
                  className="hs-cert-logo-img"
                />
              </div>
              <div className="hs-cert-authority-text">
                <span className="hs-cert-org">STUDENTS' WEB COMMITTEE</span>
                <span className="hs-cert-inst">INDIAN INSTITUTE OF TECHNOLOGY GUWAHATI</span>
              </div>
            </header>

            {/* Certificate Title */}
            <div className="hs-cert-title-section">
              <h1 className="hs-cert-title">CERTIFICATE OF COMPLETION</h1>
              <p className="hs-cert-subtitle">HACKSTACK DEVELOPMENT INITIATIVE</p>
            </div>

            {/* Recipient Statement */}
            <div className="hs-cert-statement">
              <p className="hs-cert-label">This certificate is awarded to</p>
              <h2 className="hs-cert-recipient">{recipientName}</h2>
              <div className="hs-cert-divider" />
              <p className="hs-cert-text">
                for successfully completing all guided learning days, practical challenges, and milestone checkpoints for
              </p>
              <h3 className="hs-cert-module">
                {moduleTitle}
                {week ? <span className="hs-cert-module-week"> (Module {week})</span> : null}
              </h3>
            </div>

            {/* Signatures & Footer Metadata */}
            <footer className="hs-cert-footer">
              <div className="hs-cert-meta">
                <div className="hs-cert-meta-item">
                  <span className="hs-cert-meta-label">Date of Issue</span>
                  <span className="hs-cert-meta-val">{formattedDate}</span>
                </div>
                <div className="hs-cert-meta-item">
                  <span className="hs-cert-meta-label">Certificate ID</span>
                  <span className="hs-cert-meta-val hs-cert-code">{certificateCode}</span>
                </div>
                {verificationUrl ? (
                  <div className="hs-cert-meta-item hs-cert-verification-chip">
                    <ShieldCheck size={14} />
                    <span>Verified Credential</span>
                  </div>
                ) : null}
              </div>

              {/* Verified Badge Centerpiece */}
              <div className="hs-cert-badge-center">
                <div className="hs-cert-seal">
                  <Award size={34} className="hs-cert-seal-icon" />
                  <span>SWC IITG</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="hs-cert-signatures">
                <div className="hs-cert-sign-block">
                  <div className="hs-cert-sign-line" />
                  <span className="hs-cert-sign-name">SWC Convener / Coordinator</span>
                  <span className="hs-cert-sign-title">Students' Web Committee, IIT Guwahati</span>
                </div>
                <div className="hs-cert-sign-block">
                  <div className="hs-cert-sign-line" />
                  <span className="hs-cert-sign-name">Hackstack Mentor</span>
                  <span className="hs-cert-sign-title">Technical Guidance & Mentorship</span>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
