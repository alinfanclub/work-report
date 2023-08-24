import { HotTable } from '@handsontable/react';
import React from 'react';

export default function HotTableOption({tableData, data, hotRef, colHeaders, readOnly}) {

  const exclude = () => {
    const handsontableInstance = hotRef.current.hotInstance;
    const lastRowIndex = handsontableInstance.countRows() - 1;
  
    // after each sorting, take row 1 and change its index to 0
    handsontableInstance.rowIndexMapper.moveIndexes(handsontableInstance.toVisualRow(0), 0);
    // after each sorting, take row 16 and change its index to 15
    handsontableInstance.rowIndexMapper.moveIndexes(
      handsontableInstance.toVisualRow(lastRowIndex),
      lastRowIndex
    );
  };
  console.log(data)
  console.log(tableData)

  return (
    <HotTable
    id="hot"
    data={data ? data : null}
    colHeaders={colHeaders}
    rowHeaders={true}
    manualColumnMove={true}
    fixedColumnsStart={1}
    className="htCenter htMiddle"
    colWidths={tableData ? `${window.innerWidth - 300}` / JSON.parse(tableData.data)[0].length : `${window.innerWidth - 300}` / 7}
    rowHeights={`${window.innerHeight - 200}` / 10}
    licenseKey="non-commercial-and-evaluation"
    readOnly={readOnly ? readOnly : false}
    ref={hotRef}
    contextMenu={true}
    manualColumnResize={true}
    dropdownMenu={true}
    columnSorting={true}
    afterColumnSort={exclude}
    // for non-commercial use only
  />
  );
}

