import React, { useState, useRef, useEffect } from "react";
import Web3 from "web3";
import ERC20V3Factory from "../contracts/ERC20V3Factory.json";
import BigNumber from "bignumber.js";
import "../css/Content.css";

function Content() {
  // Connect to MetaMask using web3.js
  const web3 = new Web3(window.ethereum);

  /* =========== 用于第一部分 Wallet 的参数 =========== */
  const [chainName, setChainName] = useState("");
  const [chainId, setChainId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletBalance, setWalletBalance] = useState("");

  /* =========== 用于第二部分 Records 和第三部分 Contract 的参数 =========== */
  const contractAddress = "0x3caeC62c11aCc2dedFb2015eA7f686E9ef4e0E68";
  const contractABI = ERC20V3Factory.abi;
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const recordsRef = useRef(null);
  const [stdRecords, setStdRecords] = useState(null);
  const [customRecords, setCustomRecords] = useState(null);
  const [customMintableRecords, setCustomMintableRecords] = useState(null);

  /* =========== 用于第三部分 Contract 的参数 =========== */
  const [fee, setFee] = useState("");
  const [tokenType, setTokenType] = useState("standard");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [decimals, setDecimals] = useState("");
  const [tradeBurnRatio, setTradeBurnRatio] = useState("");
  const [tradeFeeRatio, setTradeFeeRatio] = useState("");
  const [teamAccount, setTeamAccount] = useState("");
  const [transferData, setTransferData] = useState(null);

  /* =========== 用于第四部分 Hash 的参数 =========== */
  const [estimateGas, setEstimateGas] = useState("");
  const [gasPrice, setGasPrice] = useState("");
  const [hash, setHash] = useState("");
  const [transaction, setTransaction] = useState(false);

  /* =========== 用于第一部分 Wallet 的函数 =========== */
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Reset display, may not be necessary
        setWalletAddress("");
        setEstimateGas("");
        setGasPrice("");
        setHash("");
        // Request account access if needed
        await window.ethereum.request({ method: "eth_requestAccounts" });
        // Get the connected chain ID
        const chainIdNo = await web3.eth.getChainId();
        if (chainIdNo === 11155111) {
          setChainName("Sepolia");
          setChainId(chainIdNo);

          // Get the user's address
          const accounts = await web3.eth.getAccounts();
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
          alert("Please switch to Sepolia network.");
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Please install MetaMask to connect your wallet.");
    }
  };

  const loadPage = async () => {
    // Get the user's balance
    const balance = await web3.eth.getBalance(walletAddress);
    const balanceETH = Number(web3.utils.fromWei(balance));
    let balanceFormatted;
    // If balance has 5 decimal points or less, balanceFormatted is balance
    if (Number.isInteger(balanceETH)) {
      balanceFormatted = balanceETH;
    } else if (balanceETH.toString().match(/\.\d{1,5}$/)) {
      balanceFormatted = balanceETH;
    } else {
      balanceFormatted = balanceETH.toFixed(5);
    }
    setWalletBalance(balanceFormatted);

    loadRecords();
    loadFee();
  };

  /* =========== 用于第二部分 Records 的函数 =========== */
  const loadRecords = async () => {
    if (walletAddress) {
      try {
        const records = await contract.methods
          .getTokenByUser(walletAddress.toString())
          .call();
        if (records[0].length > 0) {
          setStdRecords(records[0]);
        }
        if (records[1].length > 0) {
          setCustomRecords(records[1]);
        }
        if (records[2].length > 0) {
          setCustomMintableRecords(records[2]);
        }
      } catch (error) {
        console.error("Error loading records: ", error);
      }
    } else {
      alert("Please connect your wallet first.");
    }
  };

  /* =========== 用于第三部分 Contract 的函数 =========== */
  const loadFee = async () => {
    try {
      const feeValue = await contract.methods._CREATE_FEE_().call();
      setFee(feeValue);
    } catch (error) {
      console.error("Error loading fee: ", error);
    }
  };

  const isNegative = (input, name) => {
    const parsedInput = parseInt(input);
    if (isNaN(parsedInput)) {
      alert(name + " must be an integer.");
      return true;
    }

    if (parsedInput < 0) {
      alert(name + " can not be less than 0.");
      return true;
    }
  };

  const isNegativeOrZero = (input, name) => {
    if (isNegative(input, name)) {
      return true;
    }

    if (parseInt(input) === 0) {
      alert(name + " must be greater than 0.");
      return true;
    }
  };

  const checkDecimalsFailed = (input, name) => {
    if (isNegative(input, name)) {
      return true;
    }

    if (parseInt(input) >= 256) {
      alert(name + " must be less than 256.");
      return true;
    }
  };

  const checkRatioFailed = (ratio, name) => {
    if (isNegative(ratio, name)) {
      return true;
    }

    if (parseInt(ratio) > 5000) {
      alert(name + " must be equal or less than 5000.");
      return true;
    }
  };

  const checkAddressFailed = (address, name) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      alert(name + " must be a valid Ethereum address.");
      return true;
    }
  };

  const checkFailed = () => {
    if (!name || !symbol || !totalSupply || !decimals) {
      alert("Please fill in all required fields.");
      return true;
    }

    // totalSupply must be a positive interger (cannot be zero)
    // decimals can be zero, but must be less than 256
    if (
      isNegativeOrZero(totalSupply, "Total Supply") ||
      checkDecimalsFailed(decimals, "Decimals")
    ) {
      return true;
    }

    if (tokenType !== "standard") {
      if (!tradeBurnRatio || !tradeFeeRatio || !teamAccount) {
        alert("Please fill in all required fields.");
        return true;
      }

      // tradeBurnRatio and tradeFeeRatio can be zero
      // (tradeBurnRatio + tradeFeeRatio) cannot be more than 10000
      if (
        checkRatioFailed(tradeBurnRatio, "Trade Burn Ratio") ||
        checkRatioFailed(tradeFeeRatio, "Trade Fee Ratio") ||
        checkAddressFailed(teamAccount, "Team Account")
      ) {
        return true;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (checkFailed()) {
      return;
    }

    if (walletAddress) {
      try {
        const accountBalance = await web3.eth.getBalance(walletAddress);
        const feeValue = await contract.methods._CREATE_FEE_().call();
        setFee(feeValue);

        if (Number(accountBalance) > Number(feeValue)) {
          let data;

          // const tokenSupply = totalSupply * 10 ** decimals;
          const tokenSupply = new BigNumber(totalSupply).times(
            new BigNumber(10).pow(decimals)
          );

          if (tokenType === "standard") {
            data = contract.methods
              .createStdERC20(tokenSupply.toFixed(), name, symbol, decimals)
              .encodeABI();
          } else if (tokenType === "custom") {
            data = contract.methods
              .createCustomERC20(
                tokenSupply.toFixed(),
                name,
                symbol,
                decimals,
                tradeBurnRatio,
                tradeFeeRatio,
                teamAccount
              )
              .encodeABI();
          } else if (tokenType === "mintable") {
            data = contract.methods
              .createCustomMintableERC20(
                tokenSupply.toFixed(),
                name,
                symbol,
                decimals,
                tradeBurnRatio,
                tradeFeeRatio,
                teamAccount
              )
              .encodeABI();
          }

          setTransferData(data);
        } else {
          setTransferData(null);
          alert("Insufficient balance. Please top up or change wallet.");
        }
      } catch (error) {
        console.error(error);
        alert("An error occurred while generating the token.");
      }
    } else {
      alert("Please connect your wallet first.");
    }
  };

  /* =========== 用于第四部分 Hash 的函数 =========== */
  const generateGas = async () => {
    try {
      // 展示 gas 信息
      const estimatedGasValue = await web3.eth.estimateGas({
        to: contractAddress,
        data: transferData,
        from: walletAddress,
        value: fee,
      });
      setEstimateGas(estimatedGasValue);
      const gasPriceValue = await web3.eth.getGasPrice();
      setGasPrice(gasPriceValue);
    } catch (error) {
      console.error("Error submitting transaction: ", error);
    }
  };

  const sendTransaction = async () => {
    try {
      // 展示 transaction hash 信息
      const nonce = await web3.eth.getTransactionCount(walletAddress);
      const rawTransaction = {
        from: walletAddress,
        to: contractAddress,
        nonce: nonce,
        gasPrice: gasPrice,
        gas: estimateGas * 2,
        value: fee,
        data: transferData,
        chainId: chainId,
      };

      // Owen code 里面的 nonce 用了 toHex(),为什么不报错？
      web3.eth
        .sendTransaction(rawTransaction)
        .on("transactionHash", function (hashValue) {
          setHash(hashValue);
        })
        .on("confirmation", async function (confirmationNumber, receipt) {
          if (confirmationNumber >= 1) {
            // Wait for at least 1 confirmation
            setTransaction(true);
          }
        });

      setTransferData(null);
    } catch (error) {
      console.error("Error submitting transaction: ", error);
    }
  };

  /* =========== 用于更新页面信息 =========== */
  useEffect(() => {
    // console.log("loadPage() called");
    if (walletAddress) {
      loadPage();
    }
  }, [walletAddress]);

  // Transaction has already been set as false, why is this function called repeatedly?
  useEffect(() => {
    console.log("loadRecords() called");
    if (transaction) {
      loadRecords();
    }
    if (
      transaction &&
      recordsRef.current &&
      (stdRecords || customRecords || customMintableRecords)
    ) {
      recordsRef.current.focus();
      setTransaction(false);
    }
  }, [transaction, stdRecords, customRecords, customMintableRecords]);

  useEffect(() => {
    // console.log("generateGas() called");
    if (transferData) {
      generateGas();
    }
  }, [transferData]);

  useEffect(() => {
    // console.log("sendTransaction() called");
    if (transferData && estimateGas && gasPrice) {
      sendTransaction();
    }
  }, [transferData, estimateGas, gasPrice]);

  useEffect(() => {
    // console.log("gasPrice called");
    if (gasPrice) {
      window.scrollTo(0, document.documentElement.scrollHeight);
    }
  }, [gasPrice]);

  useEffect(() => {
    // console.log("document.body.scrollHeight called");
    if (hash) {
      window.scrollTo(0, document.documentElement.scrollHeight);
    }
  }, [hash]);

  return (
    <div>
      {/* =========== 用于第一部分 Wallet 的 HTML 代码 =========== */}
      <div className="section" style={{ marginTop: "10px" }}>
        <button className="button" onClick={connectWallet}>
          Connect Wallet
        </button>
        {walletAddress && (
          <div className="two_columns" style={{ padding: "10px" }}>
            <span>Chain Name: </span>
            <span>{chainName}</span>
            <span>Chain ID: </span>
            <span>{chainId}</span>
            <span>Wallet Address: </span>
            <span>{walletAddress}</span>
            <span tabIndex={0} ref={recordsRef} style={{ outline: "none" }}>
              Balance:{" "}
            </span>
            <span>{walletBalance ? `${walletBalance} ETH` : "Loading..."}</span>
          </div>
        )}
      </div>

      {/* =========== 用于第二部分 Records 的 HTML 代码 =========== */}
      {stdRecords || customRecords || customMintableRecords ? (
        <div className="section">
          {stdRecords ? (
            <div className="two_columns" style={{ padding: "10px" }}>
              <span>Standard ERC20 token:</span>
              {stdRecords.map((item) => (
                <span key={item} style={{ gridColumn: "2" }}>
                  <a
                    href={`https://sepolia.etherscan.io/token/${item}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item}
                  </a>
                </span>
              ))}
            </div>
          ) : null}
          {customRecords ? (
            <div className="two_columns" style={{ padding: "10px" }}>
              <span>Custom ERC20 token:</span>
              {customRecords.map((item) => (
                <span key={item} style={{ gridColumn: "2" }}>
                  <a
                    href={`https://sepolia.etherscan.io/token/${item}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item}
                  </a>
                </span>
              ))}
            </div>
          ) : null}
          {customMintableRecords ? (
            <div className="two_columns" style={{ padding: "10px" }}>
              <span>Custom Mintable ERC20 token:</span>
              {customMintableRecords.map((item) => (
                <span key={item} style={{ gridColumn: "2" }}>
                  <a
                    href={`https://sepolia.etherscan.io/token/${item}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item}
                  </a>
                </span>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* =========== 用于第三部分 Contract 的 HTML 代码 =========== */}
      {walletAddress && (
        <div className="section">
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            {fee ? (
              <span>Fee: {web3.utils.fromWei(fee)} ETH</span>
            ) : (
              <span>Loading fee...</span>
            )}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three_columns">
              <label>
                <input
                  type="radio"
                  name="tokenType"
                  value="standard"
                  checked={tokenType === "standard"}
                  onChange={() => setTokenType("standard")}
                />
                Standard ERC20 Token
              </label>
              <label>
                <input
                  type="radio"
                  name="tokenType"
                  value="custom"
                  checked={tokenType === "custom"}
                  onChange={() => setTokenType("custom")}
                />
                Custom ERC20 Token
              </label>
              <label>
                <input
                  type="radio"
                  name="tokenType"
                  value="mintable"
                  checked={tokenType === "mintable"}
                  onChange={() => setTokenType("mintable")}
                />
                Custom Mintable ERC20 Token
              </label>
            </div>
            <div className="four_columns">
              <span>Name:</span>
              <span>
                <input
                  className="input"
                  style={{ width: "300px" }}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </span>
              <span>Symbol:</span>
              <span>
                <input
                  className="input"
                  style={{ width: "50px" }}
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                />
              </span>
              <span id="supply">
                {tokenType === "mintable" ? "Initial Supply:" : "Total Supply:"}
              </span>
              <span>
                <input
                  className="input"
                  style={{ width: "300px" }}
                  type="number"
                  value={totalSupply}
                  onChange={(e) => setTotalSupply(e.target.value)}
                />
              </span>
              <span>Decimals:</span>
              <span>
                <input
                  className="input"
                  style={{ width: "50px" }}
                  type="number"
                  value={decimals}
                  onChange={(e) => setDecimals(e.target.value)}
                />
              </span>
            </div>
            {tokenType !== "standard" && (
              <div>
                <div className="four_columns">
                  <span>Team Account:</span>
                  <span>
                    <input
                      className="input"
                      style={{ width: "300px" }}
                      type="text"
                      value={teamAccount}
                      onChange={(e) => setTeamAccount(e.target.value)}
                    />
                  </span>
                  <span>Trade Fee Ratio:</span>
                  <span>
                    <input
                      className="input"
                      style={{ width: "50px" }}
                      type="number"
                      value={tradeFeeRatio}
                      onChange={(e) => setTradeFeeRatio(e.target.value)}
                    />
                  </span>
                  <span>Trade Burn Ratio:</span>
                  <span>
                    <input
                      className="input"
                      style={{ width: "50px" }}
                      type="number"
                      value={tradeBurnRatio}
                      onChange={(e) => setTradeBurnRatio(e.target.value)}
                    />{" "}
                  </span>
                </div>
              </div>
            )}
            <div
              className="one_column"
              style={{ marginTop: "20px", marginBottom: "10px" }}
            >
              *Token supply generated will be (Total Supply) * 10 ** (Decimals).
              For example, if Total Supply is 1000 and Decimals is 2, the
              generated token supply will be 1000 * 10 ** 2 = 100,000.
            </div>
            {tokenType !== "standard" && (
              <div
                className="one_column"
                style={{ marginTop: "10px", marginBottom: "20px" }}
              >
                **Trade Fee Ratio and Trade Burn Ratio will be used as " X /
                10000 " (0 &lt;= X &lt;= 10000). For example, input 1850 means
                1850 / 10000 = 18.5%.
              </div>
            )}
            <div>
              <button className="button" type="submit">
                Generate Token
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========== 用于第四部分 Hash 的 HTML 代码 =========== */}
      {estimateGas || gasPrice || hash ? (
        <section className="section" style={{ marginBottom: "20px" }}>
          {estimateGas && gasPrice && (
            <div className="two_columns" style={{ padding: "10px" }}>
              <span>Estimated Gas: </span>
              <span>{estimateGas}</span>
              <span>Gas Price (in gwei): </span>
              <span>{web3.utils.fromWei(gasPrice, "gwei")}</span>
            </div>
          )}
          {hash && (
            <div style={{ padding: "10px" }}>
              <span>Transaction Hash:&nbsp;&nbsp;&nbsp;</span>
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {hash}
              </a>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

export default Content;
