import { Lead } from '../lead/lead';
import { Role } from '../role/role';
import { Tab } from '../tab/tab';

export type User = {
  id: string;
  roles: Role[];
  leaders: Lead[];
  followers: Lead[];
  tabs: Tab[];
  email: string;
  isRegisteredWithGoogle: boolean;
  name: string;
  lowercaseName: string;
  routeName: string;
  description: string;
  color: string;
  palette: string;
  balance: number;
  replyN: number;
  lng: number | null;
  lat: number | null;
  mapLng: number | null;
  mapLat: number | null;
  mapZoom: number | null;
  verifyEmailDate: Date | null;
  activeDate: string;
  checkAlertsDate: string;
  createGraphDate: string | null;
  navigateGraphDate: string | null;
  togglePaletteDate: string | null;
  createDate: string;
  updateDate: string;
  deleteDate: string | null;

  currentUserLead: Lead | null;
  
  __typename: string;
};
