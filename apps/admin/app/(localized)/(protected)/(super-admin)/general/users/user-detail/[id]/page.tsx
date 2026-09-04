'use client';
import UserDetailScreen from '@/lib/ui/screens/super-admin/user-detail';
import React, { use } from 'react';

const UserDetailPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  return <UserDetailScreen userId={id} />;
};

export default UserDetailPage;
