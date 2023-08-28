import React, { useRef, useState } from "react";
import { useParams } from "react-router";
import { deleteReport, getReportDataDetail } from "../api/firestore";
import { CSVLink } from "react-csv";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatAgo } from "../utill/timeago";
import {
  timeStampFormat,
  timeStampFormatNotHour,
} from "../utill/timeStampFormat";
import HotTableOption from "../service/HotTableOption";
import { MdDeleteOutline } from "react-icons/md";
import { BsPencilSquare } from "react-icons/bs";
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
        const newHeaders2 = newHeaders.map((header) => {
          if (header === null) {
            return "";
          } else {
            return header;
          }
        });
        setData(
          data.headers !== null || data.headers !== undefined
            ? JSON.parse(data.data).slice(1)
            : JSON.parse(data.data).slice(1)
        );
        setHeaders(
          data.headers === undefined
            ? newHeaders2
            : data.headers !== null
            ? data.headers
            : newHeaders2
        );
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
    hot.scrollViewportTo(hot.countRows() - 1, hot.countCols() - 1);
  };

  const scrollToTop = () => {
    const hot = hotRef.current.hotInstance;
    hot.scrollViewportTo(0, 0);
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
    <div className="w-full min-h-screen">
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
        <div className="grow flex flex-col gap-4 p-4 w-full">
          <div className="flex justify-between w-full items-start xl:items-center">
            <h1 className="flex gap-4 xl:items-end flex-col xl:flex-row ">
              {title && title}
              <div className="flex gap-2">
                <small>{timeStampFormat(tableData.createdAt)}</small>
                <small>
                  {formatAgo(timeStampFormat(tableData.createdAt), "ko")}
                </small>
                {tableData.fix && <small>수정됨</small>}
              </div>
            </h1>
            <div className="flex gap-4 items-center">
              <Link to={`/reports/${param}/fix`} className="text-xl">
                <BsPencilSquare />
              </Link>
              <button
                type="button"
                onClick={() => handleDelete()}
                className="text-2xl "
              >
                <MdDeleteOutline />
              </button>
            </div>
          </div>
          <div className="h-[170vw] xl:h-[86vh] w-full overflow-hidden reportTable relative">
            <HotTableOption
              tableData={tableData}
              data={data}
              hotRef={hotRef}
              colHeaders={headers}
              readOnly={true}
            />
          </div>
          <div className="flex justify-between">
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
                      setTimeout(() => {
                        this.csvLink.current.link.click();
                      });
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
            </div>
            <div className="flex gap-2">
              <div onClick={() => scrollToTop()}>위로</div>
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
