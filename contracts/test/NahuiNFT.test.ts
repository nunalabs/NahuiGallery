import { expect } from "chai";
import { ethers } from "hardhat";
import { NahuiNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("NahuiNFT", function () {
  // Fixture to deploy contract
  async function deployNahuiNFTFixture() {
    const [owner, artist, buyer, royaltyReceiver, otherAccount] =
      await ethers.getSigners();

    const NahuiNFT = await ethers.getContractFactory("NahuiNFT");
    const nft = await NahuiNFT.deploy(
      "Nahui Art",
      "NAHUI",
      "ipfs://QmTest/",
      100, // maxSupply
      ethers.parseEther("0.1"), // mintPrice
      artist.address,
      royaltyReceiver.address,
      500 // 5% royalty
    );

    return { nft, owner, artist, buyer, royaltyReceiver, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      const { nft } = await loadFixture(deployNahuiNFTFixture);

      expect(await nft.name()).to.equal("Nahui Art");
      expect(await nft.symbol()).to.equal("NAHUI");
    });

    it("Should set the correct max supply", async function () {
      const { nft } = await loadFixture(deployNahuiNFTFixture);

      expect(await nft.maxSupply()).to.equal(100);
    });

    it("Should set the correct mint price", async function () {
      const { nft } = await loadFixture(deployNahuiNFTFixture);

      expect(await nft.mintPrice()).to.equal(ethers.parseEther("0.1"));
    });

    it("Should set the correct artist address", async function () {
      const { nft, artist } = await loadFixture(deployNahuiNFTFixture);

      expect(await nft.artist()).to.equal(artist.address);
      expect(await nft.owner()).to.equal(artist.address);
    });

    it("Should enable minting by default", async function () {
      const { nft } = await loadFixture(deployNahuiNFTFixture);

      expect(await nft.mintingActive()).to.be.true;
    });

    it("Should set correct royalty info", async function () {
      const { nft, royaltyReceiver } = await loadFixture(deployNahuiNFTFixture);

      const [receiver, royaltyAmount] = await nft.royaltyInfo(
        1,
        ethers.parseEther("1")
      );

      expect(receiver).to.equal(royaltyReceiver.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.05")); // 5%
    });

    it("Should start token ID at 1", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      await nft.connect(buyer).mint(1, { value: ethers.parseEther("0.1") });

      expect(await nft.ownerOf(1)).to.equal(buyer.address);
      await expect(nft.ownerOf(0)).to.be.reverted;
    });
  });

  describe("Minting", function () {
    it("Should allow public minting", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      await nft.connect(buyer).mint(1, { value: ethers.parseEther("0.1") });

      expect(await nft.ownerOf(1)).to.equal(buyer.address);
      expect(await nft.balanceOf(buyer.address)).to.equal(1);
      expect(await nft.totalMinted()).to.equal(1);
    });

    it("Should allow batch minting (ERC-721A efficiency)", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      const tx = await nft
        .connect(buyer)
        .mint(5, { value: ethers.parseEther("0.5") });

      expect(await nft.balanceOf(buyer.address)).to.equal(5);
      expect(await nft.totalMinted()).to.equal(5);

      // Verify all tokens are owned by buyer
      for (let i = 1; i <= 5; i++) {
        expect(await nft.ownerOf(i)).to.equal(buyer.address);
      }
    });

    it("Should revert if minting is not active", async function () {
      const { nft, artist, buyer } = await loadFixture(deployNahuiNFTFixture);

      await nft.connect(artist).toggleMinting();

      await expect(
        nft.connect(buyer).mint(1, { value: ethers.parseEther("0.1") })
      ).to.be.revertedWithCustomError(nft, "MintingNotActive");
    });

    it("Should revert if payment is insufficient", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      await expect(
        nft.connect(buyer).mint(1, { value: ethers.parseEther("0.05") })
      ).to.be.revertedWithCustomError(nft, "InsufficientPayment");
    });

    it("Should revert if exceeds max supply", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      await expect(
        nft.connect(buyer).mint(101, { value: ethers.parseEther("10.1") })
      ).to.be.revertedWithCustomError(nft, "ExceedsMaxSupply");
    });

    it("Should refund excess payment", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      const initialBalance = await ethers.provider.getBalance(buyer.address);
      const tx = await nft
        .connect(buyer)
        .mint(1, { value: ethers.parseEther("0.2") }); // Overpay
      const receipt = await tx.wait();

      const finalBalance = await ethers.provider.getBalance(buyer.address);
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      // Should have paid exactly mint price + gas
      expect(initialBalance - finalBalance).to.be.closeTo(
        ethers.parseEther("0.1") + gasCost,
        ethers.parseEther("0.001") // Allow small variance for gas
      );
    });

    it("Should update number minted per address", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      await nft.connect(buyer).mint(3, { value: ethers.parseEther("0.3") });

      expect(await nft.numberMinted(buyer.address)).to.equal(3);
    });
  });

  describe("Artist Minting", function () {
    it("Should allow artist to mint for free", async function () {
      const { nft, artist, buyer } = await loadFixture(deployNahuiNFTFixture);

      await nft.connect(artist).artistMint(buyer.address, 5);

      expect(await nft.balanceOf(buyer.address)).to.equal(5);
      expect(await nft.totalMinted()).to.equal(5);
    });

    it("Should revert if non-owner tries to artist mint", async function () {
      const { nft, buyer, otherAccount } = await loadFixture(
        deployNahuiNFTFixture
      );

      await expect(
        nft.connect(buyer).artistMint(otherAccount.address, 1)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("Should respect max supply in artist mint", async function () {
      const { nft, artist, buyer } = await loadFixture(deployNahuiNFTFixture);

      await expect(
        nft.connect(artist).artistMint(buyer.address, 101)
      ).to.be.revertedWithCustomError(nft, "ExceedsMaxSupply");
    });
  });

  describe("Airdrop", function () {
    it("Should allow batch airdrop to multiple addresses", async function () {
      const { nft, artist, buyer, otherAccount } = await loadFixture(
        deployNahuiNFTFixture
      );

      await nft
        .connect(artist)
        .airdrop([buyer.address, otherAccount.address], [3, 2]);

      expect(await nft.balanceOf(buyer.address)).to.equal(3);
      expect(await nft.balanceOf(otherAccount.address)).to.equal(2);
      expect(await nft.totalMinted()).to.equal(5);
    });

    it("Should revert on array length mismatch", async function () {
      const { nft, artist, buyer, otherAccount } = await loadFixture(
        deployNahuiNFTFixture
      );

      await expect(
        nft.connect(artist).airdrop([buyer.address, otherAccount.address], [3])
      ).to.be.revertedWith("Length mismatch");
    });

    it("Should respect max supply in airdrop", async function () {
      const { nft, artist, buyer, otherAccount } = await loadFixture(
        deployNahuiNFTFixture
      );

      await expect(
        nft
          .connect(artist)
          .airdrop([buyer.address, otherAccount.address], [60, 50])
      ).to.be.revertedWithCustomError(nft, "ExceedsMaxSupply");
    });
  });

  describe("Metadata", function () {
    it("Should return correct tokenURI", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      await nft.connect(buyer).mint(1, { value: ethers.parseEther("0.1") });

      expect(await nft.tokenURI(1)).to.equal("ipfs://QmTest/1");
    });

    it("Should allow owner to update base URI", async function () {
      const { nft, artist, buyer } = await loadFixture(deployNahuiNFTFixture);

      await nft.connect(buyer).mint(1, { value: ethers.parseEther("0.1") });

      await nft.connect(artist).setBaseURI("ipfs://QmNewCID/");

      expect(await nft.tokenURI(1)).to.equal("ipfs://QmNewCID/1");
    });

    it("Should emit event when base URI is updated", async function () {
      const { nft, artist } = await loadFixture(deployNahuiNFTFixture);

      await expect(nft.connect(artist).setBaseURI("ipfs://QmNewCID/"))
        .to.emit(nft, "BaseURIUpdated")
        .withArgs("ipfs://QmNewCID/");
    });
  });

  describe("Configuration", function () {
    it("Should allow owner to update mint price", async function () {
      const { nft, artist } = await loadFixture(deployNahuiNFTFixture);

      await nft.connect(artist).setMintPrice(ethers.parseEther("0.2"));

      expect(await nft.mintPrice()).to.equal(ethers.parseEther("0.2"));
    });

    it("Should emit event when mint price is updated", async function () {
      const { nft, artist } = await loadFixture(deployNahuiNFTFixture);

      await expect(nft.connect(artist).setMintPrice(ethers.parseEther("0.2")))
        .to.emit(nft, "MintPriceUpdated")
        .withArgs(ethers.parseEther("0.2"));
    });

    it("Should allow owner to toggle minting", async function () {
      const { nft, artist } = await loadFixture(deployNahuiNFTFixture);

      expect(await nft.mintingActive()).to.be.true;

      await nft.connect(artist).toggleMinting();
      expect(await nft.mintingActive()).to.be.false;

      await nft.connect(artist).toggleMinting();
      expect(await nft.mintingActive()).to.be.true;
    });
  });

  describe("Royalties", function () {
    it("Should return correct royalty info", async function () {
      const { nft, royaltyReceiver } = await loadFixture(deployNahuiNFTFixture);

      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await nft.royaltyInfo(1, salePrice);

      expect(receiver).to.equal(royaltyReceiver.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.05")); // 5%
    });

    it("Should allow owner to update default royalty", async function () {
      const { nft, artist, otherAccount } = await loadFixture(
        deployNahuiNFTFixture
      );

      await nft.connect(artist).setDefaultRoyalty(otherAccount.address, 1000); // 10%

      const [receiver, royaltyAmount] = await nft.royaltyInfo(
        1,
        ethers.parseEther("1")
      );

      expect(receiver).to.equal(otherAccount.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.1")); // 10%
    });

    it("Should revert if royalty fee exceeds 100%", async function () {
      const { nft, artist, otherAccount } = await loadFixture(
        deployNahuiNFTFixture
      );

      await expect(
        nft.connect(artist).setDefaultRoyalty(otherAccount.address, 10001)
      ).to.be.revertedWithCustomError(nft, "InvalidRoyaltyFee");
    });
  });

  describe("Withdrawal", function () {
    it("Should allow artist to withdraw funds", async function () {
      const { nft, artist, buyer } = await loadFixture(deployNahuiNFTFixture);

      // Buyer mints
      await nft.connect(buyer).mint(5, { value: ethers.parseEther("0.5") });

      const initialArtistBalance = await ethers.provider.getBalance(
        artist.address
      );

      // Artist withdraws
      const tx = await nft.connect(artist).withdraw();
      const receipt = await tx.wait();
      const gasCost = receipt!.gasUsed * receipt!.gasPrice;

      const finalArtistBalance = await ethers.provider.getBalance(
        artist.address
      );

      // Artist should have received funds minus gas
      expect(finalArtistBalance - initialArtistBalance).to.equal(
        ethers.parseEther("0.5") - gasCost
      );
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      await expect(
        nft.connect(buyer).withdraw()
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("ERC-721A Gas Efficiency", function () {
    it("Should save gas on batch minting vs single mints", async function () {
      const { nft, buyer } = await loadFixture(deployNahuiNFTFixture);

      // Mint 5 individually
      const NahuiNFT2 = await ethers.getContractFactory("NahuiNFT");
      const nft2 = await NahuiNFT2.deploy(
        "Nahui Art 2",
        "NAHUI2",
        "ipfs://QmTest/",
        100,
        ethers.parseEther("0.1"),
        buyer.address,
        buyer.address,
        500
      );

      let totalGasIndividual = 0n;
      for (let i = 0; i < 5; i++) {
        const tx = await nft2
          .connect(buyer)
          .mint(1, { value: ethers.parseEther("0.1") });
        const receipt = await tx.wait();
        totalGasIndividual += receipt!.gasUsed;
      }

      // Mint 5 in batch
      const txBatch = await nft
        .connect(buyer)
        .mint(5, { value: ethers.parseEther("0.5") });
      const receiptBatch = await txBatch.wait();
      const gasBatch = receiptBatch!.gasUsed;

      // Batch should use significantly less gas
      console.log(`Individual mints gas: ${totalGasIndividual.toString()}`);
      console.log(`Batch mint gas: ${gasBatch.toString()}`);
      console.log(
        `Gas savings: ${((Number(totalGasIndividual - gasBatch) / Number(totalGasIndividual)) * 100).toFixed(2)}%`
      );

      expect(gasBatch).to.be.lessThan(totalGasIndividual);
    });
  });

  describe("ERC-165 Support", function () {
    it("Should support ERC-721 interface", async function () {
      const { nft } = await loadFixture(deployNahuiNFTFixture);

      // ERC-721 interface ID
      expect(await nft.supportsInterface("0x80ac58cd")).to.be.true;
    });

    it("Should support ERC-2981 (royalty) interface", async function () {
      const { nft } = await loadFixture(deployNahuiNFTFixture);

      // ERC-2981 interface ID
      expect(await nft.supportsInterface("0x2a55205a")).to.be.true;
    });
  });
});
