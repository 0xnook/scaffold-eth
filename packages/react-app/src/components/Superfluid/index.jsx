import React from "react";
import Super from "./Super";

export default function Superfluid({
   address,
   provider,
   chainId,
   tokens,
   mainnetProvider
}) {
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
