// components/FechaHoraInput.js
export default function FechaHoraInput({ value, onChange }) {
    return (
      <div className="material-group">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }
  