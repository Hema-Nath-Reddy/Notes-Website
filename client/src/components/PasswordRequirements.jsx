import React from "react";

const PasswordRequirements = ({ password }) => {
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^\w\s]/.test(password);
  const isMinLength = password.length >= 8;
  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 rounded-lg shadow-md">
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="uppercase"
          className="text-sm font-medium text-gray-700"
        >
          Includes Uppercase Character
        </label>
        <input
          type="checkbox"
          checked={hasUppercase}
          readOnly
          name="Uppercase"
          id="uppercase"
          className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label
          htmlFor="lowercase"
          className="text-sm font-medium text-gray-700"
        >
          Includes Lowercase Character
        </label>
        <input
          type="checkbox"
          checked={hasLowercase}
          readOnly
          name="Lowercase"
          id="lowercase"
          className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="number" className="text-sm font-medium text-gray-700">
          Includes a Number
        </label>
        <input
          type="checkbox"
          checked={hasNumber}
          readOnly
          name="Number"
          id="number"
          className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="special" className="text-sm font-medium text-gray-700">
          Includes a Special Character
        </label>
        <input
          type="checkbox"
          checked={hasSpecial}
          readOnly
          name="Special"
          id="special"
          className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="length" className="text-sm font-medium text-gray-700">
          8+ Length
        </label>
        <input
          type="checkbox"
          checked={isMinLength}
          readOnly
          name="Length"
          id="length"
          className="h-5 w-5 rounded-md border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
};

export default PasswordRequirements;
