import resume from "@/data/resume.json";

export async function GET(context) {
  return Response.json(resume);
}
