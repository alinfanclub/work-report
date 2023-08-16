import { HotTable } from "@handsontable/react";
import React, { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { getReportDataDetail, updateReport } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import timeStampFormat from "../utill/timeStampFormat";

export default function FixReportPage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  const param = useParams().id;
  let hot;
  // eslint-disable-next-line
  const [user, setUser] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [data, setData] = useState([]);
  const [title, setTitle] = useState("");

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

  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);

  const addRow = () => {
    const newRow = new Array(headers.length).fill("");
    hot = hotRef.current.hotInstance;
    hot.alter("insert_row_below", hot.countRows(), 1, newRow);
  };

  const saveClickCallback = async (e) => {
    e.preventDefault();
    hot = hotRef.current.hotInstance;
    console.log({ data: JSON.stringify(hot.getData()) });
    let data = JSON.stringify(hot.getData());
    await updateReport(headers, data, title, param).then(() => {
      setTitle("");
      navigate(`/reports/${param}`);
    });
  };

  // const gatData = () => {
  //   (...args) => saveClickCallback(...args)
  // }

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
        <form
          onSubmit={(...arg) => saveClickCallback(...arg)}
          className="flex flex-col gap-4 grow-[1] p-4"
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
          <div className="h-[86vh] w-[87vw] overflow-hidden">
            <HotTable
              id="hot"
              data={data && data}
              colHeaders={headers}
              ref={hotRef}
              contextMenu={true}
              rowHeaders={true}
              manualColumnMove={true}
              fixedColumnsStart={1}
              className="htCenter htMiddle"
              licenseKey="non-commercial-and-evaluation"
              colWidths={`${window.innerWidth - 300}` / headers.length}
              rowHeights={`${window.innerHeight - 200}` / 5}
              columns={[
                {
                  // handsontable datepicker witn timepicker

                  type: "date",
                  dateFormat: "YY/MM/DD",
                  correctFormat: true,
                  defaultDate: new Intl.DateTimeFormat("ko", {
                    dateStyle: "full",
                    timeStyle: "short",
                  }).format(new Date()),
                  // datePicker additional options
                  // (see https://github.com/dbushell/Pikaday#configuration)
                  datePickerConfig: {
                    // First day of the week (0: Sunday, 1: Monday, etc)
                    firstDay: 0,
                    showWeekNumber: true,
                    licenseKey: "non-commercial-and-evaluation",
                    disableDayFn(date) {
                      // Disable Sunday and Saturday
                      return date.getDay() === 0 || date.getDay() === 6;
                    },
                    reposition: true,
                  },
                },
                {
                  editor: "select",
                  selectOptions: ["요청", "GUI", "퍼블", "휴무", "기타"],
                },
                {},
                {},
                {},
                {},
                {},
              ]}
              manualColumnResize={true}
              dropdownMenu={true}
              columnSorting={true}
              // for non-commercial use only
            />
          </div>
          <div className="flex gap-4">
            <button type="submit" className="btn_default">
              save
            </button>
            <button onClick={addRow} type="button" className="btn_default">
              addRow
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
