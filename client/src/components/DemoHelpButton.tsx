import { Icon } from "@iconify/react";

const DemoHelpButton = () => {
  const openDemoGuide = () => {
    window.open("/demo/readiness", "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={openDemoGuide}
      aria-label="Help for Demo"
      title="Help for Demo?"
      className="group fixed bottom-4 right-4 z-[9999] flex h-11 w-11 flex-row-reverse items-center overflow-hidden rounded-full border border-neutrals-200 bg-white text-sm font-semibold text-neutrals-950 shadow-md transition-all duration-200 hover:w-[158px] hover:bg-neutrals-50 focus-visible:w-[158px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-golden-yellow-400 active:scale-[0.98]"
    >
      <span className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-golden-yellow-400 text-neutrals-950">
        <Icon icon="mdi:question-mark" width="19" height="19" />
      </span>
      <span className="mr-2 whitespace-nowrap opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        Help for Demo?
      </span>
    </button>
  );
};

export default DemoHelpButton;
