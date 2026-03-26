export const HISTORY_DATA = [
  {
    id: 1,
    title: "Crepa Salada - La Marée",
    location: "Sucursal Polanco",
    date: "15 OCT 2023",
    month: "Octubre 2023",
    status: "redeemed" as const,
  },
  {
    id: 2,
    title: "Bebida Refrescante",
    location: "Sucursal Roma Norte",
    date: "02 SEP 2023",
    month: "Septiembre 2023",
    status: "redeemed" as const,
  },
  {
    id: 3,
    title: "Regalo de Cumpleaños",
    location: "App Móvil",
    date: "20 AGO 2023",
    month: "Agosto 2023",
    status: "gift" as const,
  },
  {
    id: 4,
    title: "Café Latte",
    location: "Sucursal Polanco",
    date: "10 AGO 2023",
    month: "Agosto 2023",
    status: "redeemed" as const,
  },
  {
    id: 5,
    title: "Crepa de Nutella",
    location: "Sucursal Condesa",
    date: "05 JUL 2023",
    month: "Julio 2023",
    status: "redeemed" as const,
  },
  {
    id: 6,
    title: "Bebida de Verano",
    location: "Sucursal Roma Norte",
    date: "28 JUN 2023",
    month: "Junio 2023",
    status: "gift" as const,
  },
];

export type HistoryEntry = (typeof HISTORY_DATA)[0];
export type HistoryStatus = HistoryEntry["status"];
