
function mineBlock(block) {
    while (
      block.hash.substring(0, mining_difficulty) !== '0'.repeat(mining_difficulty)
    ) {
      block.nonce++;
      block.hash = calculateBlockHash(block);
    }
}

module.exports = mineBlock;