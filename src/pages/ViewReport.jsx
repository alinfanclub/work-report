import React, { useRef, useState } from "react";
import { useParams } from "react-router";
import { deleteReport, getReportDataDetail } from "../api/firestore";
import { HotTable } from "@handsontable/react";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatAgo } from "../utill/timeago";
import {
  timeStampFormat,
  timeStampFormatNotHour,
} from "../utill/timeStampFormat";
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
        const newHeaders = JSON.parse(data.data)[0];

        // 그리고null 은 ""으로 바꿔야함
        const newHeaders2 = newHeaders.map((header) => {
          if (header === null) {
            return "";
          } else {
            return header;
          }
        });
        setData(JSON.parse(data.data).slice(1));
        setHeaders(newHeaders2);
        setTitle(data.title);
        // data.data 를 JSON.parse(data.data) 로 바꿔야함
        console.log(JSON.parse(data.data)[0]);
        console.log();
        return data;
      }),
  });

  //scrollViewportTo
  const scrollToBottom = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(hot.countRows() - 1, 0);
    // hot.scrollViewportTo(0,0);
  };

  const scrollToTop = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(0, 0);
    // hot.scrollViewportTo(0,0);
  };

  const handleDelete = async () => {
    if (window.confirm("삭제하시겠습니까?")) {
      await deleteReport(param).then(() => {
        window.location.href = "/";
      });
    } else {
      return false;
    }
  };

  return (
    <div className="min-h-screen">
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
        <div className="flex flex-col gap-4 p-4 w-screen h-full">
          <div className="flex justify-between w-full">
            <h1 className="flex gap-4 items-end">
              {title && title}
              <small>{timeStampFormat(tableData.createdAt)}</small>
              <small>
                {formatAgo(timeStampFormat(tableData.createdAt), "ko")}
              </small>
              {tableData.fix && <small>수정됨</small>}
            </h1>
            <button type="button" onClick={() => handleDelete()}>
              삭제
            </button>
          </div>
          <div className="xl:w-full overflow-hidden reportTable relative flex-grow h-full">
            <HotTable
              id="hot"
              data={data && data}
              colHeaders={headers && headers}
              rowHeaders={true}
              manualColumnMove={true}
              fixedColumnsStart={document.body.clientWidth > 1024 ? 1 : null}
              className="htCenter htMiddle"
              colWidths={
                document.body.clientWidth > 1024
                  ? document.body.clientWidth /
                    JSON.parse(tableData.data)[0].length
                  : (document.body.clientWidth / 3) * 2
              }
              rowHeights={`${window.innerHeight - 200}` / 10}
              licenseKey="non-commercial-and-evaluation"
              readOnly={true}
              ref={hotRef}
              height={`${
                document.body.clientWidth > 1024
                  ? "100%"
                  : document.body.clientHeight - 200
              }`}
              width={`${
                document.body.clientWidth > 1024
                  ? "100%"
                  : document.body.clientWidth
              }`}
              // for non-commercial use only
            />
          </div>

          <div className="flex justify-start xl:gap-10 xl:items-center xl:flex-row flex-col gap-2">
            <div className="flex gap-4">
              {data.length > 0 && (
                <CSVLink
                  data={data}
                  headers={headers}
                  filename={`${title}_${timeStampFormatNotHour(
                    tableData.createdAt
                  )}.csv`}
                  className="btn_default"
                  onClick={() => {
                    if (window.confirm("CSV 파일을 다운로드 하시겠습니까?")) {
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
              <Link to={`/reports/${param}/fix`} className="btn_default">
                fix
              </Link>
            </div>
            <div className="flex gap-2">
              <div onClick={() => scrollToTop()}>위로</div>
              <div onClick={() => scrollToBottom()}>아래로</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
