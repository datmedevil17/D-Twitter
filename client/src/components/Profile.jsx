import React, { useState, useEffect } from "react";
import { Row, Form, Card, Button, Col } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const Profile = ({ state, account }) => {
  const [loading, setLoading] = useState(true);
  const { contract, signer } = state;
  const [nfts, setNfts] = useState("");
  const [profile, setProfile] = useState("");
  const [avatar, setAvatar] = useState("");
  const [username, setUsername] = useState("");

  const loadMyNFTs = async () => {
    const results = await contract.getMyNfts();
    let nfts = await Promise.all(
      results.map(async (i) => {
        const uri = await contract.tokenURI(i);
        const response = await fetch(uri);
        const metadata = await response.json();
        return {
          id: i,
          username: metadata.username,
          avatar: metadata.avatar,
        };
      })
    );
    setNfts(nfts);
    getProfile(nfts);
    
  };
  const getProfile = async (nfts) => {
    console.log(signer);
    const address = await signer.getAddress();
    console.log(address);
    const id = await contract.profiles(address);
    const profile = nfts.find((i) => i.id.toString() === id.toString());
    setProfile(profile);
    setLoading(false);
  };

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    if (typeof file !== "undefined") {
      try {
        const formData = new FormData();
        formData.append("file", file);
        // console.log(formData)
        const res = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `35cb1bf7be19d2a8fa0d`,
            pinata_secret_api_key: `2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log(res);
        const resData = await res.data;
        setAvatar(`https://ipfs.io/ipfs/${resData.IpfsHash}`);
      } catch (error) {
        window.alert("ipfs image upload error : ", error);
      }
    }
  };
  const mintProfile = async (event) => {
    if (!avatar || !username) return;
    try {
      //   const result = await client.add(JSON.stringify({ avatar, username }));
      const data = JSON.stringify({ avatar, username });
      console.log(data)
    //   const formData = new FormData();
    //   formData.append("fileData", data);
    //   console.log(formData)
      const res = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        data: data,
        headers: {
          pinata_api_key: `35cb1bf7be19d2a8fa0d`,
          pinata_secret_api_key: `2c2e9e43bca7a619154cb48e8b060c5643ea6220d0b7c9deb565fa491b3b3a50`,
          "Content-Type": "application/json",
        },
      });
      const resData = await res.data;
    console.log(resData)
      setLoading(true);
      await (
        await contract.mint(`https://ipfs.io/ipfs/${resData.IpfsHash}`)
      ).wait();
      loadMyNFTs();
    } catch (error) {
      window.alert("minting error : ", error);
    }
  };

  const switchProfile = async (nft) => {
    setLoading(true);
    await (await contract.setProfile(nft.id)).wait();
    getProfile(nfts);
  };
  useEffect(() => {
    if (!nfts) {
      loadMyNFTs();
    }
  });
  if (loading)
    return (
      <div className="text-center">
        <main style={{ padding: "1rem 0" }}>
          <h2>Loading...</h2>
        </main>
      </div>
    );
  return (
    <div className="mt-4 text-center">
      {profile ? (
        <div className="mb-3">
          <h3 className="mb-3">{profile.username}</h3>
          <img
            className="mb-3"
            style={{ width: "400px" }}
            src={profile.avatar}
          />
        </div>
      ) : (
        <h4 className="mb-4">No NFT profile, please create one...</h4>
      )}
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setUsername(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Username"
              />
              <div className="d-grid px-0">
                <Button onClick={mintProfile} variant="primary" size="lg">
                  Mint NFT Profile
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      <div className="px-5 container">
        <Row xs={1} md={2} lg={4} className="g-4 py-5">
          {nfts.map((nft, idx) => {
            if (nft.id === profile.id) return;
            return (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={nft.avatar} />
                  <Card.Body color="secondary">
                    <Card.Title>{nft.username}</Card.Title>
                  </Card.Body>
                  <Card.Footer>
                    <div className="d-grid">
                      <Button
                        onClick={() => switchProfile(nft)}
                        variant="primary"
                        size="lg"
                      >
                        Set as Profile
                      </Button>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};

export default Profile;
