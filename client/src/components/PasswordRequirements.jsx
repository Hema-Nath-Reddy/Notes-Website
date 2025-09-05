import React from "react";

const PasswordRequirements = ({ password }) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^\w\s]/.test(password);
  const isMinLength = password.length >= 8;
  return (
    <div className="flex flex-col gap-4 p-6 glass rounded-lg">
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="uppercase"
          className="text-sm font-medium text-white"
        >
          Includes Uppercase Character
        </label>
        <input
          type="checkbox"
          checked={hasUppercase}
          readOnly
          name="Uppercase"
          id="uppercase"
          className="h-5 w-5 rounded-md glass-input text-blue-500 focus:ring-blue-400"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="lowercase"
          className="text-sm font-medium text-white"
        >
          Includes Lowercase Character
        </label>
        <input
          type="checkbox"
          checked={hasLowercase}
          readOnly
          name="Lowercase"
          id="lowercase"
          className="h-5 w-5 rounded-md glass-input text-blue-500 focus:ring-blue-400"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="number" className="text-sm font-medium text-white">
          Includes a Number
        </label>
        <input
          type="checkbox"
          checked={hasNumber}
          readOnly
          name="Number"
          id="number"
          className="h-5 w-5 rounded-md glass-input text-blue-500 focus:ring-blue-400"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="special" className="text-sm font-medium text-white">
          Includes a Special Character
        </label>
        <input
          type="checkbox"
          checked={hasSpecial}
          readOnly
          name="Special"
          id="special"
          className="h-5 w-5 rounded-md glass-input text-blue-500 focus:ring-blue-400"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="length" className="text-sm font-medium text-white">
          8+ Length
        </label>
        <input
          type="checkbox"
          checked={isMinLength}
          readOnly
          name="Length"
          id="length"
          className="h-5 w-5 rounded-md glass-input text-blue-500 focus:ring-blue-400"
        />
      </div>
    </div>
  );
};

export default PasswordRequirements;