export HotTableOption = {
  width={1000}
            rowHeaders={true}
            manualColumnMove={true}
            fixedColumnsStart={1}
            cells={[{ className: "htCenter htMiddle" }]}
            licenseKey="non-commercial-and-evaluation"
            colWidths={`${window.innerWidth - 300}` / headers.length}
            rowHeights={`${window.innerHeight - 200}` / data.length}
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
}