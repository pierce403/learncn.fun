import { useEffect, useMemo, useState } from "react";
import ReadApp from "./apps/read/ReadApp";
import ReadOutLoudApp from "./apps/read-out-loud/ReadOutLoudApp";
import WriteApp from "./apps/write/WriteApp";

type AppId = "read" | "readOutLoud" | "write";

type AppMeta = {
  id: AppId;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
};

const HOME_TITLE = "learncn.fun — Chinese Character Practice";

const CURRICULUM_LINKS = [
  {
    label: "Series overview",
    note: "Chinese",
    href: "https://www.fujian.gov.cn/xwdt/fjyw/202507/t20250715_6967219.htm",
    accent: "text-sky-200 ring-sky-400/30 hover:bg-sky-400/10",
  },
  {
    label: "Buy Levels 1–6",
    note: "US + international",
    href: "https://www.jojolearning.com/products/little-goat-goes-up-the-mountain-xiao-yang-shang-shan-chinese-leveled-reader",
    accent: "text-amber-100 ring-amber-400/30 hover:bg-amber-400/10",
  },
  {
    label: "Independent review",
    note: "English guide",
    href: "https://lahlahbanana.com/2022/03/10/little-sheep-goes-up-the-mountain-review-chinese-levelled-reader/",
    accent: "text-emerald-100 ring-emerald-400/30 hover:bg-emerald-400/10",
  },
  {
    label: "Curriculum notes",
    note: "Data + sources",
    href: "https://github.com/pierce403/learncn.fun/blob/main/docs/curriculum.md",
    accent: "text-slate-100 ring-slate-500/40 hover:bg-slate-700/30",
  },
] as const;

export default function App() {
  const apps = useMemo<AppMeta[]>(
    () => [
      {
        id: "read",
        title: "Read",
        subtitle: "Multiple choice",
        description: "See a character and pick the right meaning (English) or pronunciation (pinyin).",
        accent: "from-sky-400/20 via-slate-900/40 to-slate-900/20 ring-sky-400/30",
      },
      {
        id: "readOutLoud",
        title: "Read Out Loud",
        subtitle: "Voice practice",
        description: "Say the character into the mic and let local Vosk recognition check the pinyin.",
        accent: "from-amber-300/20 via-slate-900/40 to-slate-900/20 ring-amber-300/30",
      },
      {
        id: "write",
        title: "Write",
        subtitle: "Stroke order",
        description: "Hear a prompt, then write the character in the grid with guided stroke order.",
        accent: "from-emerald-400/20 via-slate-900/40 to-slate-900/20 ring-emerald-400/30",
      },
    ],
    [],
  );

  const [activeApp, setActiveApp] = useState<AppId | null>(null);

  useEffect(() => {
    if (activeApp === "read") {
      document.title = "Read • learncn.fun";
      return;
    }
    if (activeApp === "write") {
      document.title = "Write • learncn.fun";
      return;
    }
    if (activeApp === "readOutLoud") {
      document.title = "Read Out Loud • learncn.fun";
      return;
    }
    document.title = HOME_TITLE;
  }, [activeApp]);

  if (activeApp === "read") {
    return <ReadApp onHome={() => setActiveApp(null)} />;
  }

  if (activeApp === "write") {
    return <WriteApp onHome={() => setActiveApp(null)} />;
  }

  if (activeApp === "readOutLoud") {
    return <ReadOutLoudApp onHome={() => setActiveApp(null)} />;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl items-start justify-center p-4 sm:p-6 lg:items-center [padding-top:calc(theme(spacing.4)+env(safe-area-inset-top))] [padding-bottom:calc(theme(spacing.4)+env(safe-area-inset-bottom))]">
        <div className="w-full rounded-3xl bg-slate-900/50 p-6 shadow-2xl ring-1 ring-slate-700/40 backdrop-blur sm:p-8">
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100">learncn.fun</h1>
            <p className="text-sm text-slate-300">
              Practice the 14-level 小羊上山 reading path, one character level at a time.
            </p>
          </header>

          <div className="mt-8">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Popular apps
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {apps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setActiveApp(app.id)}
                  className={[
                    "group w-full touch-manipulation rounded-3xl bg-gradient-to-br p-5 text-left shadow-lg ring-1 transition",
                    "focus:outline-none focus:ring-2 focus:ring-slate-300/40",
                    "hover:-translate-y-0.5 hover:bg-slate-800/60",
                    app.accent,
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-slate-100">{app.title}</div>
                      <div className="mt-0.5 text-xs font-medium text-slate-300">{app.subtitle}</div>
                    </div>

                    <div className="mt-1 text-xs font-semibold text-slate-200/90">
                      Open →
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-slate-300">{app.description}</div>
                </button>
              ))}
            </div>

            <section
              aria-labelledby="curriculum-heading"
              className="mt-6 rounded-3xl bg-slate-950/45 p-5 ring-1 ring-slate-700/50 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-xl">
                  <div className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                    The curriculum
                  </div>
                  <h2
                    id="curriculum-heading"
                    className="mt-2 text-lg font-semibold text-slate-100"
                  >
                    Practice alongside{" "}
                    <span lang="zh-CN">《小羊上山儿童汉语分级读物》</span>
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    The series builds reading ability across 14 cumulative character levels. This
                    independent companion currently covers Levels 1–6: 60 new characters at the
                    start, growing to 390 through Level 6. The in-app lists are provisional
                    transcriptions; verification details are documented in Curriculum notes.
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl bg-slate-900/80 px-4 py-3 text-center ring-1 ring-amber-400/25">
                  <div className="text-2xl font-semibold text-amber-300">60 → 390</div>
                  <div className="mt-0.5 text-xs font-medium text-slate-400">
                    characters in Levels 1–6
                  </div>
                </div>
              </div>

              <nav aria-label="Curriculum resources" className="mt-5 grid gap-2 sm:grid-cols-2">
                {CURRICULUM_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={[
                      "group flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-slate-900/70 px-4 py-2.5 text-sm font-semibold ring-1 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200/50",
                      link.accent,
                    ].join(" ")}
                  >
                    <span>
                      {link.label}
                      <span className="ml-2 text-xs font-normal text-slate-400">{link.note}</span>
                    </span>
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                      ↗
                    </span>
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </nav>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                learncn.fun is not affiliated with or endorsed by the authors, 童趣出版有限公司,
                or 人民邮电出版社. Book stories, illustrations, and publisher assets are not included.
              </p>
            </section>

            <p className="mt-6 text-xs text-slate-400">
              Audio note: your first tap (opening an app) unlocks speech in most browsers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
