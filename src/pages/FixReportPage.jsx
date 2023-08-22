import { HotTable } from "@handsontable/react";
import React, { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { getReportDataDetail, updateReport } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { timeStampFormat } from "../utill/timeStampFormat";

export default function FixReportPage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  const param = useParams().id;
  let hot;
  // eslint-disable-next-line
  const [user, setUser] = useState(null);
  const [cell, setCell] = useState([]);
  const [title, setTitle] = useState("");

  const {
    isLoading,
    isError,
    data: tableData,
  } = useQuery({
    queryKey: ["report", param],
    queryFn: () =>
      getReportDataDetail(param).then((data) => {
        // const newHeaders = JSON.parse(data.data)[0];

        // // 그리고null 은 ""으로 바꿔야함
        // const newHeaders2 = newHeaders.map((header) => {
        //   if(header === null) {
        //     return "";
        //   } else {
        //     return header;
        //   }
        // })
        setCell(JSON.parse(data.data));
        // setHeaders(Array(data.headers).concat(JSON.parse(data.data))[0]);
        console.log(data.headers);
        console.log(Array(data.headers).concat(JSON.parse(data.data)));

        setTitle(data.title);
        return data;
      }),
      refetchOnWindowFocus: false,
  });

  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);

  // const addRow = () => {
  //   const newRow = new Array(headers.length).fill("");
  //   hot = hotRef.current.hotInstance;
  //   hot.alter("insert_row_below", hot.countRows(), 1, newRow);
  // };

  const saveClickCallback = async (e) => {
    e.preventDefault();
    hot = hotRef.current.hotInstance;
    console.log({ data: JSON.stringify(hot.getData()) });
    let data = JSON.stringify(hot.getData());
    await updateReport(data, title, param).then(() => {
      setTitle("");
      navigate(`/reports/${param}`);
    });
  };

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
  const exclude = () => {
    const handsontableInstance = hotRef.current.hotInstance;
    const lastRowIndex = handsontableInstance.countRows() - 1;

    // after each sorting, take row 1 and change its index to 0
    handsontableInstance.rowIndexMapper.moveIndexes(
      handsontableInstance.toVisualRow(0),
      0
    );
    // after each sorting, take row 16 and change its index to 15
    handsontableInstance.rowIndexMapper.moveIndexes(
      handsontableInstance.toVisualRow(lastRowIndex),
      lastRowIndex
    );
  };

  return (
    <div className='min-h-screen grow'>
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
        <form
          onSubmit={(...arg) => saveClickCallback(...arg)}
          className="flex flex-col gap-4 p-4 w-full h-full"
        >
          <div className="flex gap-2 items-end">
            <input
              type="text"
              placeholder="제목"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              className="max-w-[300px]"
              required
            />
            <small>{timeStampFormat(tableData.createdAt)}</small>
          </div>
          <div className="xl:w-full overflow-hidden reportTable relative flex-grow h-full">
            <HotTable
              id="hot"
              data={cell}
              colHeaders={true}
              ref={hotRef}
              contextMenu={true}
              rowHeaders={true}
              manualColumnMove={true}
              fixedColumnsStart={document.body.clientWidth > 1024 ? 1 : null}
              className="htCenter htMiddle"
              licenseKey="non-commercial-and-evaluation"
              colWidths={
                document.body.clientWidth > 1024
                  ?   `${window.innerWidth - 300}` /
                  JSON.parse(tableData.data)[0].length
                  : (document.body.clientWidth / 3) * 2
              }
              rowHeights={`${window.innerHeight - 200}` / 10}
              // columns={headers && headers.map((header) => ({ colHeaders: header }))}
              manualColumnResize={true}
              dropdownMenu={true}
              columnSorting={true}
              afterColumnSort={exclude}
              height={`${
                document.body.clientWidth > 1024
                  ? "100%"
                  : document.body.clientHeight - 200
              }`}

              // for non-commercial use only
            />
          </div>
          <div className="flex justify-start gap-4 items-center">
            <div className="flex gap-4">
              <button type="submit" className="btn_default">
                save
              </button>
              {/* <button onClick={addRow} type="button" className="btn_default">
              addRow
            </button> */}
            </div>
            <div className="flex gap-2">
              <div onClick={() => scrollToTop()}>위로</div>
              <div onClick={() => scrollToBottom()} className="">
                아래로
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
