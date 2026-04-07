import { z } from "zod";
import { apiJson } from "@/lib/api-client";
import { schoolSchema } from "@/lib/schemas/school";

export async function fetchSchoolsList() {
  const raw = await apiJson<unknown>("/schools");
  return z.array(schoolSchema).parse(raw);
}
