#!/usr/bin/env bash
# Deploy DashRunner (proxy + NFT) to Celo mainnet (chain id 42220) and verify on Celoscan.
#
# Env (or only these keys in contract/.env):
#   RPC_URL             — e.g. https://forno.celo.org or https://rpc.ankr.com/celo
#   PRIVATE_KEY         — funded deployer; becomes Ownable owner
#   ETHERSCAN_API_KEY   — from https://celoscan.io/myapikey (used as Celoscan API key)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

_load_deploy_keys_from_env_file() {
  local f="$ROOT/.env"
  [[ -f "$f" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    if [[ "$line" =~ ^(RPC_URL|PRIVATE_KEY|ETHERSCAN_API_KEY)= ]]; then
      export "${line%%=*}"="${line#*=}"
    fi
  done <"$f"
}

_load_deploy_keys_from_env_file

: "${PRIVATE_KEY:?Set PRIVATE_KEY or add it to contract/.env}"
: "${ETHERSCAN_API_KEY:?Set ETHERSCAN_API_KEY or add it to contract/.env for --verify}"

RPC_URL="${RPC_URL:-https://forno.celo.org}"

echo "RPC_URL=$RPC_URL"
chain_id=$(cast chain-id --rpc-url "$RPC_URL")
if [[ "$chain_id" != "42220" ]]; then
  echo "error: expected Celo mainnet chain id 42220, got $chain_id (wrong RPC_URL?)" >&2
  exit 1
fi

forge script script/DeployDashRunner.s.sol:DeployDashRunner \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --verify \
  --etherscan-api-key "$ETHERSCAN_API_KEY" \
  --slow \
  -vvvv
