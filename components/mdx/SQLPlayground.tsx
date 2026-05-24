"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  DatabaseIcon,
  TerminalIcon,
  CodeIcon,
} from "@hugeicons/core-free-icons";

interface DatabaseRow {
  [key: string]: string | number;
}

// Mock Database Tables
const MOCK_DB: Record<string, DatabaseRow[]> = {
  users: [
    {
      id: 1,
      name: "Alex Rivera",
      email: "alex@syntax.dev",
      role: "admin",
      status: "active",
    },
    {
      id: 2,
      name: "Sarah Chen",
      email: "sarah.c@syntax.dev",
      role: "user",
      status: "active",
    },
    {
      id: 3,
      name: "Marcus Aurelius",
      email: "marcus@syntax.dev",
      role: "user",
      status: "inactive",
    },
    {
      id: 4,
      name: "Elena Rostova",
      email: "elena@syntax.dev",
      role: "author",
      status: "active",
    },
  ],
  orders: [
    {
      id: 101,
      user_id: 1,
      product: "Syntax Pro License",
      amount: 149.0,
      date: "2026-05-10",
    },
    {
      id: 102,
      user_id: 2,
      product: "System Design Bootcamp",
      amount: 299.0,
      date: "2026-05-12",
    },
    {
      id: 103,
      user_id: 1,
      product: "SQL Masterclass E-Book",
      amount: 29.0,
      date: "2026-05-15",
    },
    {
      id: 104,
      user_id: 4,
      product: "Syntax Pro License",
      amount: 149.0,
      date: "2026-05-18",
    },
  ],
};

export function SQLPlayground() {
  const [query, setQuery] = React.useState<string>(
    "SELECT name, email, role \nFROM users \nWHERE status = 'active';",
  );

  const [activeTab, setActiveTab] = React.useState<
    "editor" | "users" | "orders"
  >("editor");
  const [resultRows, setResultRows] = React.useState<DatabaseRow[]>([]);
  const [resultColumns, setResultColumns] = React.useState<string[]>([]);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [stats, setStats] = React.useState<{
    timeMs: number;
    count: number;
  } | null>(null);

  const suggestedQueries = [
    {
      label: "Select Active Admins",
      sql: "SELECT name, email FROM users WHERE role = 'admin';",
    },
    {
      label: "User Purchases (JOIN)",
      sql: "SELECT users.name, orders.product, orders.amount \nFROM users \nJOIN orders ON users.id = orders.user_id;",
    },
    {
      label: "Show All Orders",
      sql: "SELECT id, product, amount FROM orders WHERE amount > 50;",
    },
  ];

  const runQuery = React.useCallback(() => {
    setErrorMsg(null);
    setStats(null);
    const start = performance.now();

    try {
      // 1. Basic Cleaning
      const cleanSql = query.replace(/\n/g, " ").replace(/\s+/g, " ").trim();

      // 2. Validate SELECT prefix
      if (!cleanSql.toLowerCase().startsWith("select")) {
        throw new Error(
          "Syntax Error: Only SELECT queries are permitted in this learning workspace.",
        );
      }

      // 3. Regex parser
      // Matches: SELECT {columns} FROM {table} [JOIN {table2} ON {cond}] [WHERE {filter}]
      const sqlRegex =
        /select\s+(.+?)\s+from\s+(\w+)(?:\s+join\s+(\w+)\s+on\s+([\w.]+)\s*=\s*([\w.]+))?(?:\s+where\s+(.+?))?;?$/i;
      const match = cleanSql.match(sqlRegex);

      if (!match) {
        throw new Error(
          "Syntax Error: Query syntax not supported. Verify your SELECT, FROM, and optional WHERE/JOIN keywords.",
        );
      }

      const selectColsRaw = match[1].trim();
      const primaryTable = match[2].trim().toLowerCase();
      const joinTable = match[3] ? match[3].trim().toLowerCase() : null;
      const joinCond1 = match[4] ? match[4].trim() : null;
      const joinCond2 = match[5] ? match[5].trim() : null;
      const whereClause = match[6] ? match[6].trim() : null;

      // 4. Validate Table Existence
      if (!MOCK_DB[primaryTable]) {
        throw new Error(
          `Table Error: Table '${primaryTable}' does not exist in this database schema.`,
        );
      }
      if (joinTable && !MOCK_DB[joinTable]) {
        throw new Error(
          `Table Error: Join table '${joinTable}' does not exist in this database schema.`,
        );
      }

      // 5. Gather Rows
      let dataset: DatabaseRow[] = [];
      const primaryRows = MOCK_DB[primaryTable];

      if (joinTable) {
        // Run simple INNER JOIN
        const secondaryRows = MOCK_DB[joinTable];
        primaryRows.forEach((pRow) => {
          secondaryRows.forEach((sRow) => {
            // Check join condition (e.g. users.id = orders.user_id)
            const resolveVal = (condStr: string) => {
              const [tbl, col] = condStr.split(".");
              if (tbl === primaryTable) return pRow[col];
              if (tbl === joinTable) return sRow[col];
              return null;
            };

            const val1 = joinCond1 ? resolveVal(joinCond1) : null;
            const val2 = joinCond2 ? resolveVal(joinCond2) : null;

            if (val1 !== null && val2 !== null && val1 === val2) {
              // Merge rows prefixing columns if there are overlaps
              const merged: DatabaseRow = {};
              Object.keys(pRow).forEach((k) => {
                merged[`${primaryTable}.${k}`] = pRow[k];
                merged[k] = pRow[k]; // support direct fallback
              });
              Object.keys(sRow).forEach((k) => {
                merged[`${joinTable}.${k}`] = sRow[k];
                merged[k] = sRow[k];
              });
              dataset.push(merged);
            }
          });
        });
      } else {
        dataset = primaryRows.map((r) => ({ ...r }));
      }

      // 6. Apply WHERE Filter
      if (whereClause) {
        const whereRegex = /(\w+)\s*(=|!=|>|<)\s*'?(.*?)'?$/i;
        const whereMatch = whereClause.match(whereRegex);
        if (whereMatch) {
          const colName = whereMatch[1].trim();
          const operator = whereMatch[2].trim();
          let filterVal: string | number = whereMatch[3]
            .trim()
            .replace(/'/g, "");

          if (!isNaN(Number(filterVal))) {
            filterVal = Number(filterVal);
          }

          dataset = dataset.filter((row) => {
            const val = row[colName];
            if (val === undefined) {
              throw new Error(
                `Column Error: Column '${colName}' not found in the dataset for filtering.`,
              );
            }
            if (operator === "=") return String(val) === String(filterVal);
            if (operator === "!=") return String(val) !== String(filterVal);
            if (operator === ">") return Number(val) > Number(filterVal);
            if (operator === "<") return Number(val) < Number(filterVal);
            return true;
          });
        } else {
          // Fallback simple filter
          throw new Error(
            "Filtering Error: Simple filters only supported (e.g. col = 'val' or col > val).",
          );
        }
      }

      // 7. Filter Selected Columns
      let columns: string[] = [];
      if (selectColsRaw === "*") {
        columns = Object.keys(dataset[0] || {});
        // Filter out joined prefix duplicates to keep output neat
        columns = columns.filter((col) => !col.includes("."));
      } else {
        columns = selectColsRaw.split(",").map((c) => c.trim());
      }

      if (dataset.length === 0) {
        setResultColumns(columns);
        setResultRows([]);
      } else {
        // Map rows containing only specified columns
        const filteredDataset = dataset.map((row) => {
          const newRow: DatabaseRow = {};
          columns.forEach((col) => {
            if (row[col] !== undefined) {
              newRow[col] = row[col];
            } else {
              // Try table prefixed resolution (e.g. users.name)
              const matchedKey = Object.keys(row).find((k) =>
                k.endsWith(`.${col}`),
              );
              if (matchedKey) {
                newRow[col] = row[matchedKey];
              } else {
                newRow[col] = "NULL";
              }
            }
          });
          return newRow;
        });

        setResultColumns(columns);
        setResultRows(filteredDataset);
      }

      const end = performance.now();
      setStats({
        timeMs: parseFloat((end - start).toFixed(2)),
        count: dataset.length,
      });
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error
          ? e.message
          : "Execution Error: Could not run SQL query.",
      );
    }
  }, [query]);

  React.useEffect(() => {
    runQuery();
  }, [runQuery]);

  return (
    <div className="my-8 border border-border rounded-xl bg-card overflow-hidden transition-colors duration-200">
      {/* Playground Header Tabs */}
      <div className="flex border-b border-border bg-muted/15 select-none overflow-x-auto">
        <button
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "editor"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <HugeiconsIcon icon={CodeIcon} className="h-3.5 w-3.5" />
          SQL Workspace
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "users"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <HugeiconsIcon icon={DatabaseIcon} className="h-3.5 w-3.5" />
          Table: users
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
            activeTab === "orders"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <HugeiconsIcon icon={DatabaseIcon} className="h-3.5 w-3.5" />
          Table: orders
        </button>
      </div>

      {activeTab === "editor" ? (
        <div>
          {/* SQL Editor Area */}
          <div className="p-4 bg-muted/5 relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
              className="w-full h-32 bg-background border border-border rounded-lg p-3.5 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring focus:border-border transition-all"
            />

            {/* Quick Actions Panel */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-3 select-none">
              <div className="flex flex-wrap gap-1.5">
                {suggestedQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(item.sql)}
                    className="px-2 py-1 text-[9px] font-medium border border-border rounded bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <Button
                onClick={runQuery}
                className="h-8 rounded-md px-4 flex items-center gap-1.5 bg-foreground text-background hover:bg-foreground/90 font-medium"
              >
                <HugeiconsIcon icon={PlayIcon} className="h-3.5 w-3.5" />
                <span>Run Query</span>
              </Button>
            </div>
          </div>

          {/* Results Console */}
          <div className="border-t border-border bg-muted/5">
            <div className="px-4 py-2 border-b border-border bg-muted/10 flex justify-between items-center text-[10px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={TerminalIcon} className="h-3 w-3" />
                OUTPUT LOG
              </span>
              {stats && (
                <span>
                  {stats.count} rows returned in {stats.timeMs}ms
                </span>
              )}
            </div>

            {errorMsg ? (
              <div className="p-4 bg-rose-500/5 text-xs font-mono text-rose-600 dark:text-rose-400">
                {errorMsg}
              </div>
            ) : resultRows.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground font-medium">
                No rows match the query. Try broadening your SELECT filter
                constraints!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/15 border-b border-border">
                      {resultColumns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-[10px] font-bold font-mono text-muted-foreground uppercase border-r border-border/50 last:border-0"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                      >
                        {resultColumns.map((col) => (
                          <td
                            key={col}
                            className="px-4 py-2.5 text-xs font-mono text-foreground border-r border-border/50 last:border-0"
                          >
                            {row[col]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Schema Schema Data Preview */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/15 border-b border-border">
                {Object.keys(MOCK_DB[activeTab][0]).map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2.5 text-[10px] font-bold font-mono text-muted-foreground uppercase"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_DB[activeTab].map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  {Object.keys(row).map((col) => (
                    <td
                      key={col}
                      className="px-4 py-2.5 text-xs font-mono text-foreground"
                    >
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
