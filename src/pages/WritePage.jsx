import { HotTable } from "@handsontable/react";
import React, { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { addReport } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate } from "react-router";

export default function WritePage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  let hot;

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  // eslint-disable-next-line
  const [headers, setHeaders] = useState([
    "날짜",
    "분류",
    "요청자",
    "내용",
    "작업자",
    "전달방식",
    "관련 파일명",
  ]);
  // eslint-disable-next-line
  const [data, setData] = useState();

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
    await addReport(headers, data, user, title).then(() => {
      setTitle("");
      navigate("/");
    });
  };

  return (
    <div className="grow-[1] p-4">
      <form
        onSubmit={(...arg) => saveClickCallback(...arg)}
        className="flex flex-col gap-4 items-start"
      >
        <input
          type="text"
          placeholder="제목"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <HotTable
          id="hot"
          width={1000}
          contextMenu={true}
          colHeaders={headers}
          rowHeaders={true}
          manualColumnMove={true}
          fixedColumnsStart={1}
          licenseKey="non-commercial-and-evaluation"
          ref={hotRef}
          rowHeights={40}
          columns={[
            {
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
        <div className="flex gap-4">
          <button type="submit" className="btn_default">
            save
          </button>

          <button onClick={addRow} type="button" className="btn_default">
            addRow
          </button>
        </div>
      </form>
    </div>
  );
}
