import React, { useState } from "react";
import { CSVLink } from "react-csv";

export default function WritePage() {
  const [headers, setHeaders] = useState([
    { label: "날짜", key: "date" },
    { label: "제목", key: "title" },
    { label: "내용", key: "content" },
    { label: "작성자", key: "writer" },
    { label: "전달 방식", key: "method" },
  ]);

  const [data, setData] = useState([
    {
      id: "dfsdfsdf",
      date: "2021-09-01",
      title: "첫번째 글",
      content: "처ㅂ번째 글 내용",
      writer: "ahmed",
      method: "email",
    },
    {
      id: "dfsdsfdf",
      date: "2021-09-01",
      title: "두번쨰 글",
      content: "두번째 글 내용\n글 띄워찔ㄲㄷ까? ",
      writer: "tome",
      method: "email",
    },
    {
      id: "fsdfsadg",
      date: "2021-09-01",
      title: "세번쨰 글",
      content: "세번째 글 내용",
      writer: "tyler",
      method: "kakao",
    },
  ]);

  const [wholeData, setWholeData] = useState({
    headers: { ...headers },
    content: { ...data },
  });

  console.log(wholeData);
  console.log(wholeData.headers);

  const hadleRemove = (index) => {
    console.log(index);
    setData((data) => data.filter((item) => item.id !== index));
  };
  return (
    <div className="grow-[1]">
      <table className="w-full">
        <thead>
          <tr>
            <th>No.</th>
            {headers.map((header, index) => (
              <th key={index}>{header.label}</th>
            ))}

            <th>edit</th>
            <th>remove</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              {Object.values(row)
                .slice(1)
                .map((value, i) => (
                  <td key={i}>
                    <p>{value}</p>
                  </td>
                ))}
              <td>edit</td>
              <td onClick={() => hadleRemove(row.id)}>remove</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CSVLink data={data} headers={headers}>
        Download me
      </CSVLink>
      ;
    </div>
  );
}
