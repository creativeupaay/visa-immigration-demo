import * as ExcelJS from "exceljs";

interface ExcelColumn {
  key: string;
  header: string;
  width?: number;
}

interface ExcelSheet {
  name: string;
  data: any[];
  columns?: ExcelColumn[];
}

interface ExcelOptions {
  filename?: string;
  sheets: ExcelSheet[];
}

interface ExcelResult {
  buffer: Buffer;
  headers: Record<string, string>;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

interface StreamExcelOptions extends ExcelOptions {
  response: any;
}

export async function streamExcelToResponse(
  options: StreamExcelOptions
): Promise<void> {
  const { filename = `report_${Date.now()}.xlsx`, sheets, response } = options;

  response.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  response.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );

  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);

    if (sheet.columns) {
      worksheet.columns = sheet.columns.map((col, index) => ({
        header: col.header,
        key: `col_${index}`,
        width: col.width || 15,
      }));

      sheet.data.forEach((row) => {
        const mappedRow: any = {};
        sheet.columns!.forEach((col, index) => {
          mappedRow[`col_${index}`] = getNestedValue(row, col.key);
        });
        worksheet.addRow(mappedRow);
      });
    } else {
      if (sheet.data.length > 0) {
        const keys = Object.keys(sheet.data[0]);
        worksheet.columns = keys.map((key) => ({
          header: key,
          key: key,
          width: 15,
        }));

        sheet.data.forEach((row) => {
          worksheet.addRow(row);
        });
      }
    }

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
  }

  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");
  await workbook.xlsx.write(response);
  response.end();
}

export async function generateExcel(
  options: ExcelOptions
): Promise<ExcelResult> {
  const { filename = `report_${Date.now()}.xlsx`, sheets } = options;

  const workbook = new ExcelJS.Workbook();

  for (const sheet of sheets) {
    const worksheet = workbook.addWorksheet(sheet.name);

    if (sheet.columns) {
      worksheet.columns = sheet.columns.map((col, index) => ({
        header: col.header,
        key: `col_${index}`,
        width: col.width || 15,
      }));

      sheet.data.forEach((row) => {
        const mappedRow: any = {};
        sheet.columns!.forEach((col, index) => {
          mappedRow[`col_${index}`] = getNestedValue(row, col.key);
        });
        worksheet.addRow(mappedRow);
      });
    } else {
      if (sheet.data.length > 0) {
        const keys = Object.keys(sheet.data[0]);
        worksheet.columns = keys.map((key) => ({
          header: key,
          key: key,
          width: 15,
        }));

        sheet.data.forEach((row) => {
          worksheet.addRow(row);
        });
      }
    }

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE0E0E0" },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return {
    buffer: Buffer.from(buffer),
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": buffer.byteLength.toString(),
    },
  };
}
