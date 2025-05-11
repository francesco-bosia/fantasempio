import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SubstanceLogWeekView from "@/components/analytics/SubstanceLogWeekView";

export default async function MyLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p className="text-center mt-10">Please sign in to view your substance logs.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Substance Logs Overview</h1>
      <SubstanceLogWeekView initialPlayerName={session.user?.name ?? ""} />
    </div>
  );
}
