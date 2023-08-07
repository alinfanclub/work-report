import { HotTable } from "@handsontable/react";
import React, { createRef, useEffect, useRef, useState } from "react";
import { CSVLink } from "react-csv";
import { registerAllModules } from "handsontable/registry";
import { addReport, getReportDataDetail } from "../api/firestore";
import { onUserStateChanged } from "../api/firebase";
import { useNavigate, useParams } from "react-router";

export default function FixReport() {
  registerAllModules();
  const navigate = useNavigate();
  const hotRef = useRef(null);
  const param = useParams();
  let hot;

  const [user, setUser] = useState(null);
  const [title, setTitle] = useState("");
  const [headers, setHeaders] = useState([
    "날짜",
    "제목",
    "내용",
    "작성자",
    "전달방식",
  ]);
  const [data, setData] = useState();

  useEffect(() => {
    onUserStateChanged((user) => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    getReportDataDetail(param.id).then((data) => {
      console.log(data);
      console.log(data.data);
      console.log(data.headers);
      setData(JSON.parse(data.data));
      setHeaders(data.headers);
      setTitle(data.title);
      console.log(data.title);
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
          // for non-commercial use only
        />
        <button type="submit">save</button>
      </form>
      <button onClick={addRow}>addRow</button>
    </div>
  );
}
