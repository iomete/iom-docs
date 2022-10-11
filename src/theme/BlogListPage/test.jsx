import React from "react";

export const Cards = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <a
        className="grid w-full min-w-[7rem] transform cursor-pointer  border-blue-gray-50 hover:border-blue-gray-100 hover:bg-blue-gray-50 rounded-xl border bg-white px-3 py-2 transition-all hover:scale-105 hover:bg-opacity-25"
        href="/docs/react/checkbox"
      >
        <div className="p-2.5">
          <h4 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-blue-gray-900 mb-2">
            Examples
          </h4>
          <p className="block antialiased font-sans text-sm font-light leading-normal text-gray-700">
            Checkout different examples for checkbox component.
          </p>
        </div>
      </a>
      <a
        className="grid w-full min-w-[7rem] transform cursor-pointer  border-blue-gray-50 hover:border-blue-gray-100 hover:bg-blue-gray-50 rounded-xl border bg-white px-3 py-2 transition-all hover:scale-105 hover:bg-opacity-25"
        href="/docs/react/props/checkbox"
      >
        <div className="p-2.5">
          <h4 className="block antialiased tracking-normal font-sans text-base font-semibold leading-relaxed text-blue-gray-900 mb-2">
            Props
          </h4>
          <p className="block antialiased font-sans text-sm font-light leading-normal text-gray-700">
            Learn more about props definition and types of checkbox component.
          </p>
        </div>
      </a>
    </div>
  );
};
