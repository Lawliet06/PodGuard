// types.ts
import { Timestamp } from 'firebase/firestore';

export interface AccessLog {
  id: string;
  name: string;
  position: string;
  date: string;
  checkinTime: string;
  checkoutTime: string;
}
