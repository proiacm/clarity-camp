import "./App.css";
import ConnectWallet from "./components/ConnectWallet";
import Mint from "./components/Mint";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h2> Another Ape NFT </h2>
        <ConnectWallet />
        <Mint />
      </header>
    </div>
  );
}

export default App;
