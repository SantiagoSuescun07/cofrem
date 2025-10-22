import api from "@/lib/axios";

export interface Birthday {
  name: string;
  field_birthdate: string;
}

export const getBirthdays = async (): Promise<Birthday[]> => {
  const { data } = await api.get<Birthday[]>("/api/birthday");
  console.log("DATA dd: ", data)
  return data.filter((person) => person.field_birthdate);
};