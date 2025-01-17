import React, {useState} from "react"
import * as sdk from "@onflow/sdk"
import * as t from "@onflow/types"
import {signingFunction} from "./utils/signing-function.js"
import {authorizationFunction} from "./utils/authorization-function.js"

export const Transaction = () => {
  const [result, setResult] = useState(null)

  const run = async () => {

    /*

      Transaction
      -----------

      Transactions are declared by building an interaction and specifying a Cadence transaction within it.

      Refer to https://github.com/onflow/flow-js-sdk/blob/master/packages/response/README.md to see the shape of response
      for a Transaction interaction.

      Transactions also require other pieces of information as so they can be sent and executed.

      Proposer, Payer and Authorizers
      --------------------------------

      Transactions require a proposer, payer and an array of authorizers.

      - The proposer specifies the Account for which the sequence number of one of it's keys will be used and incremented by this transaction.
      - The payer specifies the Account for which will pay for the transaction.
      - Each authorizer specifies an AuthAccount which can be used within the Cadence code of the transaction.

      A proposer, authorizer and payer are specified using the sdk.authorization method.
      The sdk.authorization method consumes an account address, a signing function, and a keyId.

      The signing function is a function with an interface as such:

          const signingFunction = ({
            message,          // The message to be signed.
            addr,             // The address specified in the authorization.
            keyId,            // The keyId specified in the authorization.
            roles: {      
              proposer,       // Denotes if this authorization is acting as a proposer.
              authorizer,     // Denotes if this authorization is acting as a authorizer.
              payer,          // Denotes if this authorization is acting as a payer.
            },
            interaction,      // The full interaction object such that the message can be reconstructed if desired, for security.
          }) => { ... }

      The signing function must return an object as such:

          return {
            addr,       // The address of the Flow Account which produced this signature.
            keyId,      // The keyId used to produce the signature.
            signature   // A hex encoded string of the signature produced by this function.
          }
      
      The signing function produces a signature of the message using the key with the keyId as specified.

      Arguments
      ---------

      Transactions may also receive arguments. Arguments are variables that are passed into a transaction.
      Specifying arguments is done by specifying an array of arguments.
      Each argument consumes a JavaScript value, and an associated Cadence type identifier.
      Cadence type identifiers can be found in the `@onflow/types`.
      
      Denoting an argument is done by calling the args and arg builder as such:

          sdk.args([ sdk.arg("my string value", t.String) ])

      Validators
      ----------

      To check that everything has gone as expected while building and resolving your transaction, validators act as a
      mechanism to check the interaction object has been formulated to your desired specification.

      Lets assume you expect only one argument to be included in this transaction interaction, a validator for such looks like:
      
          sdk.validator((ix, {Ok, Bad}) => {
            if (Object.keys(ix.arguments).length > 1) return Bad(ix, "This transaction should only have one authorization!")
            return Ok(ix)
          })

      Resolvers
      ---------

      Before a transaction interaction is ready to be sent, it must, if not yet ready, be first be passed through a sequence of resolvers.
      Resolvers gather the information necessary to finish building the finalized interaction, so it's in a state which is valid and ready to be sent to Flow.
      Note, the order of the resolvers does matter, since the result of a prior resolver may be needed for one that proceeds it.

      resolveRefBlockId({ node: "my-access-node" })   // Will populate the block id for which this transaction will be executed against if not already specified.
      resolveProposerSequenceNumber({ node: "my-access-node" })   // Will populate the proposers sequence number if not already specifies.
      resolveArguments  // Will prepare each argument such that it can be send and used with this transaction interaction.
      resolveAccounts   // Will prepare each account such that it can be used for this transaction interaction.
      resolveSignatures // Will retrieve a signature for a specified account.
      resolveValidators // Will execute each validator specified for this interaction.

    */

    const response_1 = await sdk.send(await sdk.pipe(await sdk.build([
      sdk.transaction`transaction(message: String) { prepare(acct: AuthAccount) {} execute { log(message) } }`,
      sdk.args([sdk.arg("~~ Go with the Flow ~~", t.String)]),
      sdk.payer(sdk.authorization("f8d6e0586b0a20c7", signingFunction, 0)),
      sdk.proposer(sdk.authorization("f8d6e0586b0a20c7", signingFunction, 0)),
      sdk.authorizations([sdk.authorization("f8d6e0586b0a20c7", signingFunction, 0)]),
      sdk.validator((ix, {Ok, Bad}) => {
        if (Object.keys(ix.arguments).length > 1) return Bad(ix, "This transaction should only have one argument!")
        return Ok(ix)
    })
    ]), [
      sdk.resolve([
        sdk.resolveRefBlockId({ node: "http://localhost:8080" }),
        sdk.resolveProposerSequenceNumber({ node: "http://localhost:8080" }),
        sdk.resolveArguments,
        sdk.resolveParams,
        sdk.resolveAccounts,
        sdk.resolveSignatures,
        sdk.resolveValidators,
      ]),
    ]), { node: "http://localhost:8080" })

    setResult(await sdk.decodeResponse(response_1))

    /*

      Transaction - Using an Authorization Function
      ---------------------------------------------

      In the previous example, we specified our proposer, authorizers and payer by building an authorization for each
      using sdk.authorization(...). The Flow JS-SDK also supports using an 'authorization function'. This is a function
      which, when called, resolves into an authorization that can be used as the proposer, payer or as an authorizer.

      The code below is the same as the preovious example, except sdk.payer, sdk.proposer and sdk.authorizations all consume
      authorization functions. Authorization functions can be written by 3rd parties, or yourself. 
      These specific example authorization functions resolve the sequence number for their respective 
      accounts, so we don't need the sdk.resolveProposerSequenceNumber resolver for this example.

    */

    const response_2 = await sdk.send(await sdk.pipe(await sdk.build([
      sdk.transaction`transaction(message: String) { prepare(acct: AuthAccount) {} execute { log(message) } }`,
      sdk.args([sdk.arg("~~ Go with the Flow ~~", t.String)]),
      sdk.payer(authorizationFunction),
      sdk.proposer(authorizationFunction),
      sdk.authorizations([authorizationFunction]),
      sdk.validator((ix, {Ok, Bad}) => {
        if (Object.keys(ix.arguments).length > 1) return Bad(ix, "This transaction should only have one argument!")
        return Ok(ix)
    })
    ]), [
      sdk.resolve([
        sdk.resolveRefBlockId({ node: "http://localhost:8080" }),
        sdk.resolveAccounts,
        sdk.resolveParams,
        sdk.resolveArguments,
        sdk.resolveSignatures,
        sdk.resolveValidators,
      ]),
    ]), { node: "http://localhost:8080" })

    setResult(await sdk.decodeResponse(response_2))

  }

  return (
    <div>
      <button onClick={run}>
        Run <strong>Transaction</strong>
      </button>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
