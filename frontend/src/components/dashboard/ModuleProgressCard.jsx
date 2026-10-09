import { useState } from "react";
import { ArrowUpRight, BarChart3, CircleCheckBig, Target, CheckCircle2, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { getModuleTheme } from "../../utils/moduleAdapter";
import { CertificateModal } from "../certificate/CertificateModal";
import "./dashboard.css";

export function ModuleProgressCard({ row, index = 0 }) {
  const [showCertModal, setShowCertModal] = useState(false);

  const {
    id,
    slug,
    title,
    description,
    difficulty,
    week,
    totalDays,
    completedDays,
    completionPercent,
    totalQuizzes,
    attemptedQuizzes,
    quizProgressPercent,
    quizScore,
    totalQuizScore,
    progressUpdatedAt,
  } = row;

  const moduleTheme = getModuleTheme(slug);
  const isFullyCompleted = totalDays > 0 && completedDays >= totalDays;
  const displayPercent = isFullyCompleted ? 100 : Math.min(completionPercent, 99);
  const lastSynced = progressUpdatedAt
    ? new Date(progressUpdatedAt).toLocaleDateString()
    : "Awaiting first sync";

  return (
    <article className="dashboard-module-card">
      <div
        className="dashboard-module-card-top"
        style={{
          background: `${moduleTheme.banner}, radial-gradient(circle at top right, ${moduleTheme.dot} 1px, transparent 1px)`,
          backgroundSize: "auto, 14px 14px",
          boxShadow: `0 20px 45px ${moduleTheme.bannerShadow}`,
        }}
      >
        <div>
          <span className="dashboard-module-label">
          Module {week ?? index + 1} · {difficulty || "Guided track"}
          </span>
          <h3>{title}</h3>
        </div>
        <div className="dashboard-module-badge">
          {isFullyCompleted ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700 }}>
              <CheckCircle2 size={15} /> Done
            </span>
          ) : (
            `${displayPercent}%`
          )}
        </div>
      </div>

      <div className="dashboard-module-card-body">
        <div className="dashboard-module-meta">
          <span>{completedDays}/{totalDays} days done</span>
          <span>{attemptedQuizzes}/{totalQuizzes} quizzes</span>
          <span>{lastSynced}</span>
        </div>

        {isFullyCompleted ? (
          <div className="dashboard-module-completed-badge">
            <CheckCircle2 size={16} />
            All days completed — module finished!
          </div>
        ) : (
          <div className="dashboard-module-progress">
            <div style={{ width: `${displayPercent}%`, background: moduleTheme.button }} />
          </div>
        )}

        <div className="dashboard-module-stats">
          <MiniStat
            icon={<CircleCheckBig size={15} />}
            label="Module progress"
            value={`${completedDays}/${totalDays}`}
            detail={`${displayPercent}% complete`}
          />
          <MiniStat
            icon={<BarChart3 size={15} />}
            label="Quiz progress"
            value={`${attemptedQuizzes}/${totalQuizzes}`}
            detail={`${quizProgressPercent}% attempted`}
          />
          <MiniStat
            icon={<Target size={15} />}
            label="Score"
            value={quizScore}
            detail={totalQuizScore ? `out of ${totalQuizScore}` : "No score yet"}
          />
        </div>

        <div className="dashboard-module-footer">
          <div>
            <strong>Next step</strong>
            <p>
              {isFullyCompleted
                ? "This module is finished. Review the final task or polish your submission."
                : "Jump back into the next available day and keep your streak moving."}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {isFullyCompleted ? (
              <button
                type="button"
                onClick={() => setShowCertModal(true)}
                className="dashboard-module-cert-link"
                title="View & Download Completion Certificate"
              >
                <Award size={15} />
                Certificate
              </button>
            ) : null}
            {slug ? (
              <Link to={`/modules/${slug}`} className="dashboard-module-link">
                Open module
                <ArrowUpRight size={16} />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        moduleId={id}
        moduleTitle={title}
        week={week ?? index + 1}
      />
    </article>
  );
}

function MiniStat({ icon, label, value, detail }) {
  return (
    <div className="dashboard-mini-stat">
      <div className="dashboard-mini-stat-label">
        {icon}
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}
