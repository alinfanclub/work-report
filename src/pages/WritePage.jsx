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
    "제목",
    "내용",
    "작성자",
    "전달방식",
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

  // const gatData = () => {
  //   (...args) => saveClickCallback(...args)
  // }

  return (
    <div className="grow-[1]">
      <form onSubmit={(...arg) => saveClickCallback(...arg)}>
        <input
          type="text"
          placeholder="제목"
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <HotTable
          id="hot"
          data={data}
          colHeaders={headers}
          rowHeaders={true}
          manualColumnMove={true}
          fixedColumnsStart={1}
          colWidths={100}
          width="100%"
          height={`50vh`}
          licenseKey="non-commercial-and-evaluation"
          ref={hotRef}
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
            {},
            {},
            {},
            {},
          ]}
          // for non-commercial use only
        />
        <button type="submit">save</button>
      </form>
      <button onClick={addRow}>addRow</button>
    </div>
  );
}
