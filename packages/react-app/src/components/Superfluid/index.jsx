import React from "react";
import Super from "./Super";
import SuperfluidGraph from "./SuperfluidGraph";

export default function Superfluid({
   address,
   provider,
   chainId,
   tokens,
   mainnetProvider
}) {

   return (
     <SuperfluidGraph
        address={address}
        provider={provider}
        tokenList={tokens}
        chainId={chainId}
      />
   );

   return (
      <Super
         mainnetProvider={mainnetProvider}
         address={address}
         network={network}
         provider={provider}
         tokenList={tokens}
         chainId={chainId}
      />
   )
}



