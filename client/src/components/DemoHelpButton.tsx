import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const DemoHelpButton = () => {
  const location = useLocation();
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem(
      "visaflowDemoHelpWalkthroughSeen"
    );

    if (location.pathname === "/login" && !hasSeenWalkthrough) {
      setShowWalkthrough(true);
    } else {
      setShowWalkthrough(false);
    }
  }, [location.pathname]);

  const closeWalkthrough = () => {
    localStorage.setItem("visaflowDemoHelpWalkthroughSeen", "true");
    setShowWalkthrough(false);
  };

  const openDemoGuide = () => {
    window.open("/demo/readiness", "_blank", "noopener,noreferrer");

    if (showWalkthrough) {
      closeWalkthrough();
    }
  };

  return (
    <>
      {showWalkthrough && (
        <div className="pointer-events-auto fixed inset-0 z-[9996]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(248,211,71,0.18),rgba(0,0,0,0.72)_40%)] backdrop-blur-[1px]" />

          <div className="pointer-events-none absolute bottom-[12px] right-[12px] h-[56px] w-[56px] rounded-full ring-[3px] ring-golden-yellow-400/95 shadow-[0_0_0_8px_rgba(255,255,255,0.17),0_0_0_16px_rgba(248,211,71,0.22)] animate-pulse" />

          <div className="absolute bottom-20 right-4 w-[min(330px,calc(100vw-2rem))] rounded-2xl border border-white/40 bg-white/95 p-4 shadow-[0_16px_48px_rgba(15,23,42,0.3)]">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-golden-yellow-300 text-neutrals-950">
                <Icon icon="mdi:map-marker-question-outline" width="16" height="16" />
              </span>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutrals-500">
                Quick tip
              </p>
            </div>

            <h3 className="text-base font-bold text-neutrals-950">
              Need guidance during this demo?
            </h3>
            <p className="mt-1 text-sm leading-5 text-neutrals-700">
              Tap the <span className="font-semibold text-neutrals-950">Help for Demo</span> button below anytime to open the walkthrough.
            </p>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={closeWalkthrough}
                className="text-sm font-semibold text-neutrals-500 transition-colors hover:text-neutrals-800"
              >
                Got it
              </button>
              <button
                type="button"
                onClick={openDemoGuide}
                className="rounded-full bg-golden-yellow-400 px-4 py-2 text-sm font-semibold text-neutrals-950 transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Open now
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={openDemoGuide}
        aria-label="Help for Demo"
        title="Help for Demo?"
        className={`group fixed bottom-4 right-4 z-[9999] flex h-11 w-11 flex-row-reverse items-center overflow-hidden rounded-full border bg-white text-sm font-semibold text-neutrals-950 transition-all duration-200 active:scale-[0.98] ${
          showWalkthrough
            ? "border-golden-yellow-400 shadow-[0_8px_28px_rgba(248,211,71,0.55)]"
            : "border-neutrals-200 shadow-md"
        } hover:w-[158px] hover:bg-neutrals-50 focus-visible:w-[158px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden-yellow-400`}
      >
        <span className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-golden-yellow-400 text-neutrals-950">
          <Icon icon="mdi:question-mark" width="19" height="19" />
        </span>
        <span className="mr-2 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
          Help for Demo?
        </span>
      </button>
    </>
  );
};

export default DemoHelpButton;
