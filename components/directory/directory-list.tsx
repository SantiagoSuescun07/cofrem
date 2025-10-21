import { useDirectoryByArea } from "@/queries/directory/use-directory";
import { ProfileCard } from "./profile-card";

export function DirectoryList({ areaId }: { areaId: number }) {
  const { data, isLoading } = useDirectoryByArea(areaId);

  if (isLoading)
    return <p className="text-gray-400 text-center mt-6">Cargando empleados...</p>;

  if (!data || data.length === 0)
    return <p className="text-gray-400 text-center mt-6">No hay empleados en esta área</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((employee:any) => (
        <ProfileCard key={employee.id} {...employee} />
      ))}
    </div>
  );
}
