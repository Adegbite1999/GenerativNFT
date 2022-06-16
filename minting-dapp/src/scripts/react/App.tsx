import React from 'react'
import Dapp from './Dapp'
import Landing from "../../../component/Landing/Landing"
import LayOut from '../../../component/LayOut/LayOut';
import { Routes, Route, Link } from "react-router-dom";

function App() {
  return (
    <>
    <LayOut>
    <Routes>
      <Route path='/' element={<Landing/>}/>
      <Route path='/mint' element={<Dapp/>}/>
    </Routes>
    </LayOut>
      {/* <Dapp/> */}
    </>
  )
}

export default App