#!/usr/bin/env bash
# UUPS-upgrade existing DashRunner proxy on Celo mainnet (chain 42220).
# Preserves proxy address, on-chain state, and NFT minter wiring.
#
# Env:
#   PRIVATE_KEY         — must be the same wallet that owns the proxy ( Ownable )
#   DASHRUNNER_PROXY    — ERC1967 proxy address users interact with (e.g. 0x44fB...)
#   RPC_URL             — optional
#   ETHERSCAN_API_KEY   — optional; verifies the new implementation on Celoscan
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

_load_deploy_keys_from_env_file() {
  local f="$ROOT/.env"
  [[ -f "$f" ]] || return 0
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*$ ]] && continue
    if [[ "$line" =~ ^(RPC_URL|PRIVATE_KEY|ETHERSCAN_API_KEY|DASHRUNNER_PROXY)= ]]; then
      export "${line%%=*}"="${line#*=}"
    fi
  done <"$f"
}

_load_deploy_keys_from_env_file

: "${PRIVATE_KEY:?Set PRIVATE_KEY}"
: "${DASHRUNNER_PROXY:?Set DASHRUNNER_PROXY to your DashRunner ERC1967 proxy address}"

RPC_URL="${RPC_URL:-https://forno.celo.org}"

echo "RPC_URL=$RPC_URL"
echo "DASHRUNNER_PROXY=$DASHRUNNER_PROXY"

chain_id=$(cast chain-id --rpc-url "$RPC_URL")
if [[ "$chain_id" != "42220" ]]; then
  echo "error: expected Celo mainnet chain id 42220, got $chain_id" >&2
  exit 1
fi

VERIFY_ARGS=()
if [[ -n "${ETHERSCAN_API_KEY:-}" ]]; then
  VERIFY_ARGS=(--verify --etherscan-api-key "$ETHERSCAN_API_KEY")
fi

forge script script/UpgradeDashRunner.s.sol:UpgradeDashRunner \
  --rpc-url "$RPC_URL" \
  --broadcast \
  --slow \
  -vvvv \
  "${VERIFY_ARGS[@]}"
