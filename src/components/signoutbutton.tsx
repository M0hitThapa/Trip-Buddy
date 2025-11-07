import { SignOutButton } from "@clerk/nextjs";
import React from "react";

function SignOutButtons() {
  return (
    <div>
      <SignOutButton>
        <button className="px-3 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded-sm  shadow-lg transition-all duration-300 cursor-pointer font-semibold">
          SignOut
        </button>
      </SignOutButton>
    </div>
  );
}

export default SignOutButtons;
