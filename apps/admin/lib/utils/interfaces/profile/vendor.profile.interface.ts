import { IGlobalComponentProps } from '../global.interface';
import {
  IQueryResult,
  ISingleVendorResponseGraphQL,
} from '@/lib/utils/interfaces';
export interface IVendorProfile {
  _id: string;
  email: string;
  userType: 'ADMIN' | 'VENDOR' | 'SUPER_ADMIN';
  name?: string;
  image?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}
export type ProfileQueryResult = { profile: IVendorProfile };
export interface IVendorProfileContextData {
  isUpdateProfileVisible: boolean;
  setIsUpdateProfileVisible: (v: boolean) => void;
  handleUpdateProfile: () => void;
  vendorProfileResponse: IQueryResult<ProfileQueryResult, undefined>;
  activeIndex: number;
  onActiveStepChange: (idx: number) => void;
  refetchVendorProfile: () => Promise<void> | void;
}
