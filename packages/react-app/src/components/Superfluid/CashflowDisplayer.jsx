import React, {useEffect, useState} from "react";
import { Divider } from "antd";

import { Address } from "../../components";

// displays Superfluid inflows, outflows and netflows for a given user and token
export default function CashflowDisplayer({ sfUser, mainnetProvider, tokens }) {
  const [details, setDetails] = useState();
  const [errMsg, setErrMsg] = useState();

  // load cash flow details on user change
  useEffect(async () => {
    for (const token of tokens) {
      if (sfUser && sfUser.hasOwnProperty(token)) {
        try {
          const det = await sfUser[token].details();
          setDetails(prevState => {
            return {
              ...prevState,
              [token]: det,
            };
          });
          setErrMsg("");
        } catch (err) {
          setErrMsg(err.toString());
        }
      }
    }
  }, [sfUser]);

  if (!sfUser) {
    return <h1>...</h1>;
  }

  const template = [];
  for (const [token, _] of Object.entries(sfUser)) {
    if (
      details &&
      details.hasOwnProperty(token) &&
      details[token].hasOwnProperty("cfa") &&
      details[token].cfa.hasOwnProperty("flows")
    ) {
      // generate inflow and outflow display templates
      const flowTypes = ["inFlows", "outFlows"];

      for (const flowType of flowTypes) {
        const flows = details[token].cfa.flows[flowType];
        template.push(
          <div>
            <h3>
              {token} {flowType}
            </h3>
            {errMsg}
          </div>,
        );

        if (flows && flows.length) {
          for (const flow of flows) {
            template.push(
              <div>
                <h4>Sender</h4>
                <Address ensProvider={mainnetProvider} address={flow.sender} fontSize={16} />
                <h4>Receiver</h4>
                <Address ensProvider={mainnetProvider} address={flow.receiver} fontSize={16} />
                <h4>Flow Rate</h4>
                {flow.flowRate}
              </div>,
            );
          }
        } else {
          template.push(<p>No {flowType}</p>);
        }
        template.push(<Divider />);
      }

      template.push(
        <div>
          <h3>{token} netflow</h3>
          {details[token].cfa.netFlow}
          <Divider />
        </div>,
      );
    }
  }
  return template;
}
