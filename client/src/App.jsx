import abi from "./contract/TwitterX.json"
import {
  Link,
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Spinner, Navbar, Nav, Button, Container } from 'react-bootstrap'
// import logo from "./images/logo.png"
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from "./components/Home";
import Profile from "./components/Profile";

function App() {
  const [account, setAccount] = useState(null)
  const [state, setState] = useState({
    provider: null,
    signer: null,
    address: null,    
  });
  const [loading, setLoading] = useState(true)



  const connectWallet = async () => {
    window.ethereum.on("chainChanged", ()=>{
      window.location.reload()
    })
    window.ethereum.on("accountsChanged", ()=>{
      window.location.reload()
    })
    const contractAddress = "0x574277F80d96e0C70a9B9C2e90808EfFb86c7Fb4";
    const contractABI = abi.abi;

    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Metamask is not installed");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length === 0) {
        console.log("No account found");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress()
      setAccount(address)
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      console.log(address)

      setState({ provider, signer, contract,address });
      setLoading(false)
    } catch (error) {
      console.error("Error connecting to Metamask:", error);
    }
  };

  

  return (
    <>
    <BrowserRouter>
      <div className="App">
        <>
          <Navbar expand="lg" bg="secondary" variant="dark">
            <Container>
              <Navbar.Brand>
                {/* <img src={logo} width="40" height="40" className="" alt="" /> */}
                &nbsp; Decentratwitter
              </Navbar.Brand>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="me-auto">
                  <Nav.Link as={Link} to="/">Home</Nav.Link>
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                </Nav>
                <Nav>
                  {account ? (
                    <Nav.Link
                      href={`https://etherscan.io/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="button nav-button btn-sm mx-4">
                      <Button variant="outline-light">
                        {account.slice(0, 5) + '...' + account.slice(38, 42)}
                      </Button>

                    </Nav.Link>
                  ) : (
                    <Button onClick={connectWallet} variant="outline-light">Connect Wallet</Button>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home state={state} account={account}/>
              } />
              <Route path="/profile" element={
                <Profile state={state} account={account} />
              } />
            </Routes>
          )}
        </div>
      </div>
    </BrowserRouter>
      
    </>
  )
}

export default App
