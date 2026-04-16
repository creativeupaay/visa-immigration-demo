import { Icon } from "@iconify/react";

interface ChatbotProps {
  onToggle: () => void;
}

const Chatbot = ({ onToggle }: ChatbotProps) => {
  return (
    <div
      onClick={onToggle}
      className="absolute w-fit h-fit bottom-1 right-1 md:bottom-5 md:right-5 px-4 py-4 bg-golden-yellow-200 rounded-full cursor-pointer text-neutrals-950 z-50"
    >
      <Icon icon={"icon-park-outline:wechat"} width={"24px"} height={"24px"} />
    </div>
  );
};

export default Chatbot;
