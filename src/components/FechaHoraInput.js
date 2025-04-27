// components/FechaHoraInput.js
export default function FechaHoraInput({ value, onChange }) {
    return (
      <div className="prog-form-group">
        <input
          type="datetime-local"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="prog-form-control"
        />
      </div>
    );
  }
  