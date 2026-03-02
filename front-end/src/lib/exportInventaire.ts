/**
 * Export Inventaire — sans dépendances externes
 * - Excel : génération XLSX via SpreadsheetML (XML natif, compatible Excel/LibreOffice)
 * - PDF   : génération HTML → window.print() avec CSS @media print
 */

import type { LigneInventaire, Inventaire } from '../types/stock';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function escapeXml(v: string | number | null | undefined): string {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function dateStr(): string {
  return new Date().toLocaleDateString('fr-FR').replace(/\//g, '-');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── EXCEL (SpreadsheetML / .xlsx via Office Open XML) ────────────────────────

export function exportExcel(inventaire: Inventaire, lignes: { ligne: LigneInventaire; stock_trouve_local: number }[]) {
  const site = inventaire.site ?? 'Benguerir';
  const dateCreation = inventaire.date_creation ?? '';
  const dateExport = dateStr();
  const rows = lignes;

  // Styles inline dans le XML
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Arial"/></font>
    <font><sz val="13"/><b/><name val="Arial"/></font>
    <font><sz val="10"/><b/><color rgb="FFFFFFFF"/><name val="Arial"/></font>
    <font><sz val="10"/><name val="Arial"/></font>
  </fonts>
  <fills count="5">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1E3A5F"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE8F0FE"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE6F4EA"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFCCCCCC"/></left>
      <right style="thin"><color rgb="FFCCCCCC"/></right>
      <top style="thin"><color rgb="FFCCCCCC"/></top>
      <bottom style="thin"><color rgb="FFCCCCCC"/></bottom>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="9">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0"><alignment horizontal="left"/></xf>
    <xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0"><alignment horizontal="left" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0"><alignment horizontal="right" vertical="center"/></xf>
  </cellXfs>
</styleSheet>`;

  // Shared strings
  const strings: string[] = [];
  const si = (v: string) => {
    let idx = strings.indexOf(v);
    if (idx === -1) { idx = strings.length; strings.push(v); }
    return idx;
  };

  // Pre-register header strings
  const hPiece       = si('Désignation (Pièce)');
  const hMarque      = si('Marque');
  const hRef         = si('REF / Code');
  const hEmplacement = si('Emplacement');
  const hUnite       = si('Unité');
  const hStockInit   = si('Stock Initial');
  const hEntrees     = si('Entrées');
  const hSorties     = si('Sorties');
  const hTheorique   = si('Stock Actuel (Théorique)');
  const hTrouve      = si('Stock Trouvé');
  const hEcart       = si('Écart');
  const hObs         = si('Observation');

  // Row builder
  function strCell(col: string, row: number, sIdx: number, style: number): string {
    return `<c r="${col}${row}" t="s" s="${style}"><v>${sIdx}</v></c>`;
  }
  function numCell(col: string, row: number, val: number | null | undefined, style: number): string {
    if (val == null) return `<c r="${col}${row}" s="${style}"/>`;
    return `<c r="${col}${row}" s="${style}"><v>${val}</v></c>`;
  }

  // Sheet data
  let sheetRows = '';

  // Row 1: Title
  const titleIdx = si(`Inventaire du Stock — Site ${site} — Exporté le ${dateExport}`);
  sheetRows += `<row r="1" ht="24" customHeight="1"><c r="A1" t="s" s="1"><v>${titleIdx}</v></c></row>`;

  // Row 2: Date création
  const subtitleIdx = si(`Date de création : ${dateCreation}   |   Articles : ${rows.length}`);
  sheetRows += `<row r="2"><c r="A2" t="s" s="1"><v>${subtitleIdx}</v></c></row>`;

  // Row 3: vide
  sheetRows += `<row r="3"/>`;

  // Row 4: Headers
  sheetRows += `<row r="4" ht="20" customHeight="1">
    ${strCell('A', 4, hPiece, 2)}
    ${strCell('B', 4, hMarque, 2)}
    ${strCell('C', 4, hRef, 2)}
    ${strCell('D', 4, hEmplacement, 2)}
    ${strCell('E', 4, hUnite, 2)}
    ${strCell('F', 4, hStockInit, 2)}
    ${strCell('G', 4, hEntrees, 2)}
    ${strCell('H', 4, hSorties, 2)}
    ${strCell('I', 4, hTheorique, 2)}
    ${strCell('J', 4, hTrouve, 2)}
    ${strCell('K', 4, hEcart, 2)}
    ${strCell('L', 4, hObs, 2)}
  </row>`;

  // Data rows
  rows.forEach(({ ligne: l, stock_trouve_local }, i) => {
    const r = i + 5;
    const a = l.article;
    const ecart = l.stock_trouve !== null ? stock_trouve_local - l.stock_theorique : null;

    const dIdx   = si(a?.designation ?? '—');
    const mIdx   = si(a?.marque ?? '');
    const rfIdx  = si(a?.reference ?? '');
    const empIdx = si(a?.emplacement ?? '');
    const uIdx   = si(a?.unite ?? 'Pièce');
    const obsIdx = si(l.observation ?? '');

    sheetRows += `<row r="${r}" ht="18" customHeight="1">
      ${strCell('A', r, dIdx, 3)}
      ${strCell('B', r, mIdx, 4)}
      ${strCell('C', r, rfIdx, 4)}
      ${strCell('D', r, empIdx, 4)}
      ${strCell('E', r, uIdx, 4)}
      ${numCell('F', r, a?.stock_initial ?? 0, 7)}
      ${numCell('G', r, l.total_entrees ?? 0, 7)}
      ${numCell('H', r, l.total_sorties ?? 0, 7)}
      ${numCell('I', r, l.stock_theorique, 5)}
      ${numCell('J', r, l.stock_trouve !== null ? stock_trouve_local : null, 8)}
      ${numCell('K', r, ecart, 7)}
      ${strCell('L', r, obsIdx, 6)}
    </row>`;
  });

  // Totals row
  const totalR = rows.length + 5;
  const totIdx = si('TOTAL');
  sheetRows += `<row r="${totalR}" ht="20" customHeight="1">
    ${strCell('A', totalR, totIdx, 2)}
    <c r="F${totalR}" s="2"><f>SUM(F5:F${totalR - 1})</f></c>
    <c r="G${totalR}" s="2"><f>SUM(G5:G${totalR - 1})</f></c>
    <c r="H${totalR}" s="2"><f>SUM(H5:H${totalR - 1})</f></c>
    <c r="I${totalR}" s="2"><f>SUM(I5:I${totalR - 1})</f></c>
    <c r="J${totalR}" s="2"><f>SUM(J5:J${totalR - 1})</f></c>
  </row>`;

  // Shared strings XML
  const sst = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">
${strings.map(s => `<si><t xml:space="preserve">${escapeXml(s)}</t></si>`).join('\n')}
</sst>`;

  // Sheet XML
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
           xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetViews><sheetView workbookViewId="0" showGridLines="1"/></sheetViews>
  <sheetFormatPr defaultRowHeight="16"/>
  <cols>
    <col min="1" max="1" width="32" customWidth="1"/>
    <col min="2" max="2" width="16" customWidth="1"/>
    <col min="3" max="3" width="16" customWidth="1"/>
    <col min="4" max="4" width="16" customWidth="1"/>
    <col min="5" max="5" width="10" customWidth="1"/>
    <col min="6" max="6" width="14" customWidth="1"/>
    <col min="7" max="7" width="12" customWidth="1"/>
    <col min="8" max="8" width="12" customWidth="1"/>
    <col min="9" max="9" width="20" customWidth="1"/>
    <col min="10" max="10" width="14" customWidth="1"/>
    <col min="11" max="11" width="12" customWidth="1"/>
    <col min="12" max="12" width="24" customWidth="1"/>
  </cols>
  <sheetData>${sheetRows}</sheetData>
  <mergeCells count="2">
    <mergeCell ref="A1:L1"/>
    <mergeCell ref="A2:L2"/>
  </mergeCells>
  <pageSetup orientation="landscape" fitToPage="1" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;

  // Workbook
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Inventaire" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`;

  // Build ZIP manually using Blob + concatenation trick
  // We use a minimal ZIP builder (no external lib needed)
  const files: Record<string, string> = {
    '[Content_Types].xml': contentTypes,
    '_rels/.rels': rels,
    'xl/workbook.xml': workbook,
    'xl/_rels/workbook.xml.rels': wbRels,
    'xl/worksheets/sheet1.xml': sheet,
    'xl/sharedStrings.xml': sst,
    'xl/styles.xml': styles,
  };

  const zip = buildZip(files);
  triggerDownload(new Blob([zip], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `Inventaire_${site}_${dateExport}.xlsx`);
}

// ─── Minimal ZIP builder (no external dependencies) ───────────────────────────

function buildZip(files: Record<string, string>): Uint8Array {
  const encoder = new TextEncoder();
  const localHeaders: Uint8Array[] = [];
  const centralDir: Uint8Array[] = [];
  let offset = 0;

  for (const [name, content] of Object.entries(files)) {
    const data = encoder.encode(content);
    const nameBytes = encoder.encode(name);
    const crc = crc32(data);
    const size = data.length;

    // Local file header
    const local = new Uint8Array(30 + nameBytes.length + size);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);   // signature
    dv.setUint16(4, 20, true);            // version needed
    dv.setUint16(6, 0, true);             // flags
    dv.setUint16(8, 0, true);             // compression (store)
    dv.setUint16(10, 0, true);            // mod time
    dv.setUint16(12, 0, true);            // mod date
    dv.setUint32(14, crc, true);          // crc32
    dv.setUint32(18, size, true);         // compressed size
    dv.setUint32(22, size, true);         // uncompressed size
    dv.setUint16(26, nameBytes.length, true); // filename length
    dv.setUint16(28, 0, true);            // extra length
    local.set(nameBytes, 30);
    local.set(data, 30 + nameBytes.length);
    localHeaders.push(local);

    // Central directory entry
    const central = new Uint8Array(46 + nameBytes.length);
    const cdv = new DataView(central.buffer);
    cdv.setUint32(0, 0x02014b50, true);  // signature
    cdv.setUint16(4, 20, true);           // version made by
    cdv.setUint16(6, 20, true);           // version needed
    cdv.setUint16(8, 0, true);            // flags
    cdv.setUint16(10, 0, true);           // compression
    cdv.setUint16(12, 0, true);           // mod time
    cdv.setUint16(14, 0, true);           // mod date
    cdv.setUint32(16, crc, true);         // crc32
    cdv.setUint32(20, size, true);        // compressed size
    cdv.setUint32(24, size, true);        // uncompressed size
    cdv.setUint16(28, nameBytes.length, true); // filename length
    cdv.setUint16(30, 0, true);           // extra length
    cdv.setUint16(32, 0, true);           // comment length
    cdv.setUint16(34, 0, true);           // disk start
    cdv.setUint16(36, 0, true);           // internal attrs
    cdv.setUint32(38, 0, true);           // external attrs
    cdv.setUint32(42, offset, true);      // local header offset
    central.set(nameBytes, 46);
    centralDir.push(central);
    offset += local.length;
  }

  const cdSize = centralDir.reduce((s, b) => s + b.length, 0);
  const eocd = new Uint8Array(22);
  const edv = new DataView(eocd.buffer);
  edv.setUint32(0, 0x06054b50, true);   // signature
  edv.setUint16(4, 0, true);            // disk number
  edv.setUint16(6, 0, true);            // disk with cd
  edv.setUint16(8, centralDir.length, true);
  edv.setUint16(10, centralDir.length, true);
  edv.setUint32(12, cdSize, true);
  edv.setUint32(16, offset, true);      // cd offset
  edv.setUint16(20, 0, true);           // comment length

  const parts = [...localHeaders, ...centralDir, eocd];
  const total = parts.reduce((s, b) => s + b.length, 0);
  const result = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) { result.set(p, pos); pos += p.length; }
  return result;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ─── PDF (impression navigateur via HTML/CSS) ─────────────────────────────────

export function exportPDF(inventaire: Inventaire, lignes: { ligne: LigneInventaire; stock_trouve_local: number }[]) {
  const site = inventaire.site ?? 'Benguerir';
  const dateExport = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  const nbArticles = lignes.length;
  const nbSaisis = lignes.filter(l => l.ligne.stock_trouve !== null).length;
  const nbEcarts = lignes.filter(l => l.ligne.stock_trouve !== null && l.stock_trouve_local !== l.ligne.stock_theorique).length;
  const totalEcart = lignes.reduce((s, l) => l.ligne.stock_trouve !== null ? s + Math.abs(l.stock_trouve_local - l.ligne.stock_theorique) : s, 0);

  const rows = lignes.map(({ ligne: l, stock_trouve_local }) => {
    const ecart = l.stock_trouve !== null ? stock_trouve_local - l.stock_theorique : null;
    const ecartStr = ecart === null ? '—' : ecart > 0 ? `+${ecart}` : String(ecart);
    const ecartClass = ecart === null ? '' : ecart < 0 ? 'neg' : ecart > 0 ? 'pos' : '';
    return `
      <tr>
        <td class="left bold">${escapeHtml(l.article?.designation ?? '—')}</td>
        <td class="center muted">${escapeHtml(l.article?.marque ?? '—')}</td>
        <td class="center mono">${escapeHtml(l.article?.reference ?? '—')}</td>
        <td class="right">${l.article?.stock_initial ?? 0}</td>
        <td class="right green">${(l.total_entrees ?? 0) > 0 ? '+' + l.total_entrees : '—'}</td>
        <td class="right red">${(l.total_sorties ?? 0) > 0 ? '-' + l.total_sorties : '—'}</td>
        <td class="right theorique">${l.stock_theorique}</td>
        <td class="right">${l.stock_trouve !== null ? stock_trouve_local : '—'}</td>
        <td class="right ${ecartClass}">${ecartStr}</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<title>Inventaire ${site}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 9pt; color: #1a1a1a; background: #fff; }
  .page { padding: 16mm 14mm; }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
  .header-left h1 { font-size: 16pt; font-weight: 700; color: #1e3a5f; }
  .header-left p { font-size: 9pt; color: #666; margin-top: 2px; }
  .header-right { text-align: right; font-size: 8pt; color: #888; }

  /* Stats */
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 14px; }
  .stat { border: 1px solid #ddd; border-radius: 4px; padding: 8px 10px; text-align: center; }
  .stat .label { font-size: 7pt; text-transform: uppercase; color: #888; letter-spacing: 0.5px; }
  .stat .value { font-size: 14pt; font-weight: 700; margin-top: 2px; }
  .stat.blue .value { color: #1e3a5f; }
  .stat.orange .value { color: #d97706; }
  .stat.red .value { color: #dc2626; }

  /* Table */
  table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
  thead tr { background: #1e3a5f; color: #fff; }
  thead th { padding: 6px 5px; font-weight: 600; font-size: 7.5pt; letter-spacing: 0.3px; }
  tbody tr:nth-child(even) { background: #f5f8ff; }
  tbody tr:hover { background: #e8f0fe; }
  tbody td { padding: 5px 5px; border-bottom: 1px solid #e5e7eb; vertical-align: middle; }
  tfoot tr { background: #1e3a5f; color: #fff; font-weight: 700; }
  tfoot td { padding: 6px 5px; font-size: 8pt; }

  .left { text-align: left; }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 600; }
  .muted { color: #666; }
  .mono { font-family: monospace; font-size: 8pt; }
  .theorique { font-weight: 700; color: #1e3a5f; }
  .green { color: #16a34a; font-weight: 600; }
  .red { color: #dc2626; }
  .pos { color: #16a34a; font-weight: 700; }
  .neg { color: #dc2626; font-weight: 700; }

  /* Footer */
  .footer { margin-top: 14px; border-top: 1px solid #ddd; padding-top: 8px; display: flex; justify-content: space-between; font-size: 7.5pt; color: #aaa; }

  @media print {
    body { font-size: 8.5pt; }
    .page { padding: 10mm 8mm; }
    @page { size: A4 landscape; margin: 8mm; }
    table { page-break-inside: auto; }
    tr { page-break-inside: avoid; }
    thead { display: table-header-group; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-left">
      <h1>Inventaire du Stock</h1>
      <p>Site ${escapeHtml(site)} &nbsp;•&nbsp; Créé le ${escapeHtml(String(inventaire.date_creation ?? ''))}</p>
    </div>
    <div class="header-right">
      <div>GMAO — Maintenance BG</div>
      <div>Exporté le ${dateExport}</div>
    </div>
  </div>

  <div class="stats">
    <div class="stat blue"><div class="label">Articles</div><div class="value">${nbArticles}</div></div>
    <div class="stat blue"><div class="label">Stock trouvé saisi</div><div class="value">${nbSaisis} / ${nbArticles}</div></div>
    <div class="stat orange"><div class="label">Écarts détectés</div><div class="value">${nbEcarts}</div></div>
    <div class="stat red"><div class="label">Total écart absolu</div><div class="value">${totalEcart}</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="left">Désignation</th>
        <th class="center">Marque</th>
        <th class="center">REF</th>
        <th class="right">Stock Init.</th>
        <th class="right">Entrées</th>
        <th class="right">Sorties</th>
        <th class="right">Théorique</th>
        <th class="right">Trouvé</th>
        <th class="right">Écart</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr>
        <td class="left" colspan="3">TOTAL (${nbArticles} articles)</td>
        <td class="right">${lignes.reduce((s, l) => s + (l.ligne.article?.stock_initial ?? 0), 0)}</td>
        <td class="right">${lignes.reduce((s, l) => s + (l.ligne.total_entrees ?? 0), 0)}</td>
        <td class="right">${lignes.reduce((s, l) => s + (l.ligne.total_sorties ?? 0), 0)}</td>
        <td class="right">${lignes.reduce((s, l) => s + l.ligne.stock_theorique, 0)}</td>
        <td class="right">${lignes.filter(l => l.ligne.stock_trouve !== null).reduce((s, l) => s + l.stock_trouve_local, 0)}</td>
        <td class="right">${lignes.filter(l => l.ligne.stock_trouve !== null).reduce((s, l) => s + (l.stock_trouve_local - l.ligne.stock_theorique), 0)}</td>
      </tr>
    </tfoot>
  </table>

  <div class="footer">
    <span>Document généré par GMAO Maintenance BG</span>
    <span>Page 1</span>
  </div>
</div>
<script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=1100,height=800');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function escapeHtml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
