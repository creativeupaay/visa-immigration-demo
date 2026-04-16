import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";

type CustomTableProps = {
  headers: string[];
  contents: {
    task: string;
    application: string;
    action: string;
  }[];
};

const CustomTable = ({ headers, contents }: CustomTableProps) => {
  return (
    <TableContainer
      component={Paper}
      sx={{
        width: "100%",
        boxShadow: "none",
      }}
    >
      <Table sx={{ width: "100%" }} aria-label="custom table">
        <TableHead>
          <TableRow>
            {headers.map((header, index) => (
              <TableCell
                key={index}
                sx={{
                  fontWeight: "bold",
                  color: "black",
                  whiteSpace: "nowrap",
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {contents.map((row, index) => (
            <TableRow key={index}>
              {/* Task column */}
              <TableCell
                sx={{
                  maxWidth: { xs: 100, sm: 200 }, // 100px on mobile, 200px on bigger screen
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.task}
              </TableCell>

              {/* Application column */}
              <TableCell
                sx={{
                  maxWidth: { xs: 80, sm: 150 },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.application}
              </TableCell>

              {/* Action column */}
              <TableCell>
                <Button sx={{ color: "black", textTransform: "none" }}>
                  View &gt;
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CustomTable;
