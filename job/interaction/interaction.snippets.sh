#!/bin/bash

RECORDING_ORCALE_ADDRESS="moa1w73dll00g2q96rqvj7gms00uey5s94z9fqjjj9ecgx2tpeyh8hxqv6wvcn"
REPUATION_ORACLE_ADDRESS="moa17rw0ugxew767mwluxwu75gqg3m500qu7ktxfufn8tsf5dxxh6ddsutzym7"
OWNER_ADDRESS="moa19m5vyshr2rn4dmjju7gwpqa9jyl4lwp45awuctpmrk2tq2657pyqr775kj"

WASM_PATH="../output/job.wasm"
WALLET_PEM="~/moa-wallets/JonesTest.pem"
PROXY="https://testnet-gateway.dharitri.com"
CHAIN_ID="T"
TOKEN=HPX-e3d85c

# Deploys job contract to testnet
deployJob() {
  CANCELLER="0x$(moapy wallet bech32 --decode ${OWNER_ADDRESS})"
  DURATION="0x93A80"
  echo "\n>> Canceller address: ${CANCELLER}"
  echo ">> Duration: ${DURATION}\n"

  moapy --verbose contract deploy --recall-nonce \
      --pem=${WALLET_PEM} \
      --gas-limit=600000000 \
      --proxy=${PROXY} --chain=${CHAIN_ID} \
      --bytecode=${WASM_PATH} \
      --arguments str:${TOKEN} ${CANCELLER} ${DURATION} \
      --outfile="deploy-template-job.interaction.json" \
      --send || return

}

deposit() {

  METHOD_NAME=str:deposit
  JOB_ADDRESS="0x$(moapy wallet bech32 --decode $1)"
  TOKEN_AMOUNT="0x65536"

  echo ">> Calling contract: $1"
  echo ">> Amount to deposit: ${TOKEN_AMOUNT}"
  moapy --verbose contract call $1 --recall-nonce \
      --pem=${WALLET_PEM} \
      --proxy=${PROXY} --chain=${CHAIN_ID} \
      --gas-limit=5000000 \
      --function="DCTTransfer" \
      --outfile="deposit-job.interaction.json" \
      --arguments str:${TOKEN} ${TOKEN_AMOUNT} ${METHOD_NAME} \
      --send || return
}