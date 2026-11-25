import {
  Activity,
  ArrowDownToLine,
  BookOpen,
  BrainCircuit,
  CloudUpload,
  FileQuestion,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";

export const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Upload Material", icon: CloudUpload },
  { label: "Ask AI", icon: BrainCircuit },
  { label: "Generate Questions", icon: FileQuestion },
  { label: "Mock Exam", icon: BookOpen },
  { label: "My Exams", icon: FileText },
  { label: "Create Topic (AI)", icon: Sparkles },
  { label: "My Topics", icon: GraduationCap },
  { label: "Downloads", icon: ArrowDownToLine },
  { label: "Progress Report", icon: Activity },
];

export const Sidebar = ({
  activePage,
  menuOpen,
  onSelectPage,
  onMenuClose,
  onLogout,
}) => {
  return (
    <>
      <aside
        className={`sidebar-scroll fixed inset-y-0 left-0 z-30 flex w-[250px] flex-col overflow-y-auto bg-[#0d1c37] px-4 pb-5 pt-6 text-white transition-transform duration-300 lg:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <a
          href="#dashboard"
          className="mb-8 flex items-center gap-2.5 px-2 group"
          aria-label="StudiFy home"
          onClick={() => onSelectPage("Dashboard")}
        >
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-[#9fb7ff] transition-transform duration-300 group-hover:scale-105 group-hover:bg-white/15">
            <GraduationCap size={25} strokeWidth={2.3} />
          </span>
          <span className="font-display text-[20px] font-extrabold tracking-tight">
            Studi<span className="text-[#94aaff]">Fy</span>
          </span>
        </a>

        <nav className="flex-1 space-y-1.5" aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon }) => {
            const isActive = activePage === label;
            return (
              <button
                key={label}
                type="button"
                onClick={() => onSelectPage(label)}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-[10px] text-left text-[12px] font-semibold transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? "bg-[#334fd0] text-white shadow-[0_8px_20px_rgba(42,69,190,.35)] translate-x-1"
                    : "text-[#bdc8dc] hover:bg-white/[0.08] hover:text-white hover:translate-x-1"
                }`}
              >
                <Icon size={16} strokeWidth={2.1} className={`transition-transform duration-200 ${isActive ? "scale-110 text-white" : "group-hover:scale-110"}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-8 space-y-1.5 border-t border-white/10 pt-4">
          <button
            type="button"
            onClick={() => onSelectPage("Settings")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-[10px] text-left text-[12px] font-semibold text-[#bdc8dc] transition-all duration-200 hover:bg-white/[0.08] hover:text-white hover:translate-x-1"
          >
            <Settings size={16} />
            Settings
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-[10px] text-left text-[12px] font-semibold text-[#f87171] transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 hover:translate-x-1"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-20 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onMenuClose}
        />
      )}
    </>
  );
};

export default Sidebar;
