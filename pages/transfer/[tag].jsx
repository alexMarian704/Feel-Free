import React from 'react'
import Transfer from '../transfer'
import { useRouter } from 'next/router';

const TagTransfer = () => {
    const router = useRouter()

  return (
    <Transfer tag={router.query.tag} />
  )
}

export default TagTransfer