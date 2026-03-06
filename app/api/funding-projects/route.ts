// ROUTE V6 - IMPORTA HANDLER SEPARADO PARA FORCAR RELOAD
import { handleGetFundingProjects } from "./handler"

export async function GET(request: Request) {
  return handleGetFundingProjects(request)
}
