"use client";

import { History } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CompletedCase } from "@/lib/types";

interface CaseHistoryDrawerProps {
  history: CompletedCase[];
}

export function CaseHistoryDrawer({ history }: CaseHistoryDrawerProps) {
  return (
    <Drawer>
      <DrawerTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2">
            <History className="size-4" />
            Case History
          </Button>
        }
      />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Closed Cases</DrawerTitle>
        </DrawerHeader>
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2 overflow-y-auto px-4 pb-8">
          {history.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No cases yet. Enter the room to start your record.
            </p>
          )}
          {history.map((entry) => {
            const guilty = entry.verdict === "guilty";
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-md border border-border bg-card/40 p-3"
              >
                <div>
                  <p className="font-heading text-sm font-semibold">{entry.caseName}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.detectiveName ?? "Unknown detective"}
                    {entry.suspectName && <> vs {entry.suspectName}</>} · {entry.difficulty} ·{" "}
                    {new Date(entry.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant="outline"
                    className={
                      guilty
                        ? "border-noir-red/40 bg-noir-red/15 text-noir-red"
                        : "border-noir-green/40 bg-noir-green/15 text-noir-green"
                    }
                  >
                    {guilty ? "Guilty" : "Released"}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {entry.suspicion}/100
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
