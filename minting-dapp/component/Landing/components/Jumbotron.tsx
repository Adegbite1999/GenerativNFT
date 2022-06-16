import React from 'react';
import {Link} from "react-router-dom";

function Jumbotron() {
  return (
    <div className='box'>
    <div>
      <h3 className='title'>
        <span className='title-white'> CrackheadsNFT </span><span className='title-green'>DAO</span>
      </h3>
      <p className='desc'>Mint NF’s that gives you accesss to crackhead DAO. 
Crackhead Dao is a platform that helps manage and fund research on how medical marijuana can be used to improve lives.</p>
<Link to="/mint"> 
          <button className="cta">Mint</button>
        </Link>
    </div>
    <div>
     <img src="/image.svg" alt="koala"  />
    </div>
  </div>
  )
}

export default Jumbotron