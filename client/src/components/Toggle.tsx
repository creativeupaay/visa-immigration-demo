const Toggle = ({
  isToggled,
  setIsToggled,
}: {
  isToggled: boolean;
  setIsToggled: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div
      onClick={() => {
        setIsToggled(!isToggled);
      }}
      className={`relative w-10 h-5  ${
        isToggled ? "bg-[#F6C328]" : "bg-neutrals-50"
      } rounded-full flex items-center transition-colors`}
    >
      <div
        className={`w-4 h-4 bg-white shadow-slate-200 shadow-2xs rounded-full transition-transform  ${
          isToggled ? "translate-x-[20px] " : "translate-x-0 "
        }`}
      ></div>
    </div>
  );
};

export default Toggle;
