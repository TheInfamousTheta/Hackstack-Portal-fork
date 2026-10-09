import { useEffect, useState, useCallback, useRef } from "react";
import { Check, Copy, Printer, X, Award, AlertCircle } from "lucide-react";
import { CertificateView } from "./CertificateView";
import { certificateService } from "../../services/certificateService";
import "./certificate.css";

export function CertificateModal({ isOpen, onClose, moduleId, moduleTitle, week }) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !moduleId) return;

    let isMounted = true;
    setLoading(true);
    setError("");

    certificateService
      .getModuleCertificate(moduleId)
      .then((res) => {
        if (!isMounted) return;
        setCertificate(res.certificate);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Failed to load completion certificate.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, moduleId]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!certificate?.certificateCode) return;
    const origin = window.location.origin;
    const baseUrl = import.meta.env.BASE_URL || "/";
    const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const shareUrl = `${origin}${cleanBase}certificate/${certificate.certificateCode}`;

    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!successful) throw new Error("Copy command failed");
      }
      setCopyError(false);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      setCopyError(true);
      copyTimeoutRef.current = setTimeout(() => setCopyError(false), 3000);
    }
  }, [certificate?.certificateCode]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const origin = window.location.origin;
  const baseUrl = import.meta.env.BASE_URL || "/";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const verificationUrl = certificate
    ? `${origin}${cleanBase}certificate/${certificate.certificateCode}`
    : "";

  return (
    <div
      className="hs-cert-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="hs-cert-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
      >
        <div className="hs-cert-modal-header no-print">
          <div className="hs-cert-modal-header-copy">
            <Award size={22} className="text-amber-400" />
            <div>
              <h3 id="cert-modal-title">Module Completion Certificate</h3>
              <span>{moduleTitle ? `${moduleTitle} · Week ${week || 1}` : "Official SWC Certificate"}</span>
            </div>
          </div>

          <div className="hs-cert-modal-actions no-print">
            {certificate ? (
              <>
                <button
                  type="button"
                  className={`hs-cert-btn-share no-print ${copyError ? "hs-cert-btn-share-error" : ""}`}
                  onClick={handleCopyLink}
                  title={copyError ? "Could not copy link to clipboard" : "Copy permanent verification link"}
                >
                  {copied ? (
                    <Check size={15} />
                  ) : copyError ? (
                    <AlertCircle size={15} />
                  ) : (
                    <Copy size={15} />
                  )}
                  <span>
                    {copied
                      ? "Link Copied!"
                      : copyError
                        ? "Copy Failed"
                        : "Share Link"}
                  </span>
                </button>

                <button
                  type="button"
                  className="hs-cert-btn-print no-print"
                  onClick={handlePrint}
                  title="Print or Save as PDF"
                >
                  <Printer size={16} />
                  <span>Save as PDF / Print</span>
                </button>
              </>
            ) : null}

            <button
              type="button"
              className="hs-cert-btn-close no-print"
              onClick={onClose}
              aria-label="Close certificate modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="hs-cert-modal-body">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Generating your official certificate...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-400 flex flex-col items-center gap-2">
              <AlertCircle size={28} />
              <p>{error}</p>
              <button
                type="button"
                className="mt-2 text-xs text-slate-400 underline hover:text-slate-200"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          ) : certificate ? (
            <CertificateView
              certificate={certificate}
              verificationUrl={verificationUrl}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
