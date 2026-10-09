import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ShieldCheck, AlertTriangle, ArrowLeft, Printer, Loader2 } from "lucide-react";
import { CertificateView } from "../components/certificate/CertificateView";
import { certificateService } from "../services/certificateService";
import "../components/certificate/certificate.css";

export default function PublicCertificatePage() {
  const { certCode } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!certCode) return;
    setLoading(true);
    setError("");

    certificateService
      .verifyCertificate(certCode)
      .then((res) => {
        setData(res.certificate);
      })
      .catch((err) => {
        setError(err.message || "Certificate could not be verified.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [certCode]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="hs-cert-public-page">
      <div className="hs-cert-public-banner no-print">
        <div className="hs-cert-public-badge">
          {loading ? (
            <>
              <Loader2 size={24} className="animate-spin text-sky-400" />
              <div>
                <h4>Verifying Credential…</h4>
                <p>Checking Hackstack certificate registry...</p>
              </div>
            </>
          ) : error || !data ? (
            <>
              <AlertTriangle size={24} className="text-amber-500" />
              <div>
                <h4>Unverified Credential</h4>
                <p>This certificate ID is not recognized in the Hackstack registry.</p>
              </div>
            </>
          ) : (
            <>
              <ShieldCheck size={26} className="hs-cert-public-badge-icon" />
              <div>
                <h4>Authentic SWC Credential</h4>
                <p>Official Certificate issued by Students' Web Committee, IIT Guwahati</p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!loading && data ? (
            <button
              type="button"
              onClick={handlePrint}
              className="hs-cert-btn-print"
              title="Print or Save PDF"
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
          ) : null}

          <Link to="/" className="hs-cert-btn-share flex items-center gap-1">
            <ArrowLeft size={14} />
            <span>Hackstack Home</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
          <span>Verifying certificate credentials...</span>
        </div>
      ) : error ? (
        <div className="p-12 text-center text-rose-400 bg-slate-900 border border-slate-800 rounded-xl max-w-md flex flex-col items-center gap-3">
          <AlertTriangle size={36} className="text-amber-400" />
          <h3 className="text-lg font-bold text-white">Certificate Not Found</h3>
          <p className="text-sm text-slate-400">{error}</p>
          <Link
            to="/"
            className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
          >
            Go to Hackstack Portal
          </Link>
        </div>
      ) : data ? (
        <CertificateView
          certificate={data}
          verificationUrl={window.location.href}
        />
      ) : null}
    </div>
  );
}
