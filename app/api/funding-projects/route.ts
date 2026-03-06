// ROUTE V7 - TIMESTAMP: 2024-03-06-22-00-00 - IMPORTA HANDLER COM status::text
import { handleGetFundingProjects } from "./handler"

export async function GET(request: Request) {
  return handleGetFundingProjects(request)
}
