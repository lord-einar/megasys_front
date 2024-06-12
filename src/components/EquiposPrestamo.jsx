import axios from 'axios';

const EquiposPrestamo = ({ prestamos, onViewRemito }) => {

  console.log(prestamos)

  const remitoPrestamo = async(id) => {
    await axios.get(`http://localhost:6060/remitos/${id}`)
      .then(resp => {
        onViewRemito(resp.data)
      })
  }

  return (
    <table className="min-w-full bg-white rounded-lg shadow-md">
      <thead className="bg-gray-800 text-white">
        <tr>
          <th className="w-1/12 py-2">Marca</th>
          <th className="w-1/12 py-2">Modelo</th>
          <th className="w-1/12 py-2">Tipo de Artículo</th>
          <th className="w-1/12 py-2">Service Tag</th>
          <th className="w-1/12 py-2">Número de Serie</th>
          <th className="w-1/12 py-2">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {prestamos.map((item) => {
          console.log(item.inventarios)
          return (
          <tr key={item.id_remito} className="hover:bg-gray-100">
            <td className="border px-4 py-2">{item.Inventario.marca}</td>
            <td className="border px-4 py-2">{item.Inventario.modelo}</td>
            <td className="border px-4 py-2">{item.Inventario.tipo_articulo}</td>
            <td className="border px-4 py-2">{item.Inventario.service_tag}</td>
            <td className="border px-4 py-2">{item.Inventario.num_serie}</td>
            <td className="border px-4 py-2">
              <button
                onClick={() => remitoPrestamo(item.id_remito)}
                className="bg-gray-500 text-white py-1 px-2 rounded"
                >
                Ver Remito
              </button>
            </td>
          </tr>
        )})}
      </tbody>
    </table>
  );
};

export default EquiposPrestamo;
