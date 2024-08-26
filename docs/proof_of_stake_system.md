

When a Staker goes Online it is added to the Pool of active Stakers 

the next time a new committee is created by a random algorithm it can be included.

in this committee there are 32 slots.

at each slot a block proposer is choosen by a random algorithm and a the rest are attesters

the porposer then creates a block and send it to the rest of attesters

these attesters create a signature with there agreement on this block and send it back to the proposer.

the proposer now send it to the network if not they send just the emtpy slot with the slashing data

the network then chose if the block is valid whoi gets slahed.



Clock:


Clock starts:


Proposer propose it:


Note: May include a system with extra Attestor / Proposer Slash Reqeusts that will be its own consens.

Validator Timeline:

0s:
    Block Proposed by Proposer

5s:
    Lastests Time to Vote for a Validator.
    If Block was not proposed or inncorrect he votes for disagree at this time.

10s:
    All Votes have to be recived.
    Calculating next Commitee based on the 
