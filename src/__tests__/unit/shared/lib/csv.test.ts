import { it, expect, describe } from "vitest";

import { buildCsv, type CsvColumn } from "@/shared/lib/csv";

type Row = { name: string; amount: number; note: string | null };

const columns: CsvColumn<Row>[] = [
  { header: "Nome", accessor: (r) => r.name },
  { header: "Valor", accessor: (r) => r.amount },
  { header: "Obs", accessor: (r) => r.note },
];

describe("buildCsv", () => {
  it("monta o cabeçalho e as linhas separadas por ;", () => {
    const csv = buildCsv<Row>(
      [{ name: "Ana", amount: 10, note: "ok" }],
      columns,
    );
    // remove BOM para asserts mais legíveis
    expect(csv.replace(/^﻿/, "")).toBe("Nome;Valor;Obs\nAna;10;ok");
  });

  it("escapa células com ;, aspas e quebras de linha", () => {
    const csv = buildCsv<Row>(
      [
        { name: 'Beto "x"', amount: 5, note: "linha1\nlinha2" },
        { name: "C; D", amount: 3, note: null },
      ],
      columns,
    );
    const lines = csv.replace(/^﻿/, "").split("\n");
    expect(lines[1]).toBe('"Beto ""x""";5;"linha1');
    expect(lines[2]).toBe('linha2"');
    expect(lines[3]).toBe('"C; D";3;');
  });

  it("trata null/undefined como célula vazia", () => {
    const csv = buildCsv<Row>([{ name: "X", amount: 0, note: null }], columns);
    expect(csv.replace(/^﻿/, "")).toBe("Nome;Valor;Obs\nX;0;");
  });
});
