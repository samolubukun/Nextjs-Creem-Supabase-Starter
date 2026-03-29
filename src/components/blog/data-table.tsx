interface DataTableProps {
  headers: string[];
  rows: string[][];
}

export function DataTable({ headers, rows }: DataTableProps) {
  return (
    <div className="my-10 overflow-x-auto rounded-2xl border border-border bg-card/40 backdrop-blur-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60">
            {headers.map((header) => (
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
            <tr
              // biome-ignore lint/suspicious/noArrayIndexKey: static content
              key={i}
              className="border-b border-border/50 last:border-0"
            >
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
