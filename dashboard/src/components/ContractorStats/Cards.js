import React from "react";

const Cards = ({ data }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      {data &&
        data.map((item, index) => (
          <div
            key={index}
            style={item.style}
            className="rounded-lg h-32 flex flex-col justify-center items-center text-white shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="font-semibold text-lg sm:text-xl">{item.title}</h2>
            <span className="mt-2 text-xl sm:text-2xl font-bold">
              {item.value}
            </span>
          </div>
        ))}
    </div>
  );
};

export default Cards;
