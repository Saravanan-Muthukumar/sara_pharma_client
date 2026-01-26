// src/components/packing/common/CourierSelect.jsx
const CourierSelect = ({ value, onChange }) => {
    return (
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 rounded-md border px-3 text-sm outline-none focus:border-teal-600"
      >
        <option value="ST">ST</option>
        <option value="Professional">Professional</option>
        <option value="Local">Local</option>
        
      </select>
    );
  };
  
  export default CourierSelect;
  