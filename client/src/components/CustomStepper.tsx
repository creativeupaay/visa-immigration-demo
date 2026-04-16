import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

type CustomStepperProps = {
  visaType: string;
  currentStep: number;
  visaApplicationId?: string;
  stepsCount: number;
  currentStepName: string;
};

const CustomStepper = ({
  visaType,
  currentStep,
  visaApplicationId,
  stepsCount,
  currentStepName,
}: CustomStepperProps) => {
  const progressPercent = ((currentStep + 1) / stepsCount) * 100;
  const navigate = useNavigate()
  return (
    <>
      <div className="hidden md:flex justify-end items-center mb-[-35px]">
      <button 
      onClick={()=> navigate(`/documentVault/${visaApplicationId}`)}
      className="text-[#BFBFBE] border border-[#BFBFBE] px-4 py-1 rounded-2xl cursor-pointer font-medium hover:bg-zinc-100 ">
        Document Vault
      </button>
      </div>
      {/* Common Header */}
      <div className="w-full flex flex-col items-start md:items-center text-[#282827] mt-3">
        <h1 className="text-[#282827] text-xl font-bold">{visaType}</h1>
        <p className="text-sm">Case ID - {visaApplicationId}</p>
      </div>

      {/* Mobile Stepper */}
      <div className="block md:hidden">
        <div className="w-full flex justify-center my-10 items-center gap-4">
          {/* Progress Circle */}
          <div className="relative flex items-center justify-center mr-5">
            <svg className="w-24 h-24 rotate-[-90deg]">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#F5F5F5"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#FFD700"
                strokeWidth="6"
                fill="none"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={
                  2 * Math.PI * 40 * (1 - progressPercent / 100)
                }
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[#8C8882] text-[16px]">Step</span>
              <div>
                <span className="font-bold text-[#000101] text-[20px]">
                  {currentStep + 1}{" "}
                </span>
                <span className="text-[#000101] text-[12px]">
                  of {stepsCount}
                </span>
              </div>
            </div>
          </div>

          {/* Step Name */}
          <div className="text-left">
            <h2 className="text-lg font-bold text-neutrals-950">
              {currentStepName}
            </h2>
          </div>
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden md:flex w-full justify-center my-10 items-center relative">
        <div className="flex items-center">
          {Array.from({ length: stepsCount }).map((_, index) => (
            <div key={index} className="flex items-center">
              {/* Step Circle */}
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full font-bold border-[5px] z-10
                  ${
                    index <= currentStep
                      ? "bg-golden-yellow-300 text-black border-white"
                      : "bg-neutrals-300 text-white border-neutrals-100"
                  }
                `}
              >
                {index < currentStep ? (
                  <Icon
                    icon="icon-park-outline:done-all"
                    width={"17px"}
                    height={"17px"}
                  />
                ) : (
                  index + 1
                )}
                
                {/* Current Step Label */}
                {index === currentStep && (
                  <div className="absolute top-12 w-fit">
                    <div
                      className={`relative px-3 py-2 w-max bg-golden-yellow-100 rounded-2xl text-center text-neutrals-950`}
                    >
                      {currentStepName}
                      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-golden-yellow-100"></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Connector Line */}
              {index < stepsCount - 1 && (
                <div 
                  className={`h-2 ${
                    index < currentStep ? "bg-golden-yellow-100" : "bg-neutrals-50"
                  }`}
                  style={{
                    width: `${Math.max(20, Math.min(60, 150 / stepsCount))}px`
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>
      </>
  );
};

export default CustomStepper;