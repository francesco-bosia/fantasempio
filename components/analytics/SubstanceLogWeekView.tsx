"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { eachDayOfInterval, format, parseISO } from "date-fns";

interface Log {
  date: string;
  substance: string;
  points: number;
}

interface SubstanceLogWeekViewProps {
  logsBySeasonWeek: {
    [season: number]: {
      [week: number]: {
        [playerName: string]: Log[]
      }
    }
  };
  seasons: number[];
  weeksBySeason: { [season: number]: number[] };
  playerName: string;
  defaultSeason: number;
  defaultWeek: number;
  matches: {
    season: number;
    weekNumber: number;
    startDate: Date | string;
    endDate: Date | string;
  }[];
}

export default function SubstanceLogWeekView({
  logsBySeasonWeek,
  seasons,
  weeksBySeason,
  playerName,
  defaultSeason,
  defaultWeek,
  matches
}: SubstanceLogWeekViewProps) {

  const [selectedSeason, setSelectedSeason] = useState(defaultSeason);
  const [selectedWeek, setSelectedWeek] = useState(defaultWeek);


  const currentMatch = matches.find(
    m => m.season === selectedSeason && m.weekNumber === selectedWeek
  );
  
  const weekStart = currentMatch ? new Date(currentMatch.startDate) : new Date();
  const weekEnd = currentMatch ? new Date(currentMatch.endDate) : new Date();
  
  const logs = logsBySeasonWeek[selectedSeason]?.[selectedWeek]?.[playerName] || [];

  // Chart data: total points per day
  const pointsPerDay = logs.reduce((acc, log) => {
    const day = format(parseISO(log.date), "dd/MMM");
    acc[day] = (acc[day] || 0) + log.points;
    return acc;
  }, {} as { [day: string]: number });

  const allDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd
  });
  
  const chartData = allDays.map((day) => ({
    day: format(day, "dd/MMM"),
    points: pointsPerDay[format(day, "dd/MMM")] || 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Substance Logs - Season {selectedSeason} Week {selectedWeek}</CardTitle>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <Select value={selectedSeason.toString()} onValueChange={(val) => {
            const season = parseInt(val);
            setSelectedSeason(season);
            setSelectedWeek(weeksBySeason[season][0]);
          }}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((s) => (
                <SelectItem key={s} value={s.toString()}>
                  Season {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedWeek.toString()} onValueChange={(val) => setSelectedWeek(parseInt(val))}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Week" />
            </SelectTrigger>
            <SelectContent>
              {weeksBySeason[selectedSeason].map((w) => (
                <SelectItem key={w} value={w.toString()}>
                  Week {w}
                </SelectItem>
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
            <Line type="monotone" dataKey="points" stroke="#2563EB" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>

        <div className="mt-6 rounded-md border overflow-x-auto">
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
                  <TableCell colSpan={3} className="text-center text-muted-foreground">No logs for this week.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
