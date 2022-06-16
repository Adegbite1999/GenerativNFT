import React, { ReactChildren, ReactChild } from 'react';
 
interface AuxProps {
  children: JSX.Element|JSX.Element[];
}

import Header from "../Header/Header"
function LayOut({children}:AuxProps) {
  return (
    <>
    <section className="container wrapper">
      <Header/>
      {children}
      </section>
    </>
  )
}

export default LayOut