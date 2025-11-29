import React from "react";
import coin from "../assets/coin.png";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Rotating Coin */}
      <img
        src={coin}
        alt="Loading..."
        className="w-20 h-20 animate-spin-slow"
      />

      {/* Text */}
      <p className="mt-4 text-lg font-semibold text-purple-600">Loading...</p>
    </div>
  );
}
