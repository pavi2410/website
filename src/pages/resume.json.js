import resume from "@/data/resume.json";

export async function GET(context) {
  return new Response(JSON.stringify(resume))
}
