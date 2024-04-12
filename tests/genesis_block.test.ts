import fs from "fs";

function getLatestBlockInfo() {
  const latestBlockInfoFilePath = process.cwd() + `/blockchain_data/indexes/latestblockinfo.json`;
  try {
      const data = fs.readFileSync(latestBlockInfoFilePath, 'utf8');
      return {cb: "success", data: JSON.parse(data)}
  } catch (err: any) {
      console.error(`Error reading latest block info: ${err.message}`);
      return {cb: "error", data: {}}
  }
}

function isValidGenesisBlock(hash: string) {
  try {

      const latestblockinfoFileData = getLatestBlockInfo();

      if (latestblockinfoFileData.cb === "success") {
          const latestANDPreviousForkBlockInfo = latestblockinfoFileData.data.main || {};
          if ((latestANDPreviousForkBlockInfo !== null) && (latestANDPreviousForkBlockInfo !== undefined)) {

              const previousBlockInfo = latestANDPreviousForkBlockInfo.previousBlockInfo || null;
              const latestBlockInfo = latestANDPreviousForkBlockInfo.latestBlockInfo || null;

              if ((previousBlockInfo !== null) && (previousBlockInfo !== undefined)) {
                  if (typeof(previousBlockInfo) === "object") {
                      if (((previousBlockInfo.index !== null) && (previousBlockInfo.index !== undefined)) && ((previousBlockInfo.hash !== null) && (previousBlockInfo.hash !== undefined))) {
                          return { isGenesisBlock: false, isForkOFGenesisBlock: false };
                      }
                  }
              }
              if ((latestBlockInfo !== null) && (latestBlockInfo !== undefined)) {
                  if (typeof(latestBlockInfo) === "object") {
                      if (((latestBlockInfo.index !== null) && (latestBlockInfo.index !== undefined)) && ((latestBlockInfo.hash !== null) && (latestBlockInfo.hash !== undefined))) {
                          console.log(`DEBUG: latestBlockInfo.hash: ${latestBlockInfo.hash} hash: ${hash}`);
                          if (latestBlockInfo.hash !== hash)
                              return { isGenesisBlock: true, isForkOFGenesisBlock: true };
                          return { isGenesisBlock: false, isForkOFGenesisBlock: false };
                      }
                  }
              }

          }
      }
  
      return { isGenesisBlock: true, isForkOFGenesisBlock: false };
  } catch (err: any) {
      console.error(`Error checking for existing blocks: ${err.message}`);
      return { isGenesisBlock: false, isForkOFGenesisBlock: false };
  }
}


describe('Blockchain Testing', () => {
    test('Test isValidGenesisBlock', () => {
        const result = isValidGenesisBlock("0000006f289771aba5d293c448ed782f59a33bd293d96e41c535f0155f5c22d4");
        expect(JSON.stringify(result)).toBe(JSON.stringify({ isGenesisBlock: true, isForkOFGenesisBlock: false }));
    });
});