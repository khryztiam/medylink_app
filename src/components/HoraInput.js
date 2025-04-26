// components/HoraInput.js
export default function HoraInput({ onChange }) {
    return (
      <input
        type="time"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }