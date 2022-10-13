import React from "react";

export const Search = function () {
  return (
    <>
      <form className="flex-grow basis-64">
        <div className="relative w-full">
          <div className="flex absolute inset-y-0 right-0 items-center pr-3 pointer-events-none">
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="search"
            id="default-search"
            className="
            block
            px-3
            py-2
            md:px-4
            md:py-3
            w-full
            text-sm
            rounded border
            border-gray-300
            outline-none
            focus:ring-primary-light
            focus:border-primary-light
            dark:border-gray-600
            dark:placeholder-gray-400
            dark:text-white
            dark:focus:ring-primary-light
            dark:focus:border-blue-500"
            placeholder="Search by name, title, category..."
            required
          />
        </div>
      </form>
    </>
  );
};
