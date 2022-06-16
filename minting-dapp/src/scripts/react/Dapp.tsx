import React from 'react';
import { ethers, BigNumber } from 'ethers'
import { ExternalProvider, Web3Provider } from '@ethersproject/providers';
import detectEthereumProvider from '@metamask/detect-provider';
import NftContractType from '../lib/NftContractType';
import CollectionConfig from '../../../../smart-contract/config/CollectionConfig';
import NetworkConfigInterface from '../../../../smart-contract/lib/NetworkConfigInterface';
import CollectionStatus from './CollectionStatus';
import MintWidget from './MintWidget';
import Whitelist from '../lib/Whitelist';
import {Link} from "react-router-dom";

const ContractAbi = require('../../../../smart-contract/artifacts/contracts/' + CollectionConfig.contractName + '.sol/' + CollectionConfig.contractName + '.json').abi;

interface Props {
}

interface State {
  userAddress: string|null;
  network: ethers.providers.Network|null;
  networkConfig: NetworkConfigInterface;
  totalSupply: number;
  maxSupply: number;
  maxMintAmountPerTx: number;
  tokenPrice: BigNumber;
  isPaused: boolean;
  isWhitelistMintEnabled: boolean;
  isUserInWhitelist: boolean;
  merkleProofManualAddress: string;
  merkleProofManualAddressFeedbackMessage: string|JSX.Element|null;
  errorMessage: string|JSX.Element|null;
}

const defaultState: State = {
  userAddress: null,
  network: null,
  networkConfig: CollectionConfig.mainnet,
  totalSupply: 0,
  maxSupply: 0,
  maxMintAmountPerTx: 0,
  tokenPrice: BigNumber.from(0),
  isPaused: true,
  isWhitelistMintEnabled: false,
  isUserInWhitelist: false,
  merkleProofManualAddress: '',
  merkleProofManualAddressFeedbackMessage: null,
  errorMessage: null,
};

export default class Dapp extends React.Component<Props, State> {
  provider!: Web3Provider;

  contract!: NftContractType;

  private merkleProofManualAddressInput!: HTMLInputElement;

  constructor(props: Props) {
    super(props);

    this.state = defaultState;
  }

  
  componentDidMount = async () => {
    const browserProvider = await detectEthereumProvider() as ExternalProvider;

    if (browserProvider?.isMetaMask !== true) {
      this.setError( 
        <>
          We were not able to detect <strong>MetaMask</strong>. We value <strong>privacy and security</strong> a lot so we limit the wallet options on the DAPP.<br />
          <br />
          But don't worry! <span className="emoji">😃</span> You can always interact with the smart-contract through <a href={this.generateContractUrl()} target="_blank">{this.state.networkConfig.blockExplorer.name}</a> and <strong>we do our best to provide you with the best user experience possible</strong>, even from there.<br />
          <br />
          You can also get your <strong>Whitelist Proof</strong> manually, using the tool below.
        </>,
      );
    }

    this.provider = new ethers.providers.Web3Provider(browserProvider);

    this.registerWalletEvents(browserProvider);

    await this.initWallet();
  }
  

  async mintTokens(amount: number): Promise<void>
  {
    try {
      await this.contract.mint(amount, {value: this.state.tokenPrice.mul(amount)});
    } catch (e) {
      this.setError(e);
    }
  }



  async whitelistMintTokens(amount: number): Promise<void>
  {
    try {
      await this.contract.whitelistMint(amount, Whitelist.getProofForAddress(this.state.userAddress!), {value: this.state.tokenPrice.mul(amount)});
    } catch (e) {
      this.setError(e);
    }
  }

  

  private isWalletConnected(): boolean
  {
    return this.state.userAddress !== null;
  }

  private isContractReady(): boolean
  {
    return this.contract !== undefined;
  }

  private isSoldOut(): boolean
  {
    return this.state.maxSupply !== 0 && this.state.totalSupply < this.state.maxSupply;
  }

  private isNotMainnet(): boolean
  {
    return this.state.network !== null && this.state.network.chainId !== CollectionConfig.mainnet.chainId;
  }

  private copyMerkleProofToClipboard(): void
  {
    const merkleProof = Whitelist.getRawProofForAddress(this.state.userAddress ?? this.state.merkleProofManualAddress);

    if (merkleProof.length < 1) {
      this.setState({
        merkleProofManualAddressFeedbackMessage: 'The given address is not in the whitelist, please double-check.',
      });

      return;
    }

    navigator.clipboard.writeText(merkleProof);

    this.setState({
      merkleProofManualAddressFeedbackMessage: 
      <>
        <strong>Congratulations!</strong> <span className="emoji">🎉</span><br />
        Your Merkle Proof <strong>has been copied to the clipboard</strong>. You can paste it into <a href={this.generateContractUrl()} target="_blank">{this.state.networkConfig.blockExplorer.name}</a> to claim your tokens.
      </>,
    });
  }



  render() {
    return (
      <>
      <div className='landing-relative'>
      <div className="landing-absolute">
        <p className="landing_link">
        <Link to="#">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="20" fill="#6E8678" />
            <path
              d="M30 13.5888C29.2639 13.915 28.4741 14.1362 27.6442 14.2349C28.4915 13.7275 29.1402 12.9227 29.4476 11.9666C28.6527 12.4365 27.7754 12.7777 26.8406 12.9627C26.092 12.1641 25.0271 11.6667 23.8461 11.6667C21.5803 11.6667 19.7431 13.5038 19.7431 15.7684C19.7431 16.0896 19.7794 16.4033 19.8494 16.7032C16.44 16.532 13.4168 14.8986 11.3935 12.4165C11.0398 13.0214 10.8386 13.7263 10.8386 14.4786C10.8386 15.9021 11.5634 17.1582 12.6632 17.893C11.9909 17.8705 11.3585 17.6855 10.8048 17.3781V17.4293C10.8048 19.4165 12.2196 21.0749 14.0955 21.4523C13.7518 21.5448 13.3894 21.5961 13.0144 21.5961C12.7495 21.5961 12.4933 21.5698 12.2421 21.5198C12.7644 23.1508 14.2792 24.3368 16.0739 24.3693C14.6704 25.4691 12.9007 26.1227 10.9786 26.1227C10.6474 26.1227 10.3212 26.1027 10 26.0665C11.8159 27.2325 13.9718 27.9124 16.2888 27.9124C23.8362 27.9124 27.9617 21.6611 27.9617 16.2396L27.9479 15.7084C28.754 15.1335 29.4513 14.4112 30 13.5888Z"
              fill="#060707"
            />
          </svg>
        </Link>
                  
        </p>
        <p className="landing_link">        <Link to="#">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="20" fill="#6E8678" />
            <path
              d="M26.6498 14.3078C25.0576 13.0266 22.5389 12.8094 22.4311 12.8016C22.2639 12.7875 22.1045 12.8812 22.0357 13.0359C22.0295 13.0453 21.9748 13.1719 21.9139 13.3687C22.967 13.5469 24.2607 13.9047 25.4311 14.6312C25.6186 14.7469 25.6764 14.9937 25.5607 15.1812C25.4842 15.3047 25.3545 15.3719 25.2201 15.3719C25.1482 15.3719 25.0748 15.3516 25.0092 15.3109C22.9967 14.0625 20.4842 14 19.9998 14C19.5154 14 17.0014 14.0625 14.9904 15.3109C14.8029 15.4281 14.5561 15.3703 14.4404 15.1828C14.3232 14.9937 14.3811 14.7484 14.5686 14.6312C15.7389 13.9062 17.0326 13.5469 18.0857 13.3703C18.0248 13.1719 17.9701 13.0469 17.9654 13.0359C17.8951 12.8812 17.7373 12.7844 17.5686 12.8016C17.4607 12.8094 14.942 13.0266 13.3279 14.325C12.4857 15.1047 10.7998 19.6609 10.7998 23.6C10.7998 23.6703 10.8186 23.7375 10.8529 23.7984C12.0154 25.8422 15.1889 26.3766 15.9123 26.4C15.9154 26.4 15.9201 26.4 15.9248 26.4C16.0529 26.4 16.1732 26.3391 16.2482 26.2359L16.9795 25.2297C15.0061 24.7203 13.9982 23.8547 13.9404 23.8031C13.7748 23.6578 13.7592 23.4047 13.9061 23.2391C14.0514 23.0734 14.3045 23.0578 14.4701 23.2031C14.4936 23.225 16.3498 24.8 19.9998 24.8C23.6561 24.8 25.5123 23.2187 25.5311 23.2031C25.6967 23.0594 25.9482 23.0734 26.0951 23.2406C26.2404 23.4062 26.2248 23.6578 26.0592 23.8031C26.0014 23.8547 24.9936 24.7203 23.0201 25.2297L23.7514 26.2359C23.8264 26.3391 23.9467 26.4 24.0748 26.4C24.0795 26.4 24.0842 26.4 24.0873 26.4C24.8107 26.3766 27.9842 25.8422 29.1467 23.7984C29.1811 23.7375 29.1998 23.6703 29.1998 23.6C29.1998 19.6609 27.5139 15.1047 26.6498 14.3078ZM17.3998 22C16.6264 22 15.9998 21.2844 15.9998 20.4C15.9998 19.5156 16.6264 18.8 17.3998 18.8C18.1732 18.8 18.7998 19.5156 18.7998 20.4C18.7998 21.2844 18.1732 22 17.3998 22ZM22.5998 22C21.8264 22 21.1998 21.2844 21.1998 20.4C21.1998 19.5156 21.8264 18.8 22.5998 18.8C23.3732 18.8 23.9998 19.5156 23.9998 20.4C23.9998 21.2844 23.3732 22 22.5998 22Z"
              fill="#060707"
            />
          </svg>
        </Link>
        </p>
        <p className="landing_link">
        <Link  to="#">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="20" fill="#6E8678" />
            <path
              d="M16.4002 11.2C13.5322 11.2 11.2002 13.532 11.2002 16.4V23.6C11.2002 26.468 13.5322 28.8 16.4002 28.8H23.6002C26.4682 28.8 28.8002 26.468 28.8002 23.6V16.4C28.8002 13.532 26.4682 11.2 23.6002 11.2H16.4002ZM24.8002 14.4C25.2402 14.4 25.6002 14.76 25.6002 15.2C25.6002 15.64 25.2402 16 24.8002 16C24.3602 16 24.0002 15.64 24.0002 15.2C24.0002 14.76 24.3602 14.4 24.8002 14.4ZM20.0002 15.6C22.4282 15.6 24.4002 17.572 24.4002 20C24.4002 22.428 22.4282 24.4 20.0002 24.4C17.5722 24.4 15.6002 22.428 15.6002 20C15.6002 17.572 17.5722 15.6 20.0002 15.6ZM20.0002 16.4C18.0162 16.4 16.4002 18.016 16.4002 20C16.4002 21.984 18.0162 23.6 20.0002 23.6C21.9842 23.6 23.6002 21.984 23.6002 20C23.6002 18.016 21.9842 16.4 20.0002 16.4Z"
              fill="#060707"
            />
          </svg>
        </Link>
        </p>
        <p className="landing_link">
        <Link to="#">
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="40" height="40" rx="20" fill="#6E8678" />
            <path
              d="M25.4058 10.0042L22.8123 10C19.8985 10 18.0155 11.9319 18.0155 14.922V17.1914H15.4078C15.1825 17.1914 15 17.3741 15 17.5994V20.8875C15 21.1128 15.1827 21.2953 15.4078 21.2953H18.0155V29.5922C18.0155 29.8175 18.198 30 18.4233 30H21.8256C22.051 30 22.2334 29.8173 22.2334 29.5922V21.2953H25.2825C25.5078 21.2953 25.6903 21.1128 25.6903 20.8875L25.6915 17.5994C25.6915 17.4912 25.6484 17.3876 25.5721 17.311C25.4957 17.2345 25.3917 17.1914 25.2835 17.1914H22.2334V15.2676C22.2334 14.343 22.4538 13.8736 23.6583 13.8736L25.4054 13.873C25.6305 13.873 25.813 13.6903 25.813 13.4651V10.412C25.813 10.1871 25.6308 10.0046 25.4058 10.0042Z"
              fill="#060707"
            />
          </svg>
        </Link>
        </p>
      </div>
      </div>
      
        <img id="logo" src="/build/images/preview.gif" alt="Logo" />
        {this.isNotMainnet() ?
          <div className="not-mainnet">
            You are not connected to the main network.
            <span className="small">Current network: <strong>{this.state.network?.name}</strong></span>
          </div>
          : null}

        {this.state.errorMessage ? <div className="error"><p>{this.state.errorMessage}</p><button onClick={() => this.setError()}>Close</button></div> : null}
        
        {this.isWalletConnected() ?
          <>
            {this.isContractReady() ?
              <>
                <CollectionStatus
                  userAddress={this.state.userAddress}
                  maxSupply={this.state.maxSupply}
                  totalSupply={this.state.totalSupply}
                  isPaused={this.state.isPaused}
                  isWhitelistMintEnabled={this.state.isWhitelistMintEnabled}
                  isUserInWhitelist={this.state.isUserInWhitelist}
                />
                {this.state.totalSupply < this.state.maxSupply ?
                  <MintWidget
                    networkConfig={this.state.networkConfig}
                    maxSupply={this.state.maxSupply}
                    totalSupply={this.state.totalSupply}
                    tokenPrice={this.state.tokenPrice}
                    maxMintAmountPerTx={this.state.maxMintAmountPerTx}
                    isPaused={this.state.isPaused}
                    isWhitelistMintEnabled={this.state.isWhitelistMintEnabled}
                    isUserInWhitelist={this.state.isUserInWhitelist}
                    mintTokens={(mintAmount) => this.mintTokens(mintAmount)}
                    whitelistMintTokens={(mintAmount) => this.whitelistMintTokens(mintAmount)}
                  />
                  :
                  <div className="collection-sold-out">
                    <h2>Tokens have been <strong>sold out</strong>! <span className="emoji">🥳</span></h2>

                    You can buy from our beloved holders on <a href={this.generateMarketplaceUrl()} target="_blank">{CollectionConfig.marketplaceConfig.name}</a>.
                  </div>
                }
              </>
              :
              <div className="collection-not-ready">
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>

                Loading collection data...
              </div>
            }
          </>
        : null}

        {!this.isWalletConnected() || !this.isSoldOut() ?
          <div className="no-wallet">
            {!this.isWalletConnected() ? <button className="primary" disabled={this.provider === undefined} onClick={() => this.connectWallet()}>Connect Wallet</button> : null}
            
            <div className="use-block-explorer">
              Hey, looking for a <strong>super-safe experience</strong>? <span className="emoji">😃</span><br />
              You can interact with the smart-contract <strong>directly</strong> through <a href={this.generateContractUrl()} target="_blank">{this.state.networkConfig.blockExplorer.name}</a>, without even connecting your wallet to this DAPP! <span className="emoji">🚀</span><br />
              <br />
              Keep safe! <span className="emoji">❤️</span>
            </div>
                                                      
            {!this.isWalletConnected() || this.state.isWhitelistMintEnabled ?
              <div className="merkle-proof-manual-address">
                <h2>Whitelist Proof</h2>
                <p>
                  Anyone can generate the proof using any public address in the list, but <strong>only the owner of that address</strong> will be able to make a successful transaction by using it.
                </p>

                {this.state.merkleProofManualAddressFeedbackMessage ? <div className="feedback-message">{this.state.merkleProofManualAddressFeedbackMessage}</div> : null}

                <label htmlFor="merkle-proof-manual-address">Public address:</label>
                <input id="merkle-proof-manual-address" type="text" placeholder="0x000..." disabled={this.state.userAddress !== null} value={this.state.userAddress ?? this.state.merkleProofManualAddress} ref={(input) => this.merkleProofManualAddressInput = input!} onChange={() => {this.setState({merkleProofManualAddress: this.merkleProofManualAddressInput.value})}} /> <button className='btn_cta' onClick={() => this.copyMerkleProofToClipboard()}>Generate and copy to clipboard</button>
              </div>
              : null}
          </div>
          : null}
      </>
    );
  }

  private setError(error: any = null): void
  {
    let errorMessage = 'Unknown error...';

    if (null === error || typeof error === 'string') {
      errorMessage = error;
    } else if (typeof error === 'object') {
      // Support any type of error from the Web3 Provider...
      if (error?.error?.message !== undefined) {
        errorMessage = error.error.message;
      } else if (error?.data?.message !== undefined) {
        errorMessage = error.data.message;
      } else if (error?.message !== undefined) {
        errorMessage = error.message;
      } else if (React.isValidElement(error)) {
        this.setState({errorMessage: error});
  
        return;
      }
    }

    this.setState({
      errorMessage: null === errorMessage ? null : errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1),
    });
  }

  private generateContractUrl(): string
  {
    return this.state.networkConfig.blockExplorer.generateContractUrl(CollectionConfig.contractAddress!);
  }

  private generateMarketplaceUrl(): string
  {
    return CollectionConfig.marketplaceConfig.generateCollectionUrl(CollectionConfig.marketplaceIdentifier, !this.isNotMainnet());
  }

  private async connectWallet(): Promise<void>
  {
    try {
      await this.provider.provider.request!({ method: 'eth_requestAccounts' });

      this.initWallet();
    } catch (e) {
      this.setError(e);
    }
  }

  private async initWallet(): Promise<void>
  {
    const walletAccounts = await this.provider.listAccounts();
    
    this.setState(defaultState);

    if (walletAccounts.length === 0) {
      return;
    }

    const network = await this.provider.getNetwork();
    let networkConfig: NetworkConfigInterface;

    if (network.chainId === CollectionConfig.mainnet.chainId) {
      networkConfig = CollectionConfig.mainnet;
    } else if (network.chainId === CollectionConfig.testnet.chainId) {
      networkConfig = CollectionConfig.testnet;
    } else {
      this.setError('Unsupported network!');

      return;
    }
    
    this.setState({
      userAddress: walletAccounts[0],
      network,
      networkConfig,
    });

    if (await this.provider.getCode(CollectionConfig.contractAddress!) === '0x') {
      this.setError('Could not find the contract, are you connected to the right chain?');

      return;
    }

    this.contract = new ethers.Contract(
      CollectionConfig.contractAddress!,
      ContractAbi,
      this.provider.getSigner(),
    ) as NftContractType;

    this.setState({
      maxSupply: (await this.contract.maxSupply()).toNumber(),
      totalSupply: (await this.contract.totalSupply()).toNumber(),
      maxMintAmountPerTx: (await this.contract.maxMintAmountPerTx()).toNumber(),
      tokenPrice: await this.contract.cost(),
      isPaused: await this.contract.paused(),
      isWhitelistMintEnabled: await this.contract.whitelistMintEnabled(),
      isUserInWhitelist: Whitelist.contains(this.state.userAddress ?? ''),
    });
  }

  private registerWalletEvents(browserProvider: ExternalProvider): void
  {
    // @ts-ignore
    browserProvider.on('accountsChanged', () => {
      this.initWallet();
    });

    // @ts-ignore
    browserProvider.on('chainChanged', () => {
      window.location.reload();
    });
  }
}
