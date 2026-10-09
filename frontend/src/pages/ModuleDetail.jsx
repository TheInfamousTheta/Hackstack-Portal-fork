import { useMemo, useState, useCallback } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { DayModal } from "../components/DayModal";
import { CertificateModal } from "../components/certificate/CertificateModal";
import { Markdown } from "../components/Markdown";
import { useAuth } from "../context/AuthContext";
import { useModules } from "../context/ModulesContext";
import {
  extractMarkdownGoals,
  extractMarkdownSummary,
  extractMarkdownTask,
} from "../utils/moduleContent";
import "./modules.css";

function ModuleDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const {
    modules,
    loading,
    error,
    registeredModuleIds,
    getProgressForModule,
    getQuizzesForModule,
    completeDay,
    submitQuiz,
  } = useModules();

  const module = useMemo(
    () => modules.find((entry) => entry.slug === slug),
    [modules, slug],
  );

  const [openDayId, setOpenDayId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [pendingDayId, setPendingDayId] = useState("");
  const [isCertOpen, setIsCertOpen] = useState(false);

  const isRegistered = module ? registeredModuleIds.includes(module.id) : false;
  const moduleDays = module?.days || [];
  const progress = module ? getProgressForModule(module.id) : null;

  const completedSet = useMemo(
    () => new Set((progress?.completedDays || []).map((id) => id.toString())),
    [progress?.completedDays],
  );

  const attemptsByQuizDayId = useMemo(
    () =>
      new Map(
        (progress?.quizScores || []).map((entry) => [
          entry.dayId?.toString(),
          entry,
        ]),
      ),
    [progress?.quizScores],
  );

  const attemptedQuizIds = useMemo(
    () => new Set((progress?.attemptedQuizIds || []).map((id) => id.toString())),
    [progress?.attemptedQuizIds],
  );

  const moduleQuizzes = useMemo(
    () =>
      module
        ? [...getQuizzesForModule(module.id)].sort((left, right) => {
            const leftTime = left?.createdAt
              ? new Date(left.createdAt).getTime()
              : 0;
            const rightTime = right?.createdAt
              ? new Date(right.createdAt).getTime()
              : 0;
            return leftTime - rightTime;
          })
        : [],
    [getQuizzesForModule, module],
  );

  const resolvedQuizByDayId = useMemo(() => {
    if (!module) return new Map();

    const exactMatches = new Map();
    const unmatchedQuizzes = [];
    const moduleDayIds = new Set(
      moduleDays.map((day) => day.id).filter(Boolean),
    );

    for (const quiz of moduleQuizzes) {
      const quizDayId = quiz.dayId?.toString();

      if (quizDayId && moduleDayIds.has(quizDayId)) {
        exactMatches.set(quizDayId, quiz);
      } else {
        unmatchedQuizzes.push(quiz);
      }
    }

    const resolved = new Map();
    let fallbackIndex = 0;

    for (const day of moduleDays) {
      const exactQuiz = exactMatches.get(day.id);

      if (exactQuiz) {
        resolved.set(day.id, exactQuiz);
        continue;
      }

      if (fallbackIndex < unmatchedQuizzes.length) {
        resolved.set(day.id, unmatchedQuizzes[fallbackIndex]);
        fallbackIndex += 1;
      }
    }

    return resolved;
  }, [module, moduleDays, moduleQuizzes]);

  const enrichedDays = useMemo(
    () =>
      moduleDays.map((day, index) => {
        const quiz = resolvedQuizByDayId.get(day.id) || null;
        const completed = completedSet.has(day.id);
        const locked = false;

        return {
          ...day,
          quiz,
          questionCount: quiz?.questions?.length || 0,
          totalPoints:
            quiz?.questions?.reduce(
              (sum, question) => sum + (question.points || 0),
              0,
            ) || 0,
          completed,
          locked,
          summary: extractMarkdownSummary(day.contentMarkdown),
          goals: extractMarkdownGoals(day.contentMarkdown),
          task: extractMarkdownTask(day.contentMarkdown),
        };
      }),
    [moduleDays, resolvedQuizByDayId, completedSet],
  );

  const completionPercent = useMemo(
    () =>
      module?.dayCount > 0
        ? Math.round((completedSet.size / module.dayCount) * 100)
        : 0,
    [completedSet.size, module?.dayCount],
  );

  const isModuleCompleted = useMemo(
    () =>
      Boolean(
        progress?.moduleCompleted ||
          (module?.dayCount > 0 && completedSet.size >= module.dayCount),
      ),
    [progress?.moduleCompleted, module?.dayCount, completedSet.size],
  );

  const finalTaskContent = useMemo(
    () =>
      module?.finalTask ||
      `## Final Task\n\nBuild something that proves you understood ${module?.title || "this module"}.\n\n### Requirements\n- Complete every learning day in the module\n- Apply the concepts to a real mini project\n- Share your final submission with your mentors\n\n### Deliverable\nSubmit your project link and a short walkthrough of what you built.`,
    [module?.finalTask, module?.title],
  );

  const freshOpenDay = useMemo(
    () => enrichedDays.find((day) => day.id === openDayId) || null,
    [enrichedDays, openDayId],
  );

  const { openDayQuiz, quizQuestions } = useMemo(() => {
    const quiz =
      freshOpenDay?.quiz || resolvedQuizByDayId.get(freshOpenDay?.id);
    return {
      openDayQuiz: quiz || null,
      quizQuestions: quiz?.questions || [],
    };
  }, [freshOpenDay, resolvedQuizByDayId]);

  const openDayAttempt = useMemo(() => {
    if (!openDayQuiz) return null;

    const quizIdStr = openDayQuiz._id?.toString() || openDayQuiz.id;
    const quizDayIdStr = openDayQuiz.dayId?.toString();

    const result = quizDayIdStr ? attemptsByQuizDayId.get(quizDayIdStr) : null;
    const hasAttempt =
      (quizIdStr && attemptedQuizIds.has(quizIdStr)) || Boolean(result);

    if (!hasAttempt) return null;

    return {
      score: result?.score ?? 0,
      userAnswers: result?.userAnswers || [],
      totalMarks:
        openDayQuiz.questions?.reduce(
          (sum, question) => sum + (question.points || 0),
          0,
        ) || 0,
    };
  }, [openDayQuiz, attemptedQuizIds, attemptsByQuizDayId]);

  const openDayScore = openDayAttempt?.score;

  if (loading) {
    return (
      <div className="modules-shell">
        <div className="modules-panel modules-empty-state">
          Loading module...
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="modules-shell">
        <div className="modules-panel modules-empty-state">
          <p>Module not found.</p>
          <Link to="/modules" className="module-back-link">
            <ArrowLeft size={16} />
            Back to modules
          </Link>
        </div>
      </div>
    );
  }

  const handleDayAction = async (dayId, _score, userAnswers) => {
    if (!isRegistered) return;

    const quiz = resolvedQuizByDayId.get(dayId);
    setActionError("");
    setPendingDayId(dayId);

    try {
      if (quiz && Array.isArray(userAnswers)) {
        await submitQuiz(quiz._id, userAnswers);
      } else {
        await completeDay(module.id, dayId);
      }
    } catch (err) {
      setActionError(err.message || "Failed to update this day.");
    } finally {
      setPendingDayId("");
    }
  };

  return (
    <div
      className="modules-shell module-detail-shell"
      style={{
        "--module-banner": module.theme.banner,
        "--module-button": module.theme.button,
        "--module-accent": module.theme.accent,
        "--module-accent-soft": module.theme.accentSoft,
        "--module-accent-border": module.theme.accentBorder,
        "--module-dot": module.theme.dot,
        "--module-shadow": module.theme.bannerShadow,
      }}
    >
      <Link to="/modules" className="module-back-link">
        <ArrowLeft size={16} />
        All courses
      </Link>

      <header className="module-detail-hero">
        <div className="module-detail-hero-copy">
          <span className="module-badge">Module {module.week}</span>
          <div className="module-detail-title-row">
            <div className="module-card-icon">
              <Sparkles size={18} />
            </div>
            <div>
              <small>{module.difficulty || "Guided stack"}</small>
              <h2>{module.title}</h2>
            </div>
          </div>
          <p>{module.description}</p>
        </div>

        <div className="module-detail-hero-side">
          <div className="module-detail-progress-copy">
            <span>{completionPercent}% complete</span>
            <strong>
              {completedSet.size}/{module.dayCount} days done
            </strong>
          </div>
          <div className="module-detail-progress-line">
            <div style={{ width: `${completionPercent}%` }} />
          </div>
          <div className="module-detail-hero-actions">
            {isModuleCompleted ? (
              <button
                type="button"
                onClick={() => setIsCertOpen(true)}
                className="module-certificate-action"
              >
                <Award size={16} />
                View Certificate
              </button>
            ) : null}
            <Link to="/dashboard" className="module-secondary-action">
              View full results
            </Link>
            <a href="#module-final-task" className="module-primary-action">
              Final task
            </a>
          </div>
        </div>
      </header>

      {error ? (
        <div className="modules-alert modules-alert-danger">{error}</div>
      ) : null}
      {actionError ? (
        <div className="modules-alert modules-alert-danger">{actionError}</div>
      ) : null}

      {module.tempInfo ? (
        <div className="module-temp-info-banner">
          <div className="module-temp-info-header">
            <span className="module-temp-info-badge">Updates</span>
            <h4></h4>
          </div>
          <p className="module-temp-info-text">{module.tempInfo}</p>
        </div>
      ) : null}

      {module.learningOutcomes.length > 0 ? (
        <section className="module-learning-strip">
          {module.learningOutcomes.map((outcome) => (
            <span key={outcome}>{outcome}</span>
          ))}
        </section>
      ) : null}

      <section className="module-section">
        <div className="module-section-heading">
          <div>
            <h3>Daily Tasks</h3>
            <p>
              Work through each day in order. Every completed lesson pushes your
              module progress and unlocks the next step.
            </p>
          </div>
        </div>

        <div className="module-days-grid">
          {enrichedDays.map((day) => (
            <button
              key={day.id}
              type="button"
              className={`module-day-card ${
                day.completed ? "is-complete" : ""
              } ${day.locked ? "is-locked" : ""}`}
              disabled={day.locked}
              onClick={() => {
                setOpenDayId(day.id);
                setActionError("");
              }}
            >
              <div className="module-day-card-top">
                <span className="module-day-pill">Day {day.day}</span>
                {day.completed ? <CheckCircle2 size={16} /> : null}
              </div>
              <h4>{day.title}</h4>
              <p>
                {day.summary ||
                  "Open this lesson to read the brief and complete the task."}
              </p>
              <div className="module-day-chip-row">
                {day.videoUrl ? (
                  <span>
                    <PlayCircle size={13} />
                    Video
                  </span>
                ) : null}
                {day.questionCount > 0 ? (
                  <span>
                    <ClipboardCheck size={13} />
                    {day.questionCount} Qs
                  </span>
                ) : null}
                {day.totalPoints > 0 ? (
                  <span>{day.totalPoints} pts</span>
                ) : null}
              </div>
              <div className="module-day-footer">
                <span>{day.task || "Open lesson brief"}</span>
                <ArrowUpRight size={15} />
              </div>
            </button>
          ))}

          {module.showFinalAssessment ? (
            <a href="#module-final-task" className="module-assessment-card">
              <div className="module-assessment-icon">
                <ClipboardCheck size={18} />
              </div>
              <strong>Final Assessment</strong>
              <span>
                {module.assessment?.type === "project"
                  ? "Project brief"
                  : "Final quiz or capstone"}
              </span>
            </a>
          ) : null}
        </div>
      </section>

      {module.showFinalAssessment ? (
        <section id="module-final-task" className="module-final-task">
          <div className="module-final-task-header">
            <span className="module-badge">Final task</span>
            <h3>
              {module.assessment?.type === "project"
                ? "Ship the capstone"
                : "Wrap up the module"}
            </h3>
          </div>

          <div className="module-final-task-body">
            <Markdown source={finalTaskContent} />
          </div>
        </section>
      ) : null}

      {freshOpenDay ? (
        <DayModal
          chapter={{
            ...freshOpenDay,
            quiz: quizQuestions,
          }}
          moduleTheme={module.theme}
          isCompleted={completedSet.has(freshOpenDay.id)}
          dailyScore={openDayScore}
          dailyQuizAttempt={openDayAttempt}
          userName={user?.username || "You"}
          submitting={pendingDayId === freshOpenDay.id}
          onClose={() => setOpenDayId(null)}
          onComplete={handleDayAction}
        />
      ) : null}

      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        moduleId={module.id || module._id}
        moduleTitle={module.title}
        week={module.week}
      />
    </div>
  );
}

export default ModuleDetail;
