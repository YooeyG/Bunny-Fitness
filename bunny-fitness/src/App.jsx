import { useState, useEffect } from "react";

// ─── HABITS DATA ─────────────────────────────────────────────
const LEFT_HABITS = [
  { id: "breakfast", label: "Breakfast", emoji: "🍳" },
  { id: "lunch", label: "Lunch", emoji: "🥗" },
  { id: "dinner", label: "Dinner", emoji: "🍽️" },
  { id: "snack", label: "Snack", emoji: "🍎" },
  { id: "water", label: "Water", emoji: "💧" },
];
const RIGHT_HABITS = [
  { id: "sleep", label: "Sleep", emoji: "😴" },
  { id: "deepwork", label: "Deep Work", emoji: "🧠" },
  { id: "gym", label: "Gym", emoji: "💪" },
  { id: "stretch", label: "Stretch", emoji: "🧘" },
  { id: "reading", label: "Reading", emoji: "📖" },
];
const ALL_HABITS = [...LEFT_HABITS, ...RIGHT_HABITS];
const TOTAL = ALL_HABITS.length;

// ─── WORKOUT DATA ─────────────────────────────────────────────
const WORKOUTS = [
  {
    id: "push-chest",
    label: "Push",
    sublabel: "Chest Focus",
    emoji: "🏋️",
    exercises: [
      "Incline DB Bench",
      "Chest Fly",
      "Tricep Extension",
      "Shoulder Press",
      "Lateral Raise",
      "Overhead Tricep",
    ],
  },
  {
    id: "push-shoulder",
    label: "Push",
    sublabel: "Shoulder Focus",
    emoji: "💪",
    exercises: [
      "Shoulder Press",
      "Lateral Raise",
      "Overhead Tricep",
      "Incline DB Bench",
      "Chest Fly",
      "Tricep Extension",
    ],
  },
  {
    id: "pull-lat",
    label: "Pull",
    sublabel: "Lat Focus",
    emoji: "🔙",
    exercises: [
      "Lat Pulldown",
      "Single Arm DB Row",
      "DB Bicep Curl",
      "Chest Supported Row",
      "Cable Face Pull",
      "Hammer Curl",
    ],
  },
  {
    id: "pull-upper",
    label: "Pull",
    sublabel: "Upper Back Focus",
    emoji: "🦾",
    exercises: [
      "Bent Over BB Row",
      "Cable Row",
      "Hammer Curl",
      "Pull Ups",
      "Cable Lat Row",
      "Bayesian Curls",
    ],
  },
  {
    id: "legs",
    label: "Legs",
    sublabel: "Full Legs",
    emoji: "🦵",
    exercises: [
      "DB Squat",
      "Leg Extension",
      "Hamstring Curl",
      "Calf Raise",
      "DB Lunges",
    ],
  },
];

// ─── CONSTANTS ────────────────────────────────────────────────
const RADIUS = 110;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GREEN = "#22c55e";

// ─── STORAGE HELPERS ──────────────────────────────────────────
function todayKey() { return new Date().toISOString().slice(0, 10); }

function ls(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function loadToday() { return ls("habits-" + todayKey(), {}); }
function loadHistory() { return ls("habits-history", []); }
function loadWorkoutHistory() { return ls("workout-history", []); }
function loadTodayWorkout(workoutId) { return ls("workout-" + workoutId + "-" + todayKey(), {}); }

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── SHARED COMPONENTS ────────────────────────────────────────
function ScoreRing({ score, total = TOTAL }) {
  const circ = 2 * Math.PI * RADIUS;
  const dashOffset = circ * (1 - score / total);
  const SIZE = (RADIUS + STROKE) * 2 + 4;
  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, marginBottom: 36 }}>
      <svg width={SIZE} height={SIZE}>
        <circle cx={SIZE/2} cy={SIZE/2} r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth={STROKE} />
        <circle cx={SIZE/2} cy={SIZE/2} r={RADIUS} fill="none" stroke={GREEN} strokeWidth={STROKE}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${SIZE/2} ${SIZE/2})`}
          style={{ transition: "stroke-dashoffset 0.4s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "72px", fontWeight: 700, color: GREEN, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{score}</span>
        <span style={{ color: "#9ca3af", fontSize: "14px", marginTop: 6 }}>/ {total}</span>
      </div>
    </div>
  );
}

function MiniRing({ score, total = TOTAL, size = 36 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / total);
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={GREEN} strokeWidth={5}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  );
}

function HabitButton({ label, emoji, done, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "11px 12px", borderRadius: "12px",
      border: done ? `1.5px solid ${GREEN}` : "1.5px solid #e5e7eb",
      background: done ? "#f0fdf4" : "#f9fafb",
      color: done ? "#16a34a" : "#6b7280",
      fontSize: "13px", fontWeight: 500,
      cursor: done ? "default" : "pointer",
      transition: "all 0.2s ease", textAlign: "left", fontFamily: "inherit", width: "100%",
    }}>
      <span style={{ fontSize: "16px" }}>{emoji}</span>
      <span>{label}</span>
      {done && <span style={{ marginLeft: "auto", fontSize: "12px", color: GREEN }}>✓</span>}
    </button>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────
function BottomNav({ screen, setScreen }) {
  const tabs = [
    { id: "habits", label: "Habits", emoji: "📖" },
    { id: "workout", label: "Workout", emoji: "💪" },
    { id: "nutrition", label: "Nutrition", emoji: "🍌" },
  ];
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#fff", borderTop: "1px solid #e5e7eb",
      display: "flex", zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setScreen(t.id)} style={{
          flex: 1, padding: "12px 0 16px", border: "none", background: "none",
          fontFamily: "inherit", cursor: "pointer",
          color: screen === t.id ? GREEN : "#9ca3af",
          display: "flex", flexDirection: "column", alignItems: "center", gap: "3px",
        }}>
          <span style={{ fontSize: "20px" }}>{t.emoji}</span>
          <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.05em" }}>{t.label}</span>
          {screen === t.id && <div style={{ width: 24, height: 2, background: GREEN, borderRadius: 2, marginTop: 2 }} />}
        </button>
      ))}
    </div>
  );
}

// ─── BUNNY HEADER ─────────────────────────────────────────────
function BunnyHeader() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: 24 }}>
      {/* SVG Rabbit in Knicks jersey */}
      <svg width="64" height="72" viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left ear */}
        <ellipse cx="22" cy="14" rx="6" ry="13" fill="#f3f3f3" stroke="#ddd" strokeWidth="1"/>
        <ellipse cx="22" cy="14" rx="3.5" ry="10" fill="#f9c6d0"/>
        {/* Right ear */}
        <ellipse cx="42" cy="14" rx="6" ry="13" fill="#f3f3f3" stroke="#ddd" strokeWidth="1"/>
        <ellipse cx="42" cy="14" rx="3.5" ry="10" fill="#f9c6d0"/>
        {/* Head */}
        <ellipse cx="32" cy="30" rx="16" ry="15" fill="#f3f3f3" stroke="#ddd" strokeWidth="1"/>
        {/* Eyes */}
        <circle cx="26" cy="27" r="2.5" fill="#222"/>
        <circle cx="38" cy="27" r="2.5" fill="#222"/>
        <circle cx="27" cy="26.2" r="0.8" fill="#fff"/>
        <circle cx="39" cy="26.2" r="0.8" fill="#fff"/>
        {/* Nose */}
        <ellipse cx="32" cy="32.5" rx="2" ry="1.2" fill="#f9a8b8"/>
        {/* Mouth */}
        <path d="M30 34 Q32 36 34 34" stroke="#ccc" strokeWidth="1" fill="none" strokeLinecap="round"/>
        {/* Cheeks */}
        <ellipse cx="23" cy="32" rx="3.5" ry="2" fill="#ffd6e0" opacity="0.6"/>
        <ellipse cx="41" cy="32" rx="3.5" ry="2" fill="#ffd6e0" opacity="0.6"/>
        {/* Jersey body - Knicks blue */}
        <rect x="16" y="44" width="32" height="26" rx="4" fill="#006BB6"/>
        {/* Jersey collar */}
        <path d="M26 44 Q32 50 38 44" fill="#F58426" stroke="#F58426" strokeWidth="1"/>
        {/* Jersey number - 1 */}
        <text x="29" y="63" fontSize="13" fontWeight="900" fill="#F58426" fontFamily="Arial">1</text>
        {/* Arms */}
        <ellipse cx="12" cy="52" rx="5" ry="9" rx="5" fill="#006BB6" transform="rotate(-10 12 52)"/>
        <ellipse cx="52" cy="52" rx="5" ry="9" fill="#006BB6" transform="rotate(10 52 52)"/>
        {/* Hands */}
        <ellipse cx="10" cy="60" rx="4" ry="3.5" fill="#f3f3f3" transform="rotate(-10 10 60)"/>
        <ellipse cx="54" cy="60" rx="4" ry="3.5" fill="#f3f3f3" transform="rotate(10 54 60)"/>
        {/* Neck */}
        <rect x="28" y="43" width="8" height="4" fill="#f3f3f3"/>
      </svg>

      {/* Title */}
      <div>
        <div style={{ fontSize: "28px", fontWeight: 800, color: "#111827", letterSpacing: "-0.5px", lineHeight: 1 }}>
          Bunny Fitness
        </div>
        <div style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 500, marginTop: 4, letterSpacing: "0.05em" }}>
          Excellence is Consistency
        </div>
      </div>
    </div>
  );
}

// ─── HABITS SCREEN ────────────────────────────────────────────
function HabitsScreen() {
  const [tab, setTab] = useState("today");
  const [completed, setCompleted] = useState(loadToday);
  const [history, setHistory] = useState(loadHistory);
  const score = Object.values(completed).filter(Boolean).length;

  useEffect(() => { lsSet("habits-" + todayKey(), completed); }, [completed]);

  useEffect(() => {
    const today = todayKey();
    const historyDates = new Set(history.map(h => h.date));
    const keys = Object.keys(localStorage).filter(k => k.startsWith("habits-") && k !== "habits-history");
    let updated = [...history]; let changed = false;
    keys.forEach(k => {
      const date = k.replace("habits-", "");
      if (date !== today && !historyDates.has(date)) {
        try {
          const data = JSON.parse(localStorage.getItem(k));
          const s = Object.values(data).filter(Boolean).length;
          updated.push({ date, score: s }); changed = true;
        } catch {}
      }
    });
    if (changed) { updated.sort((a, b) => b.date.localeCompare(a.date)); setHistory(updated); lsSet("habits-history", updated); }
  }, []);

  const tabBtn = (active) => ({
    flex: 1, padding: "10px 0", border: "none", background: "none", fontFamily: "inherit",
    fontSize: "13px", fontWeight: 600, color: active ? GREEN : "#9ca3af",
    borderBottom: active ? `2px solid ${GREEN}` : "2px solid #e5e7eb",
    cursor: "pointer", transition: "all 0.2s ease", letterSpacing: "0.05em",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <BunnyHeader />
      <div style={{ display: "flex", width: "100%", maxWidth: 380, marginBottom: 28 }}>
        <button style={tabBtn(tab === "today")} onClick={() => setTab("today")}>TODAY</button>
        <button style={tabBtn(tab === "history")} onClick={() => setTab("history")}>HISTORY</button>
      </div>

      {tab === "today" ? (
        <>
          <ScoreRing score={score} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", width: "100%", maxWidth: 380, marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {LEFT_HABITS.map(h => (
                <HabitButton key={h.id} label={h.label} emoji={h.emoji} done={!!completed[h.id]}
                  onToggle={() => { if (!completed[h.id]) setCompleted(p => ({ ...p, [h.id]: true })); }} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {RIGHT_HABITS.map(h => (
                <HabitButton key={h.id} label={h.label} emoji={h.emoji} done={!!completed[h.id]}
                  onToggle={() => { if (!completed[h.id]) setCompleted(p => ({ ...p, [h.id]: true })); }} />
              ))}
            </div>
          </div>
          <button onClick={() => setCompleted({})} style={{
            width: "100%", maxWidth: 380, padding: "14px", borderRadius: "12px",
            border: "1.5px solid #e5e7eb", background: "transparent", color: "#9ca3af",
            fontSize: "14px", fontWeight: 600, letterSpacing: "0.05em",
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#f43f5e"; e.target.style.color = "#f43f5e"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.color = "#9ca3af"; }}
          >Reset Day</button>
        </>
      ) : (
        <div style={{ width: "100%", maxWidth: 380 }}>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af", marginTop: 60, fontSize: "14px" }}>
              <p style={{ fontSize: "32px", margin: "0 0 12px" }}>📅</p>
              <p style={{ margin: 0 }}>No history yet.</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px" }}>Complete your first day to see it here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {history.map(entry => (
                <div key={entry.date} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "#f9fafb",
                }}>
                  <MiniRing score={entry.score} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{formatDate(entry.date)}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 2 }}>{entry.score} of {TOTAL} habits</div>
                  </div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: GREEN }}>{entry.score}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TIMER DURATIONS ─────────────────────────────────────────
const TIMER_OPTIONS = [
  { label: "30s", seconds: 30 },
  { label: "60s", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
];

// ─── AUDIO ALARM ─────────────────────────────────────────────
function playAlarm(audioCtxRef) {
  try {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    // Three ascending beeps
    [0, 0.3, 0.6].forEach((delay, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880 + i * 220; // 880, 1100, 1320 Hz
      osc.type = "sine";
      gain.gain.setValueAtTime(0, ctx.currentTime + delay);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + delay + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.25);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.3);
    });
  } catch (e) { console.warn("Audio not available", e); }
}

// ─── SESSION TIMER OPTIONS ────────────────────────────────────
const SESSION_OPTIONS = [
  { label: "30m", seconds: 1800 },
  { label: "45m", seconds: 2700 },
  { label: "60m", seconds: 3600 },
  { label: "75m", seconds: 4500 },
  { label: "90m", seconds: 5400 },
];

// ─── INLINE TIMER CARD ────────────────────────────────────────
// type: "rest" | "session"
function InlineTimerCard({ type, audioCtxRef }) {
  const opts = type === "rest" ? TIMER_OPTIONS : SESSION_OPTIONS;
  const defaultSec = type === "rest" ? 60 : 3600;
  const [selected, setSelected] = useState(defaultSec);
  const [timeLeft, setTimeLeft] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useState(null);

  useEffect(() => {
    if (running && timeLeft > 0) {
      intervalRef[0] = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(intervalRef[0]); setRunning(false); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef[0]);
  }, [running]);

  useEffect(() => {
    if (timeLeft === 0) playAlarm(audioCtxRef);
  }, [timeLeft]);

  function unlockAudio() {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume();
  }

  function start() { unlockAudio(); setTimeLeft(selected); setRunning(true); }
  function pause() { setRunning(false); }
  function reset() { setRunning(false); setTimeLeft(null); }

  const isFinished = timeLeft === 0;
  const progress = timeLeft !== null ? timeLeft / selected : 1;
  const displayTime = timeLeft !== null
    ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}`
    : `${Math.floor(selected / 60)}:${String(selected % 60).padStart(2, "0")}`;

  // Mini ring
  const r = 26; const circ = 2 * Math.PI * r; const offset = circ * (1 - progress);
  const ringColor = isFinished ? "#f43f5e" : type === "rest" ? "#3b82f6" : GREEN;

  return (
    <div style={{
      flex: 1, borderRadius: "14px", border: `1.5px solid ${running ? ringColor : "#e5e7eb"}`,
      background: running ? (type === "rest" ? "#eff6ff" : "#f0fdf4") : "#f9fafb",
      padding: "12px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
      transition: "all 0.3s ease",
    }}>
      {/* Label */}
      <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: running ? ringColor : "#9ca3af" }}>
        {type === "rest" ? "Rest" : "Session"}
      </span>

      {/* Mini ring + time */}
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <svg width={64} height={64}>
          <circle cx={32} cy={32} r={r} fill="none" stroke="#e5e7eb" strokeWidth={5} />
          <circle cx={32} cy={32} r={r} fill="none" stroke={ringColor} strokeWidth={5}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            transform="rotate(-90 32 32)"
            style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: isFinished ? "9px" : "11px", fontWeight: 700, color: isFinished ? "#f43f5e" : "#111827", fontVariantNumeric: "tabular-nums" }}>
            {isFinished ? "Done!" : displayTime}
          </span>
        </div>
      </div>

      {/* Duration picker */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", justifyContent: "center" }}>
        {opts.map(opt => (
          <button key={opt.seconds} onClick={() => { setSelected(opt.seconds); reset(); }} style={{
            padding: "3px 8px", borderRadius: "10px", border: "none", fontFamily: "inherit",
            background: selected === opt.seconds ? ringColor : "#e5e7eb",
            color: selected === opt.seconds ? "#fff" : "#6b7280",
            fontSize: "10px", fontWeight: 600, cursor: "pointer",
          }}>{opt.label}</button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "6px" }}>
        {!running && timeLeft === null && (
          <button onClick={start} style={{
            padding: "5px 14px", borderRadius: "8px", border: "none",
            background: ringColor, color: "#fff", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>Start</button>
        )}
        {running && (
          <button onClick={pause} style={{
            padding: "5px 14px", borderRadius: "8px", border: "none",
            background: "#e5e7eb", color: "#374151", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>Pause</button>
        )}
        {!running && timeLeft !== null && !isFinished && (
          <>
            <button onClick={start} style={{
              padding: "5px 10px", borderRadius: "8px", border: "none",
              background: ringColor, color: "#fff", fontSize: "12px", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>Resume</button>
            <button onClick={reset} style={{
              padding: "5px 10px", borderRadius: "8px", border: "none",
              background: "#e5e7eb", color: "#6b7280", fontSize: "12px", fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>Reset</button>
          </>
        )}
        {isFinished && (
          <button onClick={reset} style={{
            padding: "5px 14px", borderRadius: "8px", border: "none",
            background: "#f43f5e", color: "#fff", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}>Reset</button>
        )}
      </div>
    </div>
  );
}

// ─── WORKOUT SCREEN ───────────────────────────────────────────
function WorkoutScreen() {
  const [activeWorkout, setActiveWorkout] = useState(WORKOUTS[0].id);
  const [tab, setTab] = useState("today");
  const [allDone, setAllDone] = useState(() => {
    const state = {};
    WORKOUTS.forEach(w => { state[w.id] = loadTodayWorkout(w.id); });
    return state;
  });
  const [workoutHistory, setWorkoutHistory] = useState(loadWorkoutHistory);
  const audioCtxRef = useState(null);

  const workout = WORKOUTS.find(w => w.id === activeWorkout);
  const done = allDone[activeWorkout] || {};
  const completedCount = Object.values(done).filter(Boolean).length;
  const total = workout.exercises.length;

  function toggleExercise(ex) {
    if (done[ex]) return;
    const updated = { ...allDone, [activeWorkout]: { ...done, [ex]: true } };
    setAllDone(updated);
    lsSet("workout-" + activeWorkout + "-" + todayKey(), updated[activeWorkout]);
    const newDone = updated[activeWorkout];
    if (Object.values(newDone).filter(Boolean).length === total) {
      const entry = { date: todayKey(), workoutId: activeWorkout, workoutLabel: workout.label + " – " + workout.sublabel };
      const hist = [entry, ...workoutHistory.filter(h => !(h.date === todayKey() && h.workoutId === activeWorkout))];
      setWorkoutHistory(hist);
      lsSet("workout-history", hist);
    }
  }

  function resetWorkout() {
    const updated = { ...allDone, [activeWorkout]: {} };
    setAllDone(updated);
    lsSet("workout-" + activeWorkout + "-" + todayKey(), {});
  }

  const tabBtn = (active) => ({
    flex: 1, padding: "10px 0", border: "none", background: "none", fontFamily: "inherit",
    fontSize: "13px", fontWeight: 600, color: active ? GREEN : "#9ca3af",
    borderBottom: active ? `2px solid ${GREEN}` : "2px solid #e5e7eb",
    cursor: "pointer", transition: "all 0.2s ease", letterSpacing: "0.05em",
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <BunnyHeader />
      <div style={{ display: "flex", width: "100%", maxWidth: 380, marginBottom: 20 }}>
        <button style={tabBtn(tab === "today")} onClick={() => setTab("today")}>TODAY</button>
        <button style={tabBtn(tab === "history")} onClick={() => setTab("history")}>HISTORY</button>
      </div>

      {tab === "today" ? (
        <>
          {/* Workout selector tabs */}
          <div style={{ display: "flex", gap: "8px", width: "100%", maxWidth: 380, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
            {WORKOUTS.map(w => {
              const wDone = allDone[w.id] || {};
              const wCount = Object.values(wDone).filter(Boolean).length;
              const isActive = activeWorkout === w.id;
              return (
                <button key={w.id} onClick={() => setActiveWorkout(w.id)} style={{
                  flexShrink: 0, padding: "8px 14px", borderRadius: "20px",
                  border: isActive ? `1.5px solid ${GREEN}` : "1.5px solid #e5e7eb",
                  background: isActive ? "#f0fdf4" : "#f9fafb",
                  color: isActive ? "#16a34a" : "#6b7280",
                  fontSize: "12px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", whiteSpace: "nowrap",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "2px",
                }}>
                  <span>{w.emoji} {w.label}</span>
                  <span style={{ fontSize: "10px", fontWeight: 400, color: isActive ? "#16a34a" : "#9ca3af" }}>
                    {Object.values(wDone).filter(Boolean).length > 0 ? `${wCount}/${w.exercises.length}` : w.sublabel.split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Dual timers row — below plan tabs, above exercises */}
          <div style={{ display: "flex", gap: "10px", width: "100%", maxWidth: 380, marginBottom: 20 }}>
            <InlineTimerCard type="session" audioCtxRef={audioCtxRef} />
            <InlineTimerCard type="rest" audioCtxRef={audioCtxRef} />
          </div>

          {/* Workout header */}
          <div style={{ width: "100%", maxWidth: 380, marginBottom: 12 }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>{workout.label}</div>
            <div style={{ fontSize: "13px", color: "#9ca3af", marginTop: 2 }}>{workout.sublabel} · {completedCount}/{total} done</div>
          </div>

          {/* Progress bar */}
          <div style={{ width: "100%", maxWidth: 380, height: 6, background: "#e5e7eb", borderRadius: 99, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(completedCount / total) * 100}%`, background: GREEN, borderRadius: 99, transition: "width 0.4s ease" }} />
          </div>

          {/* Exercise list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%", maxWidth: 380, marginBottom: 24 }}>
            {workout.exercises.map((ex, i) => {
              const isDone = !!done[ex];
              return (
                <div key={ex} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button onClick={() => toggleExercise(ex)} style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "14px 16px", borderRadius: "12px", flex: 1,
                    border: isDone ? `1.5px solid ${GREEN}` : "1.5px solid #e5e7eb",
                    background: isDone ? "#f0fdf4" : "#f9fafb",
                    color: isDone ? "#16a34a" : "#374151",
                    fontSize: "14px", fontWeight: 500,
                    cursor: isDone ? "default" : "pointer",
                    transition: "all 0.2s ease", textAlign: "left", fontFamily: "inherit",
                  }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: isDone ? GREEN : "#e5e7eb",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 700, color: isDone ? "#fff" : "#9ca3af",
                    }}>{isDone ? "✓" : i + 1}</span>
                    <span>{ex}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {completedCount === total && (
            <div style={{ width: "100%", maxWidth: 380, padding: "14px", borderRadius: "12px", background: "#f0fdf4", border: `1.5px solid ${GREEN}`, textAlign: "center", marginBottom: 16 }}>
              <span style={{ fontSize: "20px" }}>🎉</span>
              <span style={{ marginLeft: 8, fontSize: "14px", fontWeight: 600, color: "#16a34a" }}>Workout complete!</span>
            </div>
          )}

          <button onClick={resetWorkout} style={{
            width: "100%", maxWidth: 380, padding: "14px", borderRadius: "12px",
            border: "1.5px solid #e5e7eb", background: "transparent", color: "#9ca3af",
            fontSize: "14px", fontWeight: 600, letterSpacing: "0.05em",
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease",
          }}
            onMouseEnter={e => { e.target.style.borderColor = "#f43f5e"; e.target.style.color = "#f43f5e"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.color = "#9ca3af"; }}
          >Reset Workout</button>
        </>
      ) : (
        <div style={{ width: "100%", maxWidth: 380 }}>
          {workoutHistory.length === 0 ? (
            <div style={{ textAlign: "center", color: "#9ca3af", marginTop: 60, fontSize: "14px" }}>
              <p style={{ fontSize: "32px", margin: "0 0 12px" }}>🏋️</p>
              <p style={{ margin: 0 }}>No workouts logged yet.</p>
              <p style={{ margin: "4px 0 0", fontSize: "12px" }}>Complete a workout to see it here.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {workoutHistory.map((entry, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "14px",
                  padding: "14px 16px", borderRadius: "12px", border: "1.5px solid #e5e7eb", background: "#f9fafb",
                }}>
                  <span style={{ fontSize: "28px" }}>{WORKOUTS.find(w => w.id === entry.workoutId)?.emoji || "🏋️"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>{entry.workoutLabel}</div>
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: 2 }}>{formatDate(entry.date)}</div>
                  </div>
                  <span style={{ fontSize: "16px", color: GREEN }}>✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── NUTRITION SCREEN ─────────────────────────────────────────
const MEALS = [
  { id: "breakfast", label: "Breakfast", emoji: "🍳" },
  { id: "lunch",     label: "Lunch",     emoji: "🥗" },
  { id: "dinner",    label: "Dinner",    emoji: "🍽️" },
  { id: "snack",     label: "Snack",     emoji: "🍎" },
];

const MACRO_FIELDS = [
  { id: "calories", label: "Calories", unit: "kcal", color: "#f97316" },
  { id: "protein",  label: "Protein",  unit: "g",    color: "#3b82f6" },
  { id: "carbs",    label: "Carbs",    unit: "g",    color: "#eab308" },
  { id: "fat",      label: "Fat",      unit: "g",    color: "#a855f7" },
  { id: "sodium",   label: "Sodium",   unit: "mg",   color: "#ef4444" },
];

function loadNutrition() { return ls("nutrition-" + todayKey(), {}); }

// Number pad component
function NumPad({ value, onChange, onDone, label, unit }) {
  function press(k) {
    if (k === "⌫") { onChange(value.slice(0, -1)); return; }
    if (k === "." && value.includes(".")) return;
    if (value === "0" && k !== ".") { onChange(k); return; }
    onChange((value || "") + k);
  }
  const keys = ["1","2","3","4","5","6","7","8","9",".","0","⌫"];
  return (
    <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", padding: "20px 16px 32px", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af" }}>{label}</span>
        <div style={{ fontSize: "40px", fontWeight: 700, color: "#111827", minHeight: 52, fontVariantNumeric: "tabular-nums" }}>
          {value || "0"} <span style={{ fontSize: "16px", color: "#9ca3af", fontWeight: 500 }}>{unit}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: 14 }}>
        {keys.map(k => (
          <button key={k} onClick={() => press(k)} style={{
            padding: "16px", borderRadius: "12px", border: "none",
            background: k === "⌫" ? "#fee2e2" : "#f3f4f6",
            color: k === "⌫" ? "#ef4444" : "#111827",
            fontSize: "20px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>{k}</button>
        ))}
      </div>
      <button onClick={onDone} style={{
        width: "100%", padding: "16px", borderRadius: "12px", border: "none",
        background: GREEN, color: "#fff", fontSize: "16px", fontWeight: 700,
        cursor: "pointer", fontFamily: "inherit",
      }}>Done</button>
    </div>
  );
}

// Food entry modal
function FoodEntryModal({ mealId, onSave, onClose }) {
  const [name, setName] = useState("");
  const [values, setValues] = useState({ calories: "", protein: "", carbs: "", fat: "", sodium: "" });
  const [activeField, setActiveField] = useState(null);
  const [step, setStep] = useState("name"); // "name" | "macros"

  function handleNext() {
    if (!name.trim()) return;
    setStep("macros");
    setActiveField("calories");
  }

  function handleSave() {
    const entry = {
      id: Date.now(),
      name: name.trim(),
      calories: parseFloat(values.calories) || 0,
      protein:  parseFloat(values.protein)  || 0,
      carbs:    parseFloat(values.carbs)    || 0,
      fat:      parseFloat(values.fat)      || 0,
      sodium:   parseFloat(values.sodium)   || 0,
    };
    onSave(mealId, entry);
    onClose();
  }

  const activeFieldMeta = MACRO_FIELDS.find(f => f.id === activeField);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
      zIndex: 300,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, overflow: "hidden" }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 14 }}>
          <div style={{ width: 40, height: 4, background: "#e5e7eb", borderRadius: 99 }} />
        </div>

        {step === "name" ? (
          <div style={{ padding: "20px 20px 40px" }}>
            <p style={{ margin: "0 0 16px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#9ca3af", textAlign: "center" }}>
              What did you eat?
            </p>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleNext()}
              placeholder="e.g. Grilled chicken breast"
              style={{
                width: "100%", padding: "14px 16px", borderRadius: "12px",
                border: "1.5px solid #e5e7eb", fontSize: "16px", fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", marginBottom: 16,
                color: "#111827",
              }}
            />
            <button onClick={handleNext} disabled={!name.trim()} style={{
              width: "100%", padding: "15px", borderRadius: "12px", border: "none",
              background: name.trim() ? GREEN : "#e5e7eb",
              color: name.trim() ? "#fff" : "#9ca3af",
              fontSize: "16px", fontWeight: 700, cursor: name.trim() ? "pointer" : "default",
              fontFamily: "inherit", transition: "all 0.2s",
            }}>Next → Log Macros</button>
          </div>
        ) : (
          <div>
            {/* Macro field tabs */}
            <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", overflowX: "auto" }}>
              {MACRO_FIELDS.map(f => (
                <button key={f.id} onClick={() => setActiveField(f.id)} style={{
                  flex: 1, padding: "12px 8px", border: "none", background: "none",
                  fontFamily: "inherit", cursor: "pointer", whiteSpace: "nowrap",
                  fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em",
                  color: activeField === f.id ? f.color : "#9ca3af",
                  borderBottom: activeField === f.id ? `2px solid ${f.color}` : "2px solid transparent",
                  transition: "all 0.2s",
                }}>
                  {f.label}
                  {values[f.id] && <span style={{ display: "block", fontSize: "12px", fontWeight: 600, color: f.color }}>{values[f.id]}{f.unit}</span>}
                </button>
              ))}
            </div>

            {activeField && (
              <NumPad
                label={activeFieldMeta.label}
                unit={activeFieldMeta.unit}
                value={values[activeField]}
                onChange={v => setValues(prev => ({ ...prev, [activeField]: v }))}
                onDone={() => {
                  const idx = MACRO_FIELDS.findIndex(f => f.id === activeField);
                  const next = MACRO_FIELDS[idx + 1];
                  if (next) setActiveField(next.id);
                  else handleSave();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NutritionScreen() {
  const [entries, setEntries] = useState(loadNutrition);
  const [addingTo, setAddingTo] = useState(null); // mealId

  useEffect(() => { lsSet("nutrition-" + todayKey(), entries); }, [entries]);

  function saveEntry(mealId, entry) {
    setEntries(prev => ({
      ...prev,
      [mealId]: [...(prev[mealId] || []), entry],
    }));
  }

  function deleteEntry(mealId, entryId) {
    setEntries(prev => ({
      ...prev,
      [mealId]: (prev[mealId] || []).filter(e => e.id !== entryId),
    }));
  }

  // Daily totals
  const allEntries = Object.values(entries).flat();
  const totals = MACRO_FIELDS.reduce((acc, f) => {
    acc[f.id] = allEntries.reduce((s, e) => s + (e[f.id] || 0), 0);
    return acc;
  }, {});

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
      <BunnyHeader />

      {/* Daily totals card */}
      <div style={{
        width: "100%", maxWidth: 380, borderRadius: "16px",
        border: "1.5px solid #e5e7eb", background: "#f9fafb",
        padding: "16px", marginBottom: 24,
      }}>
        <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: 700, color: "#374151", letterSpacing: "0.05em" }}>TODAY'S TOTALS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
          {MACRO_FIELDS.map(f => (
            <div key={f.id} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: f.color, fontVariantNumeric: "tabular-nums" }}>
                {Math.round(totals[f.id])}
              </div>
              <div style={{ fontSize: "9px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginTop: 2 }}>{f.label}</div>
              <div style={{ fontSize: "9px", color: "#d1d5db" }}>{f.unit}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Meal sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: 380 }}>
        {MEALS.map(meal => {
          const mealEntries = entries[meal.id] || [];
          const mealTotals = MACRO_FIELDS.reduce((acc, f) => {
            acc[f.id] = mealEntries.reduce((s, e) => s + (e[f.id] || 0), 0);
            return acc;
          }, {});

          return (
            <div key={meal.id} style={{ borderRadius: "14px", border: "1.5px solid #e5e7eb", overflow: "hidden" }}>
              {/* Meal header */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 14px", background: "#f9fafb", borderBottom: mealEntries.length > 0 ? "1px solid #e5e7eb" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "18px" }}>{meal.emoji}</span>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827" }}>{meal.label}</div>
                    {mealEntries.length > 0 && (
                      <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: 1 }}>
                        {Math.round(mealTotals.calories)} kcal · {Math.round(mealTotals.protein)}g P · {Math.round(mealTotals.carbs)}g C · {Math.round(mealTotals.fat)}g F
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setAddingTo(meal.id)} style={{
                  width: 32, height: 32, borderRadius: "50%", border: "none",
                  background: GREEN, color: "#fff", fontSize: "20px", fontWeight: 300,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  lineHeight: 1, flexShrink: 0,
                }}>+</button>
              </div>

              {/* Food entries */}
              {mealEntries.map(entry => (
                <div key={entry.id} style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "10px 14px", borderBottom: "1px solid #f3f4f6",
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{entry.name}</div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: 2 }}>
                      <span style={{ color: "#f97316" }}>{entry.calories}kcal</span>
                      {" · "}<span style={{ color: "#3b82f6" }}>{entry.protein}g P</span>
                      {" · "}<span style={{ color: "#eab308" }}>{entry.carbs}g C</span>
                      {" · "}<span style={{ color: "#a855f7" }}>{entry.fat}g F</span>
                      {entry.sodium > 0 && <>{" · "}<span style={{ color: "#ef4444" }}>{entry.sodium}mg Na</span></>}
                    </div>
                  </div>
                  <button onClick={() => deleteEntry(meal.id, entry.id)} style={{
                    width: 28, height: 28, borderRadius: "50%", border: "none",
                    background: "#fee2e2", color: "#ef4444", fontSize: "14px",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>×</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {addingTo && (
        <FoodEntryModal
          mealId={addingTo}
          onSave={saveEntry}
          onClose={() => setAddingTo(null)}
        />
      )}

      {/* Reset */}
      <div style={{ width: "100%", maxWidth: 380, marginTop: 24 }}>
        <button
          onClick={() => setEntries({})}
          style={{
            width: "100%", padding: "14px", borderRadius: "12px",
            border: "1.5px solid #e5e7eb", background: "transparent", color: "#9ca3af",
            fontSize: "14px", fontWeight: 600, letterSpacing: "0.05em",
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.target.style.borderColor = "#f43f5e"; e.target.style.color = "#f43f5e"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.color = "#9ca3af"; }}
        >Reset Day</button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("habits");

  return (
    <div style={{
      minHeight: "100vh", background: "#ffffff",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "32px 16px 90px", boxSizing: "border-box",
    }}>
      {screen === "habits" && <HabitsScreen />}
      {screen === "workout" && <WorkoutScreen />}
      {screen === "nutrition" && <NutritionScreen />}
      <BottomNav screen={screen} setScreen={setScreen} />
    </div>
  );
}
