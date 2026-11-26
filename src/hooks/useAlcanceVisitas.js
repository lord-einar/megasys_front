import { useEffect, useState } from 'react';
import { visitasAPI } from '../services/api';

/**
 * Sedes de las que el usuario es responsable y el interruptor "Solo mis sedes".
 * La regla la aplica el backend (visitaAlcancePolicy.js); acá solo se arma la UI:
 * - forzado: técnico con sedes asignadas, siempre ve solo lo suyo.
 * - puedeFiltrar: super_admin con sedes asignadas, elige (arranca en "solo mis sedes").
 */
export function useAlcanceVisitas() {
    const [alcance, setAlcance] = useState({ sedes: [], forzado: false, puede_filtrar: false });
    const [soloMisSedes, setSoloMisSedes] = useState(false);
    const [cargado, setCargado] = useState(false);

    useEffect(() => {
        let activo = true;
        visitasAPI.getMiAlcance()
            .then(res => {
                if (!activo || !res?.data) return;
                setAlcance(res.data);
                setSoloMisSedes(res.data.puede_filtrar);
            })
            .catch(() => { /* sin alcance: el backend igual restringe */ })
            .finally(() => activo && setCargado(true));
        return () => { activo = false; };
    }, []);

    const restringido = alcance.forzado || (alcance.puede_filtrar && soloMisSedes);

    return {
        sedesAsignadas: alcance.sedes,
        forzado: alcance.forzado,
        puedeFiltrar: alcance.puede_filtrar,
        soloMisSedes,
        setSoloMisSedes,
        restringido,
        cargado
    };
}
