import React, { useRef, useState } from "react";
import { useParams } from "react-router";
import { deleteReport, getReportDataDetail } from "../api/firestore";
import { HotTable } from "@handsontable/react";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatAgo } from "../utill/timeago";
import {timeStampFormat, timeStampFormatNotHour} from "../utill/timeStampFormat";
export default function ViewReport() {
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");

  const param = useParams().id;
  const hotRef = useRef(null);
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

  //scrollViewportTo
  const scrollToBottom = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(hot.countRows() - 1, hot.countCols() - 1);
    // hot.scrollViewportTo(0,0);
  };

  const scrollToTop = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(0, 0);
    // hot.scrollViewportTo(0,0);
  };
 


  // const exportToXLSX = () => {
  //   // Get the current sheet
  //   // const data  headers + data
  //   const data = hotRef.current.hotInstance.getData();

  //   // Modify the data to include line breaks and handle null/undefined cells
  //   const modifiedData = data.map(row => row.map(cell => cell && cell.replace(/\n/g, String.fromCharCode(10))));
  //   // Create a new workbook
  //   const workbook = XLSX.utils.book_new();
    
  //   const sheet = XLSX.utils.aoa_to_sheet(modifiedData);

  //   // Add the sheet to the workbook
  //   XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');


  //   // Set auto width for columns
  //   const ws = workbook.Sheets.Sheet1;
  //   const colWidths = modifiedData[0].map((_, colIndex) => {
  //     return { wch: Math.max(...modifiedData.map(row => (row[colIndex] || '').toString().length)) + 10 };
  //   });

  //   ws['!cols'] =  colWidths;
    
        
  //   // Save the workbook to a file
  // XLSX.writeFile(workbook, `${title}.xlsx`);
  // };

  const handleDelete = async () => {
    if(window.confirm("삭제하시겠습니까?") ) {
      await deleteReport(param).then(() => {
        window.location.href = "/";
      })
    } else {
      return false;
    }
  }

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
          <div className='flex justify-between'>
            <h1 className="flex gap-4 items-end">
              {title && title}
              <small>{timeStampFormat(tableData.createdAt)}</small>
              <small>
                {formatAgo(timeStampFormat(tableData.createdAt), "ko")}
              </small>
              {tableData.fix && <small>수정됨</small>}
            </h1>
            <button type="button" onClick={() => handleDelete()} >삭제</button>
          </div>
          <div className="h-[86vh] w-[87vw] overflow-hidden reportTable relative">
            <HotTable
              id="hot"
              data={data && data}
              colHeaders={headers && headers}
              rowHeaders={true}
              manualColumnMove={true}
              fixedColumnsStart={1}
              className="htCenter htMiddle"
              colWidths={`${window.innerWidth - 300}` / headers.length}
              rowHeights={`${window.innerHeight - 200}` / 10}
              licenseKey="non-commercial-and-evaluation"
              readOnly={true}
              ref={hotRef}
              // for non-commercial use only
            />
          </div>

         <div className='flex justify-between'>
         <div className="flex gap-4">
            {data.length > 0 && headers.length > 0 && (
              <CSVLink
                data={data}
                headers={headers}
                filename={`${title}_${timeStampFormatNotHour(tableData.createdAt)}.csv`}
                className="btn_default"
                onClick={() => {
                  if(window.confirm("CSV 파일을 다운로드 하시겠습니까?") ) {
                    return true;
                  } else {
                    return false;
                  }
                }}
              >
                Export CSV
              </CSVLink>
            )}
            {/* <button className="btn_default" onClick={exportToXLSX}>
              Export XLSX
            </button> */}
            <Link to={`/reports/${param}/fix`} className="btn_default"  >
              fix
            </Link>
          </div>
          <div className='flex gap-2'>
            <div onClick={() => scrollToTop()}>
              위로
            </div>
            <div onClick={() => scrollToBottom()} className="">
                아래로
            </div>
          </div>
         </div>
        </div>
      )}
    </div>
  );
}
