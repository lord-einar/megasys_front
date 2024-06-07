// src/components/SelectField.jsx
const SelectField = ({ label, name, options, valueKey, register, errors, readOnly }) => {

  console.log(options)
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <select
        {...register(name)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        disabled={readOnly}
      >
        <option value="">--Seleccione {label.toLowerCase()}--</option>
        {options.map((option) => (
          <option key={option[valueKey]} value={option[valueKey]}>
            {option.nombre || `${option.tipo_articulo}-${option.marca}-${option.modelo}-${option.num_serie}`}
          </option>
        ))}
      </select>
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">{errors[name].message}</p>
      )}
    </div>
  );
};

export default SelectField;
