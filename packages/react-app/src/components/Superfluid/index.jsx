import React, {useState} from "react";
import SuperfluidGraph from "./SuperfluidGraph";

export default function Superfluid({
   address,
   provider,
   chainId,
   mainnetProvider
}) {

  // user added recipients
  const [recipients, setRecipients] = useState(new Set());

  // method to handle user recipient submission, throws error if user tries to add himself as recipient
  const addRecipientHandler = (value) => {
    const recipient = value.address.toLowerCase();
    setRecipients(new Set(recipients).add(recipient))
  }

   return (
      <div>
         <SuperfluidGraph
           address={address}
           provider={provider}
           chainId={chainId}
           mainnetProvider={mainnetProvider}
           addRecipientHandler={addRecipientHandler}
         />

         {[...recipients].map(recipient => (
            <div>
               <SuperfluidGraph
                 address={recipient}
                 provider={provider}
                 chainId={chainId}
                 mainnetProvider={mainnetProvider}
                 isRecipient
               />
            </div>
         ))}
      </div>
   );
}



