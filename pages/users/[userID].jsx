import React from 'react';
import { useRouter } from 'next/router';

export default function UserID() {
  const router = useRouter()
  return (
  <div>
      <h1>salut {router.query.userID}</h1>
  </div>
  )
}
