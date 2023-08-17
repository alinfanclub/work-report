import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { getReportDataDetail } from "../api/firestore";
import { HotTable } from "@handsontable/react";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatAgo } from "../utill/timeago";
import timeStampFormat from "../utill/timeStampFormat";
import Handsontable from "handsontable";
import * as XLSX from "xlsx";
export default function ViewReport() {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");

  const param = useParams().id;
  const hotRef = useRef(null);
  let hot;
  const {
    isLoading,
    isError,
    data: tableData,
  } = useQuery({
    queryKey: ["report", param],
    queryFn: () =>
      getReportDataDetail(param).then((data) => {
        setData(JSON.parse(data.data));
        setHeaders(data.headers);
        setTitle(data.title);
        return data;
      }),
  });

  const exportToXLSX = () => {
    // Get Handsontable instance
    const hot = hotRef.current.hotInstance;

    // Get the data from Handsontable
    const data = hot.getData();

    // Modify the data to include line breaks and handle null/undefined cells
    const modifiedData = data.map(row => row.map(cell => cell && cell.replace(/\n/g, String.fromCharCode(10))));
    let row = [
      { v: "Courier: 24", t: "s", s: { font: { name: "Courier", sz: 24 } } },
      { v: "bold & color", t: "s", s: { font: { bold: true, color: { rgb: "FF0000" } } } },
      { v: "fill: color", t: "s", s: { fill: { fgColor: { rgb: "E9E9E9" } } } },
      { v: "line\nbreak", t: "s", s: { alignment: { wrapText: true } } },
    ];
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    const sheet = XLSX.utils.aoa_to_sheet(modifiedData, [row]);

    // Add the sheet to the workbook
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');


    // Set auto width for columns
    const ws = workbook.Sheets.Sheet1;
    const colWidths = modifiedData[0].map((_, colIndex) => {
      return { wch: Math.max(...modifiedData.map(row => (row[colIndex] || '').toString().length)) + 10 };
    });

    ws['!cols'] =  colWidths;
    
        
    // Save the workbook to a file
  XLSX.writeFile(workbook, `${title}.xlsx`);
  };

  return (
    <div>
      {isError && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          에러가 발생했습니다.
        </div>
      )}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          로딩중...
        </div>
      )}
      {tableData && (
        <div className="grow-[1] flex flex-col gap-4 p-4">
          <h1 className="flex gap-4 items-end">
            {title && title}
            <small>{timeStampFormat(tableData.createdAt)}</small>
            <small>
              {formatAgo(timeStampFormat(tableData.createdAt), "ko")}
            </small>
            {tableData.fix && <small>수정됨</small>}
          </h1>
          <div className="h-[86vh] w-[87vw] overflow-hidden">
            <HotTable
              id="hot"
              data={data && data}
              colHeaders={headers && headers}
              rowHeaders={true}
              manualColumnMove={true}
              fixedColumnsStart={1}
              className="htCenter htMiddle"
              colWidths={`${window.innerWidth - 300}` / headers.length}
              rowHeights={`${window.innerHeight - 200}` / 5}
              licenseKey="non-commercial-and-evaluation"
              readOnly={true}
              ref={hotRef}
              // for non-commercial use only
            />
          </div>

          <div className="flex gap-4">
            {data.length > 0 && headers.length > 0 && (
              <CSVLink
                data={data}
                headers={headers}
                filename={`${title}.csv`}
                className="btn_default"
              >
                Export CSV
              </CSVLink>
            )}
            <button className="btn_default" onClick={exportToXLSX}>
              Export XLSX
            </button>
            <Link to={`/reports/${param}/fix`} className="btn_default">
              fix
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
