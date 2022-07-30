//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";  // 카운터
import "@openzeppelin/contracts/access/Ownable.sol";  // 소유권
import "@openzeppelin/contracts/utils/math/SafeMath.sol";  // 오버플로우 방지
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol"; // 메인

contract NFTCollectible is ERC721Enumerable, Ownable {
    using SafeMath for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;  // mapping된 요소의 숫자를 추적하기 위해서

    uint public constant MAX_SUPPLY = 100;   // 상태변수를 상수로 선언
    uint public constant PRICE = 0.01 ether;
    uint public constant MAX_PER_MINT = 5;

    string public baseTokenURI;

    constructor(string memory baseURI) ERC721("MINGYU_TOKEN", "MIN") { // name, symbol 의미.
        setBaseURI(baseURI);
    }
    
    // NFT 비축하기 
    function reserveNFTs() public onlyOwner { // 계약 소유자만 호출가능
     uint totalMinted = _tokenIds.current();  // 현재 가진 토큰 양(실제 양은 아니고 카운터 용도이다.)
     require(
        totalMinted.add(10) < MAX_SUPPLY, "Not enough NFTs" // 최대 공급량을 넘지 않기 위해서
     );
     for (uint i = 0; i < 10; i++) {  // 토큰 10개 생성
          _mintSingleNFT();
     }
    }
    
    // 초기세팅
    function _baseURI() internal   
                        view 
                        virtual 
                        override 
                        returns (string memory) {
        return baseTokenURI;
    }

    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function mintNFTs(uint _count) public payable {  
        uint totalMinted = _tokenIds.current();
        require(    // _count만큼 만들고 싶어요.
            totalMinted.add(_count) <= MAX_SUPPLY, "Not enough NFTs!"  // 공급량 초과 방지
        );
        require(    // 민팅이 양수여야 하니까, 한 번에 만들 수 있는 최대 양 조정
            _count > 0 && _count <= MAX_PER_MINT, 
            "Cannot mint specified number of NFTs."
        );
        require(  // NFT를 살 수 있는 돈이 있는지 확인
            msg.value >= PRICE.mul(_count),   // 개당 NFT 가격 * 갯수
            "Not enough ether to purchase NFTs."
        );
        for (uint i = 0; i < _count; i++) {
            _mintSingleNFT();   // 실제로 민팅, 주소할당 같이 데이터를 바꾸는 곳은 여기, 1씩 증가시킨다.
        }
    }
    
    function burnNFTs() public payable {
        uint totalMinted = _tokenIds.current();
        require(totalMinted > 0, "nothing to burn NFTs!");
        _burn(totalMinted);
        _tokenIds.decrement();
    }

    function _mintSingleNFT() private {   // 아무나 접근하면 안되니까 private로 설정
      uint newTokenID = _tokenIds.current();  // counter value 값
      _safeMint(msg.sender, newTokenID);      // _balances의 매핑중에 msg.sender(key)의 value 값을 +1 해주고(토큰 개수 1 증가), _owners의 매핑중에 tokenId(key)의 value에 msg.sender 대입(소유권 변경)
      _tokenIds.increment();                  // counter value 값도 +1 해준다.
    }

    // _owner가 가진 NFT 조회 기능
    function tokensOfOwner(address _owner) 
         external 
         view 
         returns (uint[] memory) {
     uint tokenCount = balanceOf(_owner);  // _balances(총 잔액)라는 mapping 중에 key값에 _owner에 해당하는 값 반환
     uint[] memory tokensId = new uint256[](tokenCount);
     for (uint i = 0; i < tokenCount; i++) {
          tokensId[i] = tokenOfOwnerByIndex(_owner, i);  // _owner의 토큰리스트 중에 i번째 값인 tokenId(NFT)를 반환
     }

     return tokensId;   // _owner가 가지고 있는 tokenId(NFT) 반환
    }

    // 인출 기능
    function withdraw() public payable onlyOwner {
     uint balance = address(this).balance;      // 해당 주소의 잔액
     require(balance > 0, "No ether left to withdraw");  // 잔액이 있는지 확인
     (bool success, ) = (msg.sender).call{value: balance}(""); // 송금 기능
     require(success, "Transfer failed.");
    }

    
}