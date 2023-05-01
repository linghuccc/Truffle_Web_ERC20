这个 project 是 TinTinLand 以太坊入门课，第 7 课的作业。

本 project 部署在 Sepolia 测试网上，合约地址如下：

<table>
  <tr>
    <th>合约名称</th>
    <th>合约地址</th>
  </tr>
  <tr>
    <td>CloneFactory</td>
    <td>0xf11fCe2aDa8d2001a5C9f9De6A3F8E2D358d2Ed3</td>
  </tr>
  <tr>
    <td>StdERC20</td>
    <td>0x40bB95A6d23b95E3a90044da2F2AafDaad877d9d</td>
  </tr>
  <tr>
    <td>CustomERC20</td>
    <td>0x1e702bf95Ba5ee30c1861E129E6cE6B269301a2A</td>
  </tr>
  <tr>
    <td>CustomMintableERC20</td>
    <td>0x4B18368b50730db3F16828e3e7e0B48f62c6e984</td>
  </tr>
  <tr>
    <td>ERC20V3Factory</td>
    <td>0x3caeC62c11aCc2dedFb2015eA7f686E9ef4e0E68</td>
  </tr>
</table>

本 project 使用 Truffle 框架，有前端界面，支持在浏览器中一键发币。

Entry 界面：client/public/index.html。

# React Truffle Box

This box comes with everything you need to start using Truffle to write, compile, test, and deploy smart contracts, and interact with them from a React app.

## Installation

First ensure you are in an empty directory.

Run the `unbox` command using 1 of 2 ways.

```sh
# Install Truffle globally and run `truffle unbox`
$ npm install -g truffle
$ truffle unbox react
```

```sh
# Alternatively, run `truffle unbox` via npx
$ npx truffle unbox react
```

Start the react dev server.

```sh
$ cd client
$ npm start
```

From there, follow the instructions on the hosted React app. It will walk you through using Truffle and Ganache to deploy the `SimpleStorage` contract, making calls to it, and sending transactions to change the contract's state.

## FAQ

- **How do I use this with Ganache (or any other network)?**

  The Truffle project is set to deploy to Ganache by default. If you'd like to change this, it's as easy as modifying the Truffle config file! Check out [our documentation on adding network configurations](https://trufflesuite.com/docs/truffle/reference/configuration/#networks). From there, you can run `truffle migrate` pointed to another network, restart the React dev server, and see the change take place.

- **Where can I find more resources?**

  This Box is a sweet combo of [Truffle](https://trufflesuite.com) and [Webpack](https://webpack.js.org). Either one would be a great place to start!
