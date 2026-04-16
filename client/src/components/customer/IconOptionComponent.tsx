import { useState } from "react";

const IconOptionComponent = ({optionData}:{optionData:any}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-4">{optionData.title}</h2>
      <div className="flex gap-4">
        {optionData.map((item:any, index:any) => (
          <div
            key={index}
            className={`flex flex-col items-center border-2 rounded-3xl p-4 cursor-pointer transition w-[300px] h-[200px] ${
              selectedOption === item.option ? "border-gray-800" : "border-gray-300"
            }`}
            onClick={() => setSelectedOption(item.option)}
          >
            <div className="w-16 h-16 flex items-center justify-center">
                <img src={item.image} alt={item.option} className="w-full h-full object-contain" />
            </div>
            <p className="mt-10 text-center">{item.option}</p>
          </div>
        ))}
      </div>
      <button
        className={`mt-6 px-6 py-2 rounded-lg ${
          selectedOption ? "bg-gray-800 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
        }`}
        disabled={!selectedOption}
      >
        Proceed
      </button>
    </div>
  );
}

export default IconOptionComponent