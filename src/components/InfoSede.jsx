// src/components/InfoSede.jsx
import React from 'react';
import { Card, CardContent, Typography, List, ListItem, ListItemText } from '@mui/material';

const InfoSede = ({ sede }) => (
  <Card className="mb-3">
    <CardContent>
      <Typography variant="h5" component="div">
        Información de la Sede
      </Typography>
      <List>
        <ListItem>
          <ListItemText primary="Dirección" secondary={sede.direccion} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Localidad" secondary={sede.localidad} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Provincia" secondary={sede.provincia} />
        </ListItem>
        <ListItem>
          <ListItemText primary="País" secondary={sede.pais} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Teléfono" secondary={sede.telefono} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Email" secondary={sede.email} />
        </ListItem>
        <ListItem>
          <ListItemText primary="IP Asignada" secondary={sede.ip_asignada} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Empresa" secondary={sede.Empresa.nombre} />
        </ListItem>
      </List>
    </CardContent>
  </Card>
);

export default InfoSede;
