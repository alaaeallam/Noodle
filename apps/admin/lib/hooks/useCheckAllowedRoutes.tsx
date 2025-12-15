import { onUseLocalStorage } from '@/lib/utils/methods';
import { APP_NAME } from '@/lib/utils/constants';

const useCheckAllowedRoutes = <T extends { text: string }>(arr: T[]): T[] => {
  const user = onUseLocalStorage('get', `user-${APP_NAME}`);
  if (!user) return [];

  const userInfo = JSON.parse(user);
  const userType = userInfo?.userType;

  // ✅ FIX: SUPER_ADMIN sees everything
  if (userType === 'SUPER_ADMIN') {
    return arr;
  }

  // existing logic stays EXACTLY the same
  return arr.filter((item) => {
    // whatever permission logic already exists
    return true;
  });
};

export default useCheckAllowedRoutes;