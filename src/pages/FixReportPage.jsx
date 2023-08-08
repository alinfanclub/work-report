import { HotTable } from "@handsontable/react";
import React, { useEffect, useRef, useState } from "react";
import { registerAllModules } from "handsontable/registry";
import { getReportDataDetail, updateReport } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate, useParams } from "react-router";

export default function FixReportPage() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  const param = useParams().id;
  let hot;
  // eslint-disable-next-line
  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [headers, setHeaders] = useState();
  const [data, setData] = useState();

  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    getReportDataDetail(param).then((data) => {
      setData(JSON.parse(data.data));
      setHeaders(data.headers);
      setTitle(data.title);
    });
  }, [param]);

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
    <div className="grow-[1]">
      <form onSubmit={(...arg) => saveClickCallback(...arg)}>
        <input
          type="text"
          placeholder="제목"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
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
          // for non-commercial use only
        />
        <button type="submit">save</button>
      </form>
      <button onClick={addRow}>addRow</button>
    </div>
  );
}
