import React from "react";
import Super from "./Super";
import SuperfluidGraph from "./SuperfluidGraph";

export default function Superfluid({
   address,
   network,
   provider,
   chainId,
   tokens,
   mainnetProvider
}) {

   return (
     <SuperfluidGraph
         network={network}
         provider={provider}
         tokenList={tokens}
         chainId={chainId}
      />
   );
   return (
      <Super
         address={address}
         provider={provider}
         mainnetProvider={mainnetProvider}
         chainId={chainId}
         tokens={tokens}
      />
      )
}
