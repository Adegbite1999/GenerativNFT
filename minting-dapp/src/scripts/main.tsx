import '../styles/main.scss';
import { BrowserRouter } from 'react-router-dom';

import ReactDOM from 'react-dom';
// import Dapp from './react/Dapp';
import CollectionConfig from '../../../smart-contract/config/CollectionConfig';
import App from './react/App';

if (document.title === '') {
  document.title = CollectionConfig.tokenName;
}

document.addEventListener('DOMContentLoaded', async () => {
  ReactDOM.render(
  <BrowserRouter>
  <App />
  </BrowserRouter>
  , document.getElementById('minting-dapp'));
});
