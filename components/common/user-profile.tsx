import React from "react";
import { currentUser } from "@/lib/auth-user";
import { useCurrentUser } from "@/hooks/user-current-user";

export function UserProfile() {
  const user = useCurrentUser();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div className="flex items-center space-x-3 w-full">
      {/* Avatar */}
      {user?.image ? (
        <img
          src={user.image}
          alt={user.name ?? "user profile image"}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold ring-2 ring-gray-200 shadow-sm">
          {initials}
        </div>
      )}

      <div className="flex-1 text-start min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user?.name}
        </p>
        <p className="text-xs text-gray-500 truncate">Analista de RRHH</p>
      </div>
    </div>
  );
}
