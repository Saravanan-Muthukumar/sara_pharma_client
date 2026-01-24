const DatePicker = ({ selectedDate, onChange, onToday, todayStr }) => {
    return (
      <div className="mt-3 flex items-center gap-2">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 rounded-md border px-3 text-sm outline-none focus:border-teal-600"
        />
      </div>
    );
  };
  
  export default DatePicker;
  