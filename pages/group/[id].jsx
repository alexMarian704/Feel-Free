import React from 'react'
import { useRouter } from "next/router";

const Group = () => {
    const route = useRouter()

  return (
    <div>{route.query.id}</div>
  )
}

export default Group