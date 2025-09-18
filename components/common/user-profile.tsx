import React from "react";
import { currentUser } from "@/lib/auth-user";
import { useCurrentUser } from "@/hooks/user-current-user";

export function UserProfile() {
  const user = useCurrentUser();

  return (
    <div className="flex items-center space-x-3">
      {/* <img
        src={user?.image ?? ""}
        alt={user?.name ?? "user profile image"}
        className="w-10 h-10 rounded-full"
      /> */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.name}
        </p>
        <p className="text-xs text-gray-500 truncate">Analista de RRHH</p>
      </div>
      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
    </div>
  );
}
