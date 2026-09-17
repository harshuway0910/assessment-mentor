import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileArchive,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EduCheck AI — Teacher Review Console" },
      { name: "description", content: "A calm, teacher-first workspace for AI-assisted grading and similarity review." },
      { property: "og:title", content: "EduCheck AI — Teacher Review Console" },
      { property: "og:description", content: "A calm, teacher-first workspace for AI-assisted grading and similarity review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EduCheckApp,
});

type ViewKey =
  | "dashboard"
  | "courses"
  | "assignments"
  | "assessments"
  | "similarity"
  | "grading"
  | "review"
  | "gradebook"
  | "reports"
  | "settings";

type Status = "pending" | "flagged" | "approved";

type Course = {
  name: string;
  code: string;
  section: string;
  students: number;
  assignments: number;
  reviews: number;
  flags: number;
  tone: string;
};

type ReviewItem = {
  id: number;
  student: string;
  roll: string;
  type: "Similarity flag" | "AI grading review" | "AI detection flag" | "Approved";
  detail: string;
  score: number;
  similarity: number;
  aiContent: number;
  status: Status;
};

const courses: Course[] = [
  { name: "Data Structures", code: "CS201", section: "A", students: 48, assignments: 8, reviews: 6, flags: 3, tone: "lav" },
  { name: "Database Management Systems", code: "CS202", section: "B", students: 42, assignments: 6, reviews: 3, flags: 1, tone: "blue" },
  { name: "Object Oriented Programming", code: "CS203", section: "A", students: 62, assignments: 7, reviews: 9, flags: 8, tone: "sage" },
  { name: "Machine Learning", code: "DS301", section: "A", students: 36, assignments: 5, reviews: 4, flags: 2, tone: "amber" },
];

const initialReviews: ReviewItem[] = [
  { id: 1, student: "Rahul Sharma", roll: "2024-047", type: "Similarity flag", detail: "Rahul ↔ Amit · 94%", score: 82, similarity: 94, aiContent: 31, status: "flagged" },
  { id: 2, student: "Amit Patil", roll: "2024-051", type: "Similarity flag", detail: "Rahul ↔ Amit · 94%", score: 79, similarity: 94, aiContent: 27, status: "flagged" },
  { id: 3, student: "Sneha Iyer", roll: "2024-018", type: "AI grading review", detail: "AI content 72% indicated", score: 88, similarity: 6, aiContent: 72, status: "pending" },
  { id: 4, student: "Karan Mehta", roll: "2024-036", type: "Approved", detail: "Clean · 4%", score: 84, similarity: 4, aiContent: 12, status: "approved" },
  { id: 5, student: "Meera Nair", roll: "2024-029", type: "AI detection flag", detail: "AI content 68% indicated", score: 74, similarity: 9, aiContent: 68, status: "pending" },
  { id: 6, student: "Daniel Mensah", roll: "2024-012", type: "AI grading review", detail: "AI suggestion · rubric ready", score: 91, similarity: 3, aiContent: 18, status: "pending" },
];

const navSections: { label: string; items: { key: ViewKey; label: string; icon: LucideIcon; count?: number }[] }[] = [
  {
    label: "Workspace",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { key: "courses", label: "My Courses", icon: BookOpen },
      { key: "assignments", label: "Assignments", icon: FolderOpen },
      { key: "assessments", label: "Assessments", icon: ClipboardCheck },
      { key: "similarity", label: "Similarity Check", icon: ShieldAlert },
      { key: "grading", label: "AI Grading", icon: Sparkles },
      { key: "review", label: "Review Queue", icon: CheckCircle2, count: 9 },
      { key: "gradebook", label: "Gradebook", icon: BarChart3 },
      { key: "reports", label: "Reports", icon: Activity },
    ],
  },
  { label: "Account", items: [{ key: "settings", label: "Settings", icon: Settings }] },
];

const rubricRows = [
  { name: "Understanding", description: "Conceptual clarity and depth", weight: 30, max: 30, score: 25 },
  { name: "Accuracy", description: "Correctness of solution", weight: 30, max: 30, score: 27 },
  { name: "Methodology", description: "Process and reasoning", weight: 20, max: 20, score: 16 },
  { name: "Presentation", description: "Structure and communication", weight: 20, max: 20, score: 14 },
];

const defaultCourse: Course = {
  name: "Object Oriented Programming",
  code: "CS203",
  section: "A",
  students: 62,
  assignments: 7,
  reviews: 9,
  flags: 8,
  tone: "sage",
};

const defaultReview: ReviewItem = {
  id: 1,
  student: "Rahul Sharma",
  roll: "2024-047",
  type: "Similarity flag",
  detail: "Rahul ↔ Amit · 94%",
  score: 82,
  similarity: 94,
  aiContent: 31,
  status: "flagged",
};

function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "lav" | "sage" | "clay" | "amber" }) {
  return <span className={cn("inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-medium", `tone-${tone}`)}>{children}</span>;
}

function ProgressLine({ value, tone = "lav" }: { value: number; tone?: "lav" | "sage" | "clay" | "amber" }) {
  return <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className={cn("progress-draw h-full rounded-full", `bar-${tone}`)} style={{ width: `${value}%` }} /></div>;
}

function SectionTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 animate-fade-up">
      <div>
        {eyebrow && <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-faint">{eyebrow}</p>}
        <h1 className="font-display text-3xl leading-tight tracking-tight text-ink sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-ink">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function EduCheckApp() {
  const [view, setView] = useState<ViewKey>("dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [search, setSearch] = useState("");
  const [courseIndex, setCourseIndex] = useState(2);
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedReviewId, setSelectedReviewId] = useState(1);
  const [selectedPair, setSelectedPair] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(0);
  const [uploadFiles, setUploadFiles] = useState(["sharma_rahul_graphs.pdf", "patil_amit_graphs.docx", "verma_aisha_graphs.pdf"]);
  const [courseTab, setCourseTab] = useState("Overview");
  const [gradebookSearch, setGradebookSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [toast, setToast] = useState("");

  const course = courses[courseIndex] ?? defaultCourse;
  const selectedReview = reviews.find((item) => item.id === selectedReviewId) ?? defaultReview;
  const pendingCount = reviews.filter((item) => item.status !== "approved").length;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const navigate = (next: ViewKey) => {
    setView(next);
    setMobileNav(false);
    setSelectedPair(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const approveReview = () => {
    if (!selectedReview) return;
    setReviews((items) => items.map((item) => item.id === selectedReview.id ? { ...item, status: "approved", type: "Approved", detail: `Teacher approved · Final ${item.score}/100` } : item));
    showToast(`Final grade recorded for ${selectedReview.student}`);
  };

  const startAnalysis = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setProcessed(0);
    const timer = window.setInterval(() => {
      setProcessed((current) => {
        if (current >= 100) {
          window.clearInterval(timer);
          setIsProcessing(false);
          showToast("Analysis complete — 24 submissions ready for review");
          return 100;
        }
        return current + 20;
      });
    }, 320);
  };

  return (
    <div className="min-h-screen bg-paper font-sans text-ink antialiased">
      <div className="flex min-h-screen">
        <Sidebar active={view} onNavigate={navigate} mobileOpen={mobileNav} onClose={() => setMobileNav(false)} pendingCount={pendingCount} />
        <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
          <TopBar course={course} search={search} setSearch={setSearch} notifications={notifications} setNotifications={setNotifications} onMenu={() => setMobileNav(true)} />
          <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6 sm:py-8">
            {view === "dashboard" && <Dashboard onNavigate={navigate} onReview={(id) => { setSelectedReviewId(id); navigate("review"); }} pendingCount={pendingCount} course={course} />}
            {view === "courses" && <Courses courseIndex={courseIndex} setCourseIndex={setCourseIndex} courseTab={courseTab} setCourseTab={setCourseTab} onNavigate={navigate} search={search} />}
            {view === "assignments" && <Assignments course={course} uploadFiles={uploadFiles} setUploadFiles={setUploadFiles} processed={processed} isProcessing={isProcessing} startAnalysis={startAnalysis} onNavigate={navigate} showToast={showToast} />}
            {view === "assessments" && <Assessments course={course} onNavigate={navigate} showToast={showToast} />}
            {view === "similarity" && <Similarity selectedPair={selectedPair} setSelectedPair={setSelectedPair} onNavigate={navigate} />}
            {view === "grading" && <AIGrading reviews={reviews} onReview={(id) => { setSelectedReviewId(id); navigate("review"); }} onNavigate={navigate} showToast={showToast} />}
            {view === "review" && <ReviewWorkspace review={selectedReview} reviews={reviews} selectedId={selectedReviewId} setSelectedId={setSelectedReviewId} onApprove={approveReview} showToast={showToast} onNavigate={navigate} />}
            {view === "gradebook" && <Gradebook search={gradebookSearch} setSearch={setGradebookSearch} sortDesc={sortDesc} setSortDesc={setSortDesc} showToast={showToast} />}
            {view === "reports" && <Reports course={course} showToast={showToast} />}
            {view === "settings" && <SettingsView showToast={showToast} />}
          </main>
        </div>
      </div>
      {toast && <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm text-card shadow-xl animate-fade-up"><CheckCircle2 className="size-4 text-sage" />{toast}</div>}
    </div>
  );
}

function Sidebar({ active, onNavigate, mobileOpen, onClose, pendingCount }: { active: ViewKey; onNavigate: (view: ViewKey) => void; mobileOpen: boolean; onClose: () => void; pendingCount: number }) {
  return (
    <>
      {mobileOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-ink/20 lg:hidden" onClick={onClose} />}
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-line bg-card px-5 py-6 transition-transform duration-300 lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex items-center gap-2.5 px-1">
          <div className="grid size-8 place-items-center rounded-[7px] bg-ink text-card"><span className="font-display text-base leading-none">E</span></div>
          <div className="leading-tight"><p className="text-[13px] font-semibold tracking-tight">EduCheck</p><p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-faint">AI · Review</p></div>
          <Button size="icon" variant="ghost" className="ml-auto text-muted-ink lg:hidden" onClick={onClose}><X /></Button>
        </div>
        <nav className="mt-8 space-y-0.5 text-[13px]">
          {navSections.map((section) => <div key={section.label} className="mb-5"><div className="mb-2 px-3 text-[10px] uppercase tracking-[0.16em] text-faint">{section.label}</div>{section.items.map((item) => { const Icon = item.icon; const isActive = active === item.key; return <Button key={item.key} variant="ghost" onClick={() => onNavigate(item.key)} className={cn("flex h-9 w-full justify-start gap-3 rounded-lg px-3 font-normal text-muted-ink hover:bg-paper hover:text-ink", isActive && "bg-lav-soft font-medium text-ink hover:bg-lav-soft") }><Icon className={cn("size-4", isActive ? "text-amber-ink" : "text-faint")} /><span>{item.label}</span>{item.key === "review" && pendingCount > 0 && <span className="ml-auto rounded-full bg-lav px-1.5 py-0.5 text-[10px] text-card">{pendingCount}</span>}</Button>; })}</div>)}
        </nav>
        <div className="mt-auto rounded-[10px] border border-line bg-paper px-3 py-3"><p className="text-[11px] leading-snug text-muted-ink">AI suggests. <span className="font-medium text-ink">You stamp.</span></p><p className="mt-1 text-[10px] leading-relaxed text-faint">Every grade waits for your approval.</p></div>
      </aside>
    </>
  );
}

function TopBar({ course, search, setSearch, notifications, setNotifications, onMenu }: { course: Course; search: string; setSearch: (value: string) => void; notifications: boolean; setNotifications: (value: boolean) => void; onMenu: () => void }) {
  return <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-paper/90 px-4 py-3 backdrop-blur sm:px-6">
    <Button size="icon" variant="ghost" className="text-muted-ink lg:hidden" onClick={onMenu}><Menu /></Button>
    <div className="hidden items-center gap-2 text-[13px] md:flex"><span className="rounded-md border border-line bg-card px-2.5 py-1.5 font-medium">{course.code} · {course.name.split(" ")[0]}</span><span className="rounded-md border border-line bg-card px-2.5 py-1.5 text-muted-ink">Section {course.section}</span></div>
    <div className="relative flex w-full max-w-sm items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-muted-ink"><Search className="size-4 text-faint" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students, assignments…" className="h-7 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" /></div>
    <div className="ml-auto flex items-center gap-2 sm:gap-3"><div className="relative"><Button aria-label="Notifications" size="icon" variant="outline" className="rounded-full bg-card" onClick={() => setNotifications(!notifications)}><Bell className="size-4 text-muted-ink" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-clay ring-2 ring-card" /></Button>{notifications && <div className="absolute right-0 top-11 z-40 w-72 rounded-lg border border-line bg-card p-4 shadow-xl"><p className="text-sm font-semibold">Notifications</p><p className="mt-2 text-xs leading-relaxed text-muted-ink">3 similarity flags and 6 grades are waiting for your review.</p><Button size="sm" variant="link" className="mt-2 h-auto p-0 text-amber-ink">Open review queue <ArrowRight /></Button></div>}</div><div className="flex items-center gap-2"><div className="grid size-8 place-items-center rounded-full bg-lav-soft text-[11px] font-medium text-ink">PR</div><div className="hidden leading-tight sm:block"><p className="text-[12px] font-medium">Dr. Priya Rao</p><p className="text-[10px] text-faint">Instructor</p></div></div></div>
  </header>;
}

function Dashboard({ onNavigate, onReview, pendingCount, course }: { onNavigate: (view: ViewKey) => void; onReview: (id: number) => void; pendingCount: number; course: Course }) {
  const metrics = [{ label: "Total courses", value: "4", note: "All sections active", tone: "lav" }, { label: "Active assignments", value: "26", note: "4 due this week", tone: "blue" }, { label: "Pending reviews", value: `${pendingCount}`, note: "Teacher action needed", tone: "amber" }, { label: "Submissions checked", value: "188", note: "+24 this week", tone: "sage" }, { label: "Similarity flags", value: "5", note: "2 above 90%", tone: "clay" }, { label: "AI grades pending", value: "54", note: "Awaiting approval", tone: "lav" }, { label: "Average class score", value: "78", note: "+4 vs last term", tone: "sage" }];
  return <><SectionTitle eyebrow="Teacher console · Thursday, 10 October" title="Good afternoon, Dr. Rao" description="AI has prepared the repetitive work. Your next decision is waiting in the review queue." action={<Button onClick={() => onNavigate("assignments")} className="rounded-lg bg-ink text-card hover:bg-ink/90"><UploadCloud />Start batch upload</Button>} />
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">{metrics.map((metric) => <div key={metric.label} className="rounded-[12px] border border-line bg-card p-4"><div className={cn("mb-3 size-2 rounded-full", `dot-${metric.tone}`)} /><p className="text-xs font-medium text-muted-ink">{metric.label}</p><p className="mt-1 font-display text-3xl text-ink">{metric.value}{metric.label === "Average class score" && <span className="text-base text-muted-ink">/100</span>}</p><p className="mt-1 text-[11px] text-faint">{metric.note}</p></div>)}</div>
    <div className="mt-6 grid gap-5 xl:grid-cols-12"><div className="rounded-[14px] border border-line bg-card p-5 xl:col-span-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl">Recent activity</h2><p className="mt-1 text-xs text-muted-ink">A clear trail of what AI checked and what still needs you.</p></div><Button variant="ghost" size="sm" className="text-amber-ink" onClick={() => onNavigate("reports")}>View reports <ArrowRight /></Button></div><div className="mt-5 space-y-4">{[{ icon: CheckCircle2, tone: "sage", title: "AI grading completed", detail: "62 submissions · Object Oriented Programming", time: "12 min ago" }, { icon: ShieldAlert, tone: "clay", title: "Potential similarity detected", detail: "Rahul Sharma ↔ Amit Patil · 94%", time: "28 min ago" }, { icon: UploadCloud, tone: "lav", title: "Batch upload received", detail: "Assignment 3 · Data Structures · 24 files", time: "1 hr ago" }, { icon: ClipboardCheck, tone: "amber", title: "Rubric updated", detail: "Machine Learning · Model evaluation", time: "Yesterday" }].map((activity) => { const Icon = activity.icon; return <div key={activity.title} className="flex items-start gap-3"><div className={cn("grid size-8 shrink-0 place-items-center rounded-lg", `soft-${activity.tone}`)}><Icon className={cn("size-4", `icon-${activity.tone}`)} /></div><div className="min-w-0 flex-1"><p className="text-sm font-medium">{activity.title}</p><p className="mt-0.5 truncate text-xs text-muted-ink">{activity.detail}</p></div><span className="text-[11px] text-faint">{activity.time}</span></div>; })}</div></div><div className="rounded-[14px] border border-line bg-card p-5 xl:col-span-5"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl">Grade distribution</h2><p className="mt-1 text-xs text-muted-ink">{course.name} · Section {course.section}</p></div><span className="text-[11px] text-faint">62 submissions</span></div><div className="mt-6 flex h-40 items-end gap-3">{[{ label: "&lt;50", value: 24, tone: "clay" }, { label: "50", value: 42, tone: "lav" }, { label: "60", value: 72, tone: "lav" }, { label: "70", value: 100, tone: "amber" }, { label: "80", value: 68, tone: "sage" }, { label: "90", value: 38, tone: "sage" }].map((bar) => <div key={bar.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className={cn("w-full rounded-t-md", `chart-${bar.tone}`)} style={{ height: `${bar.value}%` }} /><span className="text-[10px] text-faint" dangerouslySetInnerHTML={{ __html: bar.label }} /></div>)}</div><div className="mt-5 border-t border-line pt-4"><div className="flex items-center justify-between"><p className="text-xs font-medium text-muted-ink">Similarity overview</p><span className="font-display text-xl">42%</span></div><ProgressLine value={42} tone="clay" /><p className="mt-2 text-[11px] leading-relaxed text-faint">Threshold 90%. Similarity is a flag for teacher review, not proof of plagiarism.</p></div></div></div>
    <div className="mt-5 rounded-[14px] border border-line bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl">Pending reviews</h2><p className="mt-1 text-xs text-muted-ink">Prioritized items requiring a teacher decision.</p></div><Button variant="outline" size="sm" onClick={() => onNavigate("review")}>Open queue <ArrowRight /></Button></div><div className="mt-4 grid gap-3 md:grid-cols-3">{initialReviews.slice(0, 3).map((item) => <div key={item.id} className="rounded-[10px] border border-line bg-paper p-4"><div className="flex items-center justify-between gap-2"><span className="text-sm font-medium">{item.student}</span><Pill tone={item.status === "flagged" ? "clay" : "lav"}>{item.status === "flagged" ? "Flagged" : "AI grading"}</Pill></div><p className="mt-2 text-xs leading-relaxed text-muted-ink">{item.type} · AI suggested {item.score}/100</p><Button size="sm" className="mt-3 w-full bg-ink text-card hover:bg-ink/90" onClick={() => onReview(item.id)}>Review item</Button></div>)}</div></div>
  </>;
}

function Courses({ courseIndex, setCourseIndex, courseTab, setCourseTab, onNavigate, search }: { courseIndex: number; setCourseIndex: (value: number) => void; courseTab: string; setCourseTab: (value: string) => void; onNavigate: (view: ViewKey) => void; search: string }) {
  const filtered = courses.filter((item) => `${item.name} ${item.code} ${item.section}`.toLowerCase().includes(search.toLowerCase()));
  const course = courses[courseIndex] ?? defaultCourse;
  return <><SectionTitle eyebrow="Workspace · course management" title="My courses" description="Keep every assignment, assessment, review, and gradebook separated by course and section." action={<Button className="rounded-lg bg-ink text-card"><BookOpen />Add course</Button>} /><div className="grid gap-4 md:grid-cols-2">{filtered.map((item) => { const index = courses.indexOf(item); return <button key={item.code} onClick={() => { setCourseIndex(index); setCourseTab("Overview"); }} className={cn("group rounded-[14px] border bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md", courseIndex === index ? "border-lav ring-2 ring-lav-soft" : "border-line")}><div className="flex items-start justify-between"><div className={cn("grid size-10 place-items-center rounded-lg", `soft-${item.tone}`)}><GraduationCap className={cn("size-5", `icon-${item.tone}`)} /></div><MoreHorizontal className="size-4 text-faint" /></div><div className="mt-4 flex items-end justify-between gap-2"><div><p className="font-display text-xl">{item.name}</p><p className="mt-1 text-xs text-muted-ink">{item.code} · Section {item.section}</p></div><span className="text-xs text-faint">{item.students} students</span></div><div className="mt-5 grid grid-cols-3 divide-x divide-line border-t border-line pt-4 text-center"><div><p className="text-lg font-semibold">{item.assignments}</p><p className="text-[10px] text-faint">Assignments</p></div><div><p className="text-lg font-semibold text-amber-ink">{item.reviews}</p><p className="text-[10px] text-faint">Reviews</p></div><div><p className="text-lg font-semibold text-clay">{item.flags}</p><p className="text-[10px] text-faint">Similarity</p></div></div></button>})}</div><div className="mt-6 rounded-[14px] border border-line bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[11px] uppercase tracking-[0.18em] text-faint">Selected course</p><h2 className="mt-1 font-display text-2xl">{course.name} <span className="text-base text-muted-ink">· {course.code} · Section {course.section}</span></h2></div><Button variant="outline" onClick={() => onNavigate("gradebook")}>Open gradebook <ArrowRight /></Button></div><div className="mt-5 flex flex-wrap gap-1 border-b border-line">{["Overview", "Assignments", "Assessments", "Students", "Gradebook", "Reports"].map((tab) => <Button key={tab} variant="ghost" onClick={() => { setCourseTab(tab); if (tab === "Assignments") onNavigate("assignments"); if (tab === "Assessments") onNavigate("assessments"); if (tab === "Gradebook") onNavigate("gradebook"); if (tab === "Reports") onNavigate("reports"); }} className={cn("rounded-none border-b-2 border-transparent px-3 text-xs text-muted-ink", courseTab === tab && "border-amber text-ink")}>{tab}</Button>)}</div><div className="grid gap-4 pt-5 md:grid-cols-3"><div><p className="text-xs text-muted-ink">Course health</p><p className="mt-2 font-display text-3xl">On track</p><p className="mt-1 text-xs text-sage">78% average · +4 pts this term</p></div><div><p className="text-xs text-muted-ink">Next deadline</p><p className="mt-2 font-display text-3xl">14 Oct</p><p className="mt-1 text-xs text-faint">Assignment 4 · 24 submissions expected</p></div><div><p className="text-xs text-muted-ink">Review load</p><p className="mt-2 font-display text-3xl">{course.reviews}</p><p className="mt-1 text-xs text-amber-ink">items waiting for you</p></div></div></div></>;
}

function Assignments({ course, uploadFiles, setUploadFiles, processed, isProcessing, startAnalysis, onNavigate, showToast }: { course: Course; uploadFiles: string[]; setUploadFiles: (files: string[]) => void; processed: number; isProcessing: boolean; startAnalysis: () => void; onNavigate: (view: ViewKey) => void; showToast: (message: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const addFiles = (files: FileList | null) => { if (!files) return; const names = Array.from(files).map((file) => file.name); setUploadFiles([...uploadFiles, ...names]); showToast(`${names.length} file${names.length === 1 ? "" : "s"} added to the batch`); };
  return <><SectionTitle eyebrow="Assignments · batch workflow" title="Upload student submissions" description="Upload a full batch, let EduCheck prepare the analysis, then review every result before grading is finalized." action={<Button variant="outline" onClick={() => onNavigate("similarity")}><ShieldAlert />View similarity flags</Button>} /><div className="grid gap-5 xl:grid-cols-12"><section className="rounded-[14px] border border-line bg-card p-5 xl:col-span-7"><div className="grid gap-4 md:grid-cols-2"><Field label="Course" value={`${course.name} · ${course.code}`} /><Field label="Section" value={`Section ${course.section}`} /><Field label="Assignment" value="Assignment 3 · Graph Traversal" /><Field label="Due date" value="18 October 2024" /></div><label onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }} className={cn("mt-5 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed p-6 text-center transition-colors", dragging ? "border-lav bg-lav-soft" : "border-line bg-paper hover:border-lav")}><input type="file" multiple className="hidden" accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.zip" onChange={(event) => addFiles(event.target.files)} /><div className="grid size-12 place-items-center rounded-full bg-lav-soft text-amber-ink"><UploadCloud className="size-6" /></div><p className="mt-4 font-display text-xl">Drop all student submissions here</p><p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-ink">PDF, DOC, DOCX, TXT, PPT, PPTX, or ZIP · multiple files supported</p><Button type="button" variant="outline" size="sm" className="mt-4">Browse files</Button></label><div className="mt-5 flex items-center justify-between"><div><p className="text-sm font-medium">Ready to analyze</p><p className="mt-1 text-xs text-muted-ink">AI will check similarity, content signals, and rubric readiness.</p></div><Button onClick={startAnalysis} disabled={isProcessing} className="bg-ink text-card hover:bg-ink/90">{isProcessing ? "Analyzing…" : "Start AI analysis"}<Sparkles /></Button></div>{isProcessing && <div className="mt-4 rounded-lg bg-lav-soft p-3"><div className="flex items-center justify-between text-xs"><span className="font-medium text-ink">Analyzing submission batch</span><span className="text-amber-ink">{processed}%</span></div><Progress value={processed} className="mt-2 bg-card" /><p className="mt-2 text-[11px] text-muted-ink">Simulated frontend analysis · teacher review remains required.</p></div>}</section><section className="rounded-[14px] border border-line bg-card p-5 xl:col-span-5"><div className="flex items-center justify-between"><div><h2 className="font-display text-xl">Batch queue</h2><p className="mt-1 text-xs text-muted-ink">{uploadFiles.length} files selected</p></div><Badge variant="outline">A3</Badge></div><div className="mt-5 space-y-3">{uploadFiles.map((file, index) => <div key={`${file}-${index}`} className="flex items-center gap-3 rounded-lg border border-line bg-paper p-3"><div className="grid size-9 shrink-0 place-items-center rounded-lg bg-lav-soft text-amber-ink">{file.endsWith(".zip") ? <FileArchive className="size-4" /> : <FileText className="size-4" />}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{file}</p><ProgressLine value={isProcessing ? Math.min(100, processed + index * 5) : 100} tone={index === 1 ? "clay" : "sage"} /></div><Button variant="ghost" size="icon" className="text-faint" onClick={() => setUploadFiles(uploadFiles.filter((_, fileIndex) => fileIndex !== index))}><X /></Button></div>)}</div><div className="mt-5 rounded-lg border border-line bg-paper p-3"><p className="text-xs font-medium">What happens next?</p><ol className="mt-2 space-y-2 text-[11px] leading-relaxed text-muted-ink"><li><span className="mr-2 text-amber-ink">01</span>Parse and organize each student file</li><li><span className="mr-2 text-amber-ink">02</span>Compare submissions at the 90% threshold</li><li><span className="mr-2 text-amber-ink">03</span>Prepare rubric suggestions for your approval</li></ol></div></section></div></>;
}

function Field({ label, value }: { label: string; value: string }) { return <label className="block"><span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-faint">{label}</span><div className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2.5 text-sm"><span>{value}</span><ChevronDown className="size-4 text-faint" /></div></label>; }

function Assessments({ course, onNavigate, showToast }: { course: Course; onNavigate: (view: ViewKey) => void; showToast: (message: string) => void }) {
  return <><SectionTitle eyebrow="Assessments · rubric setup" title="Create a grading rubric" description="Give AI a consistent structure to work from, then inspect and adjust every suggested mark yourself." action={<Button onClick={() => { showToast("Rubric saved as draft"); onNavigate("grading"); }} className="bg-ink text-card hover:bg-ink/90"><Sparkles />Start AI grading</Button>} /><div className="rounded-[14px] border border-line bg-card p-5"><div className="grid gap-4 md:grid-cols-3"><Field label="Course" value={`${course.name} · ${course.code}`} /><Field label="Section" value={`Section ${course.section}`} /><Field label="Assessment" value="Assignment 3 · Graph Traversal" /></div><div className="mt-6 overflow-hidden rounded-lg border border-line"><div className="grid grid-cols-12 gap-3 bg-paper px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint"><div className="col-span-3">Criterion</div><div className="col-span-5">Description</div><div className="col-span-2">Weight</div><div className="col-span-2">Max marks</div></div>{rubricRows.map((row) => <div key={row.name} className="grid grid-cols-12 items-center gap-3 border-t border-line px-4 py-4 text-sm"><div className="col-span-3 font-medium">{row.name}</div><div className="col-span-5 text-muted-ink">{row.description}</div><div className="col-span-2"><span className="rounded-md bg-lav-soft px-2 py-1 text-xs text-amber-ink">{row.weight}%</span></div><div className="col-span-2 text-muted-ink">{row.max} marks</div></div>)}</div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><Button variant="outline" onClick={() => showToast("New criterion row added to the mock rubric")}><span className="text-lg leading-none">+</span>Add criterion</Button><p className="text-xs text-faint">Total weight <span className="font-semibold text-ink">100%</span> · maximum 100 marks</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-3"><div className="rounded-[12px] border border-line bg-card p-4"><Sparkles className="size-5 text-amber-ink" /><p className="mt-3 text-sm font-medium">Rubric-aware suggestions</p><p className="mt-1 text-xs leading-relaxed text-muted-ink">AI scores against the criteria you define, not a generic answer key.</p></div><div className="rounded-[12px] border border-line bg-card p-4"><ShieldAlert className="size-5 text-clay" /><p className="mt-3 text-sm font-medium">Flags stay visible</p><p className="mt-1 text-xs leading-relaxed text-muted-ink">Similarity and AI-content indicators are shown beside every suggested grade.</p></div><div className="rounded-[12px] border border-line bg-card p-4"><CheckCircle2 className="size-5 text-sage" /><p className="mt-3 text-sm font-medium">Teacher is final</p><p className="mt-1 text-xs leading-relaxed text-muted-ink">No mark becomes final until you edit, approve, and stamp it.</p></div></div></>;
}

function Similarity({ selectedPair, setSelectedPair, onNavigate }: { selectedPair: boolean; setSelectedPair: (value: boolean) => void; onNavigate: (view: ViewKey) => void }) {
  return <><SectionTitle eyebrow="Integrity review · indicator, not proof" title="Similarity check" description="Potential similarity detected — teacher review required. Compare context before deciding what it means." action={<div className="flex items-center gap-2"><Pill tone="amber">Threshold 90%</Pill><Button variant="outline"><SlidersHorizontal />Adjust threshold</Button></div>} />{selectedPair ? <Comparison onBack={() => setSelectedPair(false)} /> : <><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><MetricMini label="Total submissions" value="62" /><MetricMini label="Checked" value="62" tone="sage" /><MetricMini label="Potential similarity" value="5" tone="amber" /><MetricMini label="High similarity" value="2" tone="clay" /></div><div className="mt-5 rounded-[14px] border border-line bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl">Flagged pairs</h2><p className="mt-1 text-xs text-muted-ink">Similarity cases are surfaced for context and teacher judgment.</p></div><Button variant="outline" onClick={() => onNavigate("assignments")}><UploadCloud />Upload more</Button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead><tr className="border-b border-line text-[10px] uppercase tracking-[0.14em] text-faint"><th className="px-3 py-3">Student A</th><th className="px-3 py-3">Student B</th><th className="px-3 py-3">Similarity</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Action</th></tr></thead><tbody>{[{ a: "Rahul Sharma", b: "Amit Patil", score: 94, status: "High similarity" }, { a: "Meera Nair", b: "Karan Rao", score: 91, status: "High similarity" }, { a: "Dev Joshi", b: "Ananya Gupta", score: 48, status: "Within range" }, { a: "Daniel Mensah", b: "Sneha Iyer", score: 36, status: "Within range" }].map((pair) => <tr key={`${pair.a}-${pair.b}`} className="border-b border-line last:border-0"><td className="px-3 py-4 font-medium">{pair.a}</td><td className="px-3 py-4 font-medium">{pair.b}</td><td className="px-3 py-4 font-display text-xl"><span className={pair.score >= 90 ? "text-clay" : "text-muted-ink"}>{pair.score}%</span></td><td className="px-3 py-4"><Pill tone={pair.score >= 90 ? "clay" : "sage"}>{pair.status}</Pill></td><td className="px-3 py-4 text-right"><Button size="sm" variant={pair.score >= 90 ? "default" : "outline"} onClick={() => setSelectedPair(true)}>{pair.score >= 90 ? "Compare" : "Inspect"}</Button></td></tr>)}</tbody></table></div></div></>}</>;
}

function MetricMini({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "sage" | "amber" | "clay" }) { return <div className="rounded-[12px] border border-line bg-card p-4"><p className="text-xs text-muted-ink">{label}</p><p className={cn("mt-2 font-display text-3xl", tone === "clay" && "text-clay", tone === "amber" && "text-amber-ink", tone === "sage" && "text-sage")}>{value}</p></div>; }

function Comparison({ onBack }: { onBack: () => void }) { return <><Button variant="ghost" className="mb-4 px-0 text-muted-ink" onClick={onBack}><ArrowLeft />Back to flagged pairs</Button><div className="grid gap-5 xl:grid-cols-2"><section className="rounded-[14px] border border-line bg-card p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] uppercase tracking-[0.16em] text-faint">Student A · Submission 047</p><h2 className="mt-1 font-display text-2xl">Rahul Sharma</h2></div><Pill tone="clay">94% similarity</Pill></div><p className="mt-5 text-sm leading-7 text-muted-ink">This report applies inheritance and polymorphism to model a banking transaction ledger, tracing how an abstract <mark>Account base class branches into Savings and Current subtypes</mark>.</p><div className="mt-4 rounded-lg border border-clay-soft bg-clay-soft p-3 text-xs leading-relaxed text-clay"><span className="mb-1 block font-semibold uppercase tracking-[0.12em]">Matching phrase</span>“…branches into Savings and Current subtypes, overriding the interest method…”</div></section><section className="rounded-[14px] border border-line bg-card p-5"><div className="flex items-start justify-between"><div><p className="text-[11px] uppercase tracking-[0.16em] text-faint">Student B · Submission 051</p><h2 className="mt-1 font-display text-2xl">Amit Patil</h2></div><Pill tone="clay">94% similarity</Pill></div><p className="mt-5 text-sm leading-7 text-muted-ink">The solution uses an abstract <mark>Account base class branches into Savings and Current subtypes</mark>, then overrides the interest method for each account type.</p><div className="mt-4 rounded-lg border border-clay-soft bg-clay-soft p-3 text-xs leading-relaxed text-clay"><span className="mb-1 block font-semibold uppercase tracking-[0.12em]">Matching phrase</span>“…branches into Savings and Current subtypes, overriding the interest method…”</div></section></div><div className="mt-5 grid gap-5 lg:grid-cols-3"><div className="rounded-[14px] border border-line bg-card p-5 lg:col-span-2"><h2 className="font-display text-xl">Comparison summary</h2><div className="mt-5 grid gap-5 sm:grid-cols-3"><div><p className="text-xs text-muted-ink">Text similarity</p><p className="mt-1 font-display text-3xl text-clay">94%</p><ProgressLine value={94} tone="clay" /></div><div><p className="text-xs text-muted-ink">Matching phrases</p><p className="mt-1 font-display text-3xl">12</p><p className="mt-1 text-xs text-faint">Across 4 sections</p></div><div><p className="text-xs text-muted-ink">AI content probability</p><p className="mt-1 font-display text-3xl text-amber-ink">31%</p><ProgressLine value={31} tone="amber" /></div></div><p className="mt-5 rounded-lg bg-lav-soft p-3 text-xs leading-relaxed text-muted-ink"><span className="font-semibold text-ink">Important:</span> AI detection is an indicator, not definitive proof. Final decisions should be made by the teacher.</p></div><div className="rounded-[14px] border border-line bg-card p-5"><h2 className="font-display text-xl">Teacher action</h2><p className="mt-2 text-xs leading-relaxed text-muted-ink">Record your context-based decision for this flag.</p><div className="mt-5 flex flex-col gap-2"><Button className="bg-ink text-card hover:bg-ink/90">Confirm concern</Button><Button variant="outline">Dismiss flag</Button><Button variant="ghost">Add note</Button></div></div></div></>; }

function AIGrading({ reviews, onReview, onNavigate, showToast }: { reviews: ReviewItem[]; onReview: (id: number) => void; onNavigate: (view: ViewKey) => void; showToast: (message: string) => void }) { return <><SectionTitle eyebrow="AI grading · rubric based" title="Suggested grades, ready for review" description="AI has scored against the active rubric. Review, edit, and approve each grade before it becomes final." action={<Button onClick={() => onNavigate("assessments")} variant="outline"><ClipboardCheck />Edit rubric</Button>} /><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><MetricMini label="Submissions processed" value="62" /><MetricMini label="Ready for review" value="54" tone="sage" /><MetricMini label="Flagged" value="8" tone="clay" /><MetricMini label="Average suggested" value="78" /></div><div className="mt-5 rounded-[14px] border border-line bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl">AI grading results</h2><p className="mt-1 text-xs text-muted-ink">Every row stays in Pending Review until you approve it.</p></div><Button variant="outline" onClick={() => showToast("AI grading rerun simulated for the current rubric")}><Sparkles />Rerun analysis</Button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b border-line text-[10px] uppercase tracking-[0.14em] text-faint"><th className="px-3 py-3">Student</th><th className="px-3 py-3">AI score</th><th className="px-3 py-3">Similarity</th><th className="px-3 py-3">AI content</th><th className="px-3 py-3">Status</th><th className="px-3 py-3 text-right">Review</th></tr></thead><tbody>{reviews.map((item) => <tr key={item.id} className="border-b border-line last:border-0"><td className="px-3 py-4"><p className="font-medium">{item.student}</p><p className="text-[11px] text-faint">{item.roll}</p></td><td className="px-3 py-4 font-display text-xl">{item.score}<span className="text-sm text-muted-ink">/100</span></td><td className="px-3 py-4"><span className={item.similarity >= 90 ? "text-clay" : "text-muted-ink"}>{item.similarity}%</span></td><td className="px-3 py-4"><Pill tone={item.aiContent >= 65 ? "amber" : "sage"}>{item.aiContent >= 65 ? "Indicated" : "Low"}</Pill></td><td className="px-3 py-4"><Pill tone={item.status === "approved" ? "sage" : item.status === "flagged" ? "clay" : "lav"}>{item.status === "approved" ? "Approved" : item.status === "flagged" ? "Flagged" : "Pending review"}</Pill></td><td className="px-3 py-4 text-right">{item.status === "approved" ? <span className="text-xs text-faint">Final {item.score}/100</span> : <Button size="sm" onClick={() => onReview(item.id)}>Review</Button>}</td></tr>)}</tbody></table></div></div></>; }

function ReviewWorkspace({ review, reviews, selectedId, setSelectedId, onApprove, showToast, onNavigate }: { review: ReviewItem; reviews: ReviewItem[]; selectedId: number; setSelectedId: (id: number) => void; onApprove: () => void; showToast: (message: string) => void; onNavigate: (view: ViewKey) => void }) { const [editing, setEditing] = useState(false); const [feedback, setFeedback] = useState("Good understanding of the core concept with accurate class modeling. Methodology depth is moderate and presentation could be tightened."); const [scores, setScores] = useState(rubricRows.map((row) => row.score)); const total = scores.reduce((sum, score) => sum + score, 0); return <><SectionTitle eyebrow="Teacher review · final decision" title="Review and stamp the grade" description="AI has suggested a mark and surfaced context. You remain the final decision-maker for every student." action={<div className="flex items-center gap-2"><Pill tone="sage">{reviews.filter((item) => item.status === "approved").length} approved</Pill><Pill tone="clay">{reviews.filter((item) => item.status !== "approved").length} waiting</Pill></div>} /><div className="mb-4 flex items-center gap-2 overflow-x-auto rounded-lg border border-line bg-card p-2"><span className="shrink-0 px-2 text-[10px] uppercase tracking-[0.14em] text-faint">Next review</span>{reviews.filter((item) => item.status !== "approved").map((item) => <Button key={item.id} size="sm" variant={item.id === selectedId ? "default" : "ghost"} className="shrink-0" onClick={() => setSelectedId(item.id)}>{item.student}</Button>)}</div><div className="grid gap-5 xl:grid-cols-12"><section className="flex flex-col rounded-[14px] border border-line bg-card p-5 xl:col-span-4"><div className="flex items-start justify-between"><div><p className="text-[11px] uppercase tracking-[0.16em] text-faint">Submission {review.roll}</p><h2 className="mt-1 font-display text-2xl">{review.student}</h2></div><Pill tone={review.similarity >= 90 ? "clay" : "sage"}>{review.similarity}% similarity</Pill></div><div className="mt-5 space-y-4 text-sm leading-7 text-muted-ink"><p className="font-medium text-ink">Abstract</p><p>This report applies inheritance and polymorphism to model a banking transaction ledger, tracing how an abstract <mark>Account base class branches into Savings and Current subtypes</mark>…</p><p className="rounded-lg border border-lav bg-lav-soft p-3 text-xs leading-relaxed text-muted-ink"><span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-amber-ink">Matching phrase flagged</span>“…traces how an abstract base class branches into Savings and Current subtypes…”</p></div><div className="mt-auto grid grid-cols-2 gap-3 border-t border-line pt-4"><div><p className="text-[10px] uppercase tracking-[0.14em] text-faint">Similarity</p><p className="font-display text-2xl">{review.similarity}%</p><ProgressLine value={review.similarity} tone={review.similarity >= 90 ? "clay" : "sage"} /></div><div><p className="text-[10px] uppercase tracking-[0.14em] text-faint">AI content</p><p className="font-display text-2xl">{review.aiContent}%</p><ProgressLine value={review.aiContent} tone="amber" /></div></div><Button variant="outline" className="mt-5" onClick={() => onNavigate("similarity")}>Open comparison</Button></section><section className="rounded-[14px] border border-line bg-card p-5 xl:col-span-4"><div className="mb-5 flex items-center justify-between"><p className="text-sm font-semibold">Rubric evaluation</p><span className="text-[11px] text-faint">Weighted · 100 marks</span></div><div className="space-y-5">{rubricRows.map((row, index) => <div key={row.name}><div className="mb-1.5 flex items-baseline justify-between text-sm"><span className="font-medium">{row.name}</span>{editing ? <div className="flex items-center gap-1"><Input type="number" value={scores[index]} onChange={(event) => setScores(scores.map((score, scoreIndex) => scoreIndex === index ? Number(event.target.value) : score))} className="h-7 w-14 px-2 text-center" /><span className="text-muted-ink">/{row.max}</span></div> : <span className="font-display text-base">{scores[index]}<span className="text-sm text-muted-ink">/{row.max}</span></span>}</div><ProgressLine value={(scores[index] / row.max) * 100} tone={index === 3 ? "amber" : "sage"} /></div>)}</div><div className="mt-6 border-t border-line pt-4"><label className="text-[11px] uppercase tracking-[0.14em] text-faint">Teacher feedback</label>{editing ? <Textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} className="mt-2 min-h-28 bg-paper" /> : <p className="mt-2 rounded-lg border border-line bg-paper px-3 py-2.5 text-xs leading-relaxed text-muted-ink">{feedback}</p>}</div></section><section className="flex flex-col rounded-[14px] border border-line bg-card p-5 xl:col-span-4"><div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold">AI summary</p><Pill tone="lav">Suggested</Pill></div><div className="flex items-end gap-3 rounded-[11px] border border-line bg-paper px-4 py-4"><p className="font-display text-5xl leading-none">{editing ? total : review.score}</p><div className="pb-1"><p className="text-xs text-muted-ink">Suggested score /100</p><p className="mt-1 text-[11px] text-faint">Model v2 · rubric CS203-A3</p></div></div><p className="mt-4 text-sm leading-relaxed text-muted-ink">“{feedback}”</p><div className="mt-4 rounded-[10px] border border-lav bg-lav-soft px-3 py-2.5 text-[11px] leading-snug text-muted-ink">Suggested only. AI never finalizes a grade — approval is yours.</div><div className="mt-auto flex flex-col gap-2 pt-5">{editing ? <Button className="bg-ink text-card hover:bg-ink/90" onClick={() => { setEditing(false); showToast("Grade edits saved for teacher review"); }}>Save edits</Button> : <Button className="bg-ink text-card hover:bg-ink/90" onClick={onApprove}><Check />Approve grade · Final {review.score}/100</Button>}<Button variant="outline" onClick={() => setEditing(!editing)}>{editing ? "Cancel editing" : "Edit grade"}</Button><div className="flex gap-2"><Button variant="outline" className="flex-1 text-clay" onClick={() => showToast("Concern recorded for this submission")}>Confirm concern</Button><Button variant="outline" className="flex-1 text-muted-ink" onClick={() => showToast("Flag dismissed for teacher records")}>Dismiss flag</Button></div></div></section></div></>; }

function Gradebook({ search, setSearch, sortDesc, setSortDesc, showToast }: { search: string; setSearch: (value: string) => void; sortDesc: boolean; setSortDesc: (value: boolean) => void; showToast: (message: string) => void }) { const students = [{ name: "Rahul Sharma", a1: 82, a2: 76, quiz: 18, assessment: 82, final: 78, status: "Pending" }, { name: "Amit Patil", a1: 79, a2: 84, quiz: 17, assessment: 79, final: 80, status: "Pending" }, { name: "Meera Nair", a1: 74, a2: 88, quiz: 19, assessment: 74, final: 79, status: "Reviewed" }, { name: "Karan Mehta", a1: 84, a2: 91, quiz: 20, assessment: 84, final: 86, status: "Approved" }, { name: "Sneha Iyer", a1: 88, a2: 82, quiz: 18, assessment: 88, final: 84, status: "Pending" }, { name: "Daniel Mensah", a1: 91, a2: 89, quiz: 20, assessment: 91, final: 92, status: "Approved" }]; const filtered = students.filter((student) => student.name.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sortDesc ? b.final - a.final : a.final - b.final); return <><SectionTitle eyebrow="Gradebook · CS203 · Section A" title="Course gradebook" description="A live spreadsheet-style view of marks across assignments, quizzes, assessments, and final scores." action={<div className="flex gap-2"><Button variant="outline" onClick={() => showToast("Gradebook download simulated")}>Download gradebook</Button><Button onClick={() => showToast("Report export simulated")} className="bg-ink text-card hover:bg-ink/90">Export report</Button></div>} /><div className="rounded-[14px] border border-line bg-card p-5"><div className="flex flex-wrap items-center gap-3"><div className="relative flex max-w-sm flex-1 items-center"><Search className="absolute left-3 size-4 text-faint" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students…" className="bg-paper pl-9" /></div><Button variant="outline" onClick={() => setSortDesc(!sortDesc)}><SlidersHorizontal />Final score {sortDesc ? "high to low" : "low to high"}</Button><Button variant="ghost"><Filter />Filters</Button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead><tr className="border-b border-line text-[10px] uppercase tracking-[0.14em] text-faint"><th className="px-3 py-3">Student</th><th className="px-3 py-3">Assignment 1</th><th className="px-3 py-3">Assignment 2</th><th className="px-3 py-3">Quiz</th><th className="px-3 py-3">Assessment</th><th className="px-3 py-3">Final score</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{filtered.map((student) => <tr key={student.name} className="border-b border-line last:border-0"><td className="px-3 py-4 font-medium">{student.name}</td><td className="px-3 py-4">{student.a1}</td><td className="px-3 py-4">{student.a2}</td><td className="px-3 py-4">{student.quiz}/20</td><td className="px-3 py-4">{student.assessment}</td><td className="px-3 py-4 font-display text-xl">{student.final}</td><td className="px-3 py-4"><Pill tone={student.status === "Approved" ? "sage" : student.status === "Pending" ? "amber" : "neutral"}>{student.status}</Pill></td></tr>)}</tbody></table></div></div></>; }

function Reports({ course, showToast }: { course: Course; showToast: (message: string) => void }) { const charts = [{ label: "Average score", value: "78 / 100", progress: 78, tone: "lav" }, { label: "Submission rate", value: "92%", progress: 92, tone: "sage" }, { label: "Similarity cases", value: "5 pairs", progress: 32, tone: "clay" }, { label: "AI detection indicators", value: "8 flagged", progress: 18, tone: "amber" }, { label: "Approved grades", value: "86%", progress: 86, tone: "sage" }]; return <><SectionTitle eyebrow="Reports · course insights" title="Reports and trends" description="A calm overview of class performance, review load, integrity indicators, and teacher approvals." action={<div className="flex gap-2"><Button variant="outline" onClick={() => showToast("Report export simulated")}>Export report</Button><Button onClick={() => showToast("Gradebook download simulated")} className="bg-ink text-card hover:bg-ink/90">Download gradebook</Button></div>} /><div className="mb-5 flex flex-wrap items-center gap-2"><Field label="Course" value={`${course.name} · ${course.code}`} /><Field label="Section" value={`Section ${course.section}`} /><Field label="Assessment" value="All assessments" /></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{charts.map((chart) => <div key={chart.label} className="rounded-[14px] border border-line bg-card p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs text-muted-ink">{chart.label}</p><p className="mt-2 font-display text-3xl">{chart.value}</p></div><BarChart3 className="size-5 text-faint" /></div><div className="mt-6"><ProgressLine value={chart.progress} tone={chart.tone as "lav" | "sage" | "clay" | "amber"} /></div><p className="mt-2 text-[11px] text-faint">Compared with the previous assessment period</p></div>)}</div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="rounded-[14px] border border-line bg-card p-5"><h2 className="font-display text-xl">Score trend</h2><div className="mt-6 flex h-44 items-end gap-4 border-b border-line">{[62, 68, 66, 74, 72, 78, 81].map((height, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-md bg-lav" style={{ height: `${height}%` }} /><span className="text-[10px] text-faint">W{index + 1}</span></div>)}</div></div><div className="rounded-[14px] border border-line bg-card p-5"><h2 className="font-display text-xl">Review outcomes</h2><div className="mt-5 space-y-4">{[{ label: "Approved without edits", value: 62, color: "sage" }, { label: "Edited before approval", value: 24, color: "lav" }, { label: "Flagged for follow-up", value: 14, color: "clay" }].map((item) => <div key={item.label}><div className="mb-1.5 flex justify-between text-xs"><span>{item.label}</span><span className="text-muted-ink">{item.value}%</span></div><ProgressLine value={item.value} tone={item.color as "lav" | "sage" | "clay"} /></div>)}</div><div className="mt-6 rounded-lg bg-paper p-3 text-xs leading-relaxed text-muted-ink">Teacher approvals protect student context: indicators inform the decision, they never make it.</div></div></div></>; }

function SettingsView({ showToast }: { showToast: (message: string) => void }) { return <><SectionTitle eyebrow="Account · preferences" title="Settings" description="Set the defaults that make review calmer and more consistent across your courses." /><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-[14px] border border-line bg-card p-5"><h2 className="font-display text-xl">Review preferences</h2><div className="mt-5 space-y-5">{[{ label: "Show similarity context before approval", detail: "Keep matching phrases visible beside the submission." }, { label: "Require teacher note on overrides", detail: "Ask for context when a suggested score changes." }, { label: "Include AI-content indicator in gradebook", detail: "Keep indicators visible without turning them into verdicts." }].map((setting, index) => <div key={setting.label} className="flex items-start justify-between gap-4"><div><p className="text-sm font-medium">{setting.label}</p><p className="mt-1 text-xs leading-relaxed text-muted-ink">{setting.detail}</p></div><button aria-label={`Toggle ${setting.label}`} className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", index === 1 ? "bg-line" : "bg-sage")} onClick={() => showToast("Preference updated in this frontend demo")}><span className={cn("absolute top-1 size-4 rounded-full bg-card shadow-sm transition-transform", index === 1 ? "left-1" : "left-6")} /></button></div>)}</div></div><div className="rounded-[14px] border border-line bg-card p-5"><h2 className="font-display text-xl">Teacher profile</h2><div className="mt-5 space-y-4"><Field label="Name" value="Dr. Priya Rao" /><Field label="Role" value="Instructor · Computer Science" /><Field label="Default course" value="Object Oriented Programming · Section A" /><Button className="mt-2 bg-ink text-card hover:bg-ink/90" onClick={() => showToast("Profile preferences saved")}>Save preferences</Button></div></div></div></>; }