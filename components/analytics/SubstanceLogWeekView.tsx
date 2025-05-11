"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from "recharts";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

type Match = {
  season: number;
  weekNumber: number;
  startDate: Date | string;
  endDate: Date | string;
};

type Log = {
  date: string;
  substance: string;
  points: number;
};

const COLORS = [
  "#2563EB", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#7C3AED", // Indigo
];

export default function SubstanceLogWeekView() {
  const { data: session } = useSession();

  const [users, setUsers] = useState<{ _id: string; name: string }[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [logsByUser, setLogsByUser] = useState<Record<string, Log[]>>({});
  const [matchRange, setMatchRange] = useState<{ start: string; end: string } | null>(null);
  const [isCumulative, setIsCumulative] = useState(false);

  const initialized = useMemo(() => !!session?.user?.id, [session]);

  // Load users and matches
  useEffect(() => {
    const loadData = async () => {
      const [userRes, matchRes] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/matches"),
      ]);

      const usersData = await userRes.json();
      const matchesData = await matchRes.json();

      setUsers(usersData.users);
      setMatches(matchesData.matches);

      // Set default user and week
      const today = new Date();
      const currentMatch = matchesData.matches.find((m: Match) => {
        const start = new Date(m.startDate);
        const end = new Date(m.endDate);
        return today >= start && today <= end;
      }) || matchesData.matches[matchesData.matches.length - 1];

      if (session?.user?.id) {
        setSelectedUserIds([session?.user?.id]);
      }
      setSelectedSeason(currentMatch.season);
      setSelectedWeek(currentMatch.weekNumber);
    };

    if (initialized) loadData();
  }, [initialized]);

  // Fetch match range and logs when filters change
  useEffect(() => {
    if (!selectedUserIds.length || selectedSeason === null || selectedWeek === null) return;

    const fetchAll = async () => {
      const params = new URLSearchParams();
      params.set("season", String(selectedSeason));
      params.set("week", String(selectedWeek));
      selectedUserIds.forEach(id => params.append("userIds", id));

      const [logsRes, rangeRes] = await Promise.all([
        fetch(`/api/substance-logs/weekly?${params.toString()}`),
        fetch(`/api/matches/daterange?season=${selectedSeason}&week=${selectedWeek}`),
      ]);

      const logsData = await logsRes.json();
      const rangeData = await rangeRes.json();

      setLogsByUser(logsData.logs || {});
      if (rangeData.start && rangeData.end) {
        setMatchRange({ start: rangeData.start, end: rangeData.end });
      }
    };

    fetchAll();
  }, [selectedUserIds, selectedSeason, selectedWeek]);

  // Chart data
  const chartData = useMemo(() => {
    if (!matchRange || selectedUserIds.length === 0) return [];

    const days = eachDayOfInterval({
      start: new Date(matchRange.start),
      end: new Date(matchRange.end),
    });

    const formattedDays = days.map((d) => format(d, "dd/MMM"));

    const cumulativeTotals: Record<string, number> = {};

    return formattedDays.map((day) => {
      const entry: Record<string, string | number> = { day };
      for (const userId of selectedUserIds) {
        const logs = logsByUser[userId] || [];
        const dayPoints = logs
          .filter((l) => format(parseISO(l.date), "dd/MMM") === day)
          .reduce((sum, l) => sum + l.points, 0);

        if (isCumulative) {
          cumulativeTotals[userId] = (cumulativeTotals[userId] || 0) + dayPoints;
          entry[userId] = cumulativeTotals[userId];
        } else {
          entry[userId] = dayPoints;
        }
      }
      return entry;
    });
  }, [matchRange, selectedUserIds, logsByUser, isCumulative]);

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]
    );
  };

  if (!session || !selectedSeason || !selectedWeek) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  const seasonOptions = [...new Set(matches.map(m => m.season))].sort((a, b) => a - b);
  const weeksInSeason = [...new Set(matches.filter(m => m.season === selectedSeason).map(m => m.weekNumber))].sort((a, b) => a - b);

  return (
    <Card>
      <CardHeader>

        <CardTitle className="mb-2">Substance Logs - Season {selectedSeason} Week {selectedWeek}</CardTitle>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {users.map((user, index) => (
            <Badge
              key={user._id}
              onClick={() => toggleUser(user._id)}
              className={cn(
                "cursor-pointer px-3 py-1 text-sm",
                selectedUserIds.includes(user._id)
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground"
              )}
              style={{
                border: `1px solid ${COLORS[index % COLORS.length]}`,
              }}
            >
              {user.name}
            </Badge>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setSelectedUserIds((prev) =>
                prev.length === users.length ? [] : users.map((u) => u._id)
              )
            }
          >
            {selectedUserIds.length === users.length ? "Deselect All" : "Select All"}
          </Button>

          <div className="flex-grow" /> {/* pushes the next button to the end */}

          <Button
            variant="outline"
            onClick={() => setIsCumulative((prev) => !prev)}
            className="ml-auto"
          >
            {isCumulative ? "Show Daily Points" : "Show Cumulative"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={selectedSeason.toString()} onValueChange={val => {
            const season = parseInt(val);
            setSelectedSeason(season);
            setSelectedWeek(weeksInSeason[0]);
          }}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Season" /></SelectTrigger>
            <SelectContent>
              {seasonOptions.map(season => (
                <SelectItem key={season} value={season.toString()}>Season {season}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedWeek.toString()} onValueChange={val => setSelectedWeek(parseInt(val))}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Week" /></SelectTrigger>
            <SelectContent>
              {weeksInSeason.map(week => (
                <SelectItem key={week} value={week.toString()}>Week {week}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            {selectedUserIds.map((userId, i) => {
              const user = users.find(u => u._id === userId)
              return (
                <Line
                  key={userId}
                  type="monotone"
                  dataKey={userId}
                  name={user?.name || userId}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>

        <Accordion type="multiple" className="mt-6">
          {selectedUserIds.map((userId, i) => {
            const user = users.find(u => u._id === userId);
            const logs = logsByUser[userId] || [];

            return (
              <AccordionItem key={userId} value={userId}>
                <AccordionTrigger className="text-md font-semibold" style={{ color: COLORS[i % COLORS.length] }}>
                  {user?.name}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="rounded-md border overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Substance</TableHead>
                          <TableHead>Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.length > 0 ? logs.map((log, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{format(parseISO(log.date), "PPP")}</TableCell>
                            <TableCell>{log.substance}</TableCell>
                            <TableCell>{log.points}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">
                              No logs for this week.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
