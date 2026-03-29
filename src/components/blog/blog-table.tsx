interface BlogTableProps {
  headers: string;
  data: string;
}

export function BlogTable({ headers, data }: BlogTableProps) {
  const headerCols = headers.split("|").map((h) => h.trim());
  const rows = data
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split("|").map((cell) => cell.trim()));

  return (
    <div className="my-10 overflow-x-auto rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60">
            {headerCols.map((header) => (
              <th
                key={header}
                className="px-5 py-3 font-black uppercase tracking-widest text-[10px] text-foreground"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static content
            <tr key={i} className="border-b border-border/50 last:border-0">
              {row.map((cell) => (
                <td key={cell} className="px-5 py-3.5 text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
