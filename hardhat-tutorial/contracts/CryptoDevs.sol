// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

// Ownable allows us to call onlyOwner modifier
// 
contract CryptoDevs is ERC721Enumerable, Ownable {


    // to save base uri
    string _baseTokenURI;

    // to save an Instance of the whitelist interface
    IWhitelist whitelist;
    
    bool public presaleStarted;

    uint256 public presaleEnded;

    uint256 public maxTokenIds = 20;

    uint256 public tokenIds;

    uint256 public _price = 0.01 ether;

    // NFT metadata, & whitelist contract as well as name and symbol for NFT collection
    constructor(string memory _baseURI, address whitelistContract) ERC721("Crypto Devs", "CD") {
        _baseTokenURI = _baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner {
        presaleStarted = true;
        
        // End after 5 minutes of current blockstamp
        presaleEnded = block.timestamp + 5 minutes;
    }

    function presaleMint() public payable {

        // Check if presale started and hasnt ended yet
        require(presaleStarted && block.timestamp < presaleEnded, "Presale has ended!");
        // Check if address trying to mint is in whitelisted addresses
        require(whitelist.whitelistedAddresses(msg.sender), "You are not in the whitelist!");
        // Check How many tokens have been minted, cant exceed max supply
        require(tokenIds <= maxTokenIds, "Exceeded the limit");
        // require price
        require(msg.value >= _price, "Not enough funds to mint");

        // increase number of tokens minted after each mint
        tokenIds += 1;

        // takes an address & token ID
        // checks for null address
        // checks token id exists
        // assigns token id to address minting
        // emits mint event
        _safeMint(msg.sender, tokenIds);

    }

    function mint() public payable {
        // check if presale ended
        require(presaleStarted && block.timestamp >= presaleEnded, "Presale has not ended yet");
        // Check How many tokens have been minted, cant exceed max supply
        require(tokenIds <= maxTokenIds, "Exceeded the limit");
        // require price
        require(msg.value >= _price, "Not enough funds to mint");

        tokenIds += 1;

        _safeMint(msg.sender, tokenIds);

    }

    // overriding baseURI function because it returns an empty string
    // We want it to return the base URI 
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    // withdraw eth from contract
    function withdraw() public onlyOwner {
        
        // returns owner of smart contract(whoever deploys the smart contract)
        address _owner = owner();
        
        // stores eth balance of smart contract 
        uint256 amount = address(this).balance;
        
        // transfer the eth to owner's address, sent checks if sent or not
        (bool sent, ) = _owner.call{ value: amount }("");
        
        require(sent, "Failed to send ether");
    }

    // functions to recieve ether
    receive() external payable {}

    // fallback used if data is also being sent, not just ether
    fallback() external payable {}


}