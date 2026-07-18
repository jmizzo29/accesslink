# BuildAnything Spark — Access4All submission pack

Fill the hackathon form from this page. Update the `TODO` rows before submit.

| Field | Value |
|-------|--------|
| **Name** | Access4All |
| **Description** | Accessible travel search with feature filters, need matching, and Monad-anchored verification. |
| **Problem** | I kept booking “accessible” hotels that still had steps or no roll-in shower. Marketing labels waste hours and create real trip risk; tips die in review threads. |
| **Solution** | Filter by real accessibility features, match plain-English needs, and anchor community verifications on Monad so trust is public and durable — not a screenshot in a chat. |
| **Project URL** | https://www.restarto.ai/portfolio/access4all/app/ |
| **Landing** | https://www.restarto.ai/portfolio/access4all/ |
| **Github repo** | https://github.com/jmizzo29/accesslink |
| **Category** | **Testnet** |
| **Contract address** | `0x26a0383b3E81e0f81261ecE6aadB3aAC8022195E` |
| **Explorer** | https://testnet.monadvision.com/address/0x26a0383b3E81e0f81261ecE6aadB3aAC8022195E |
| **Chain** | Monad Testnet · chainId `10143` |
| **Demo video** | TODO — record ≤3 min: landing → demo → search → wallet Anchor → explorer tx |
| **Post URL** | TODO — public social post for “Most viral solution” |

## Judge path (90 seconds)

1. Open Project URL → **Start judge demo**
2. Search New York + roll-in shower
3. Match needs: “roll-in shower and elevator”
4. **Run verification** with MetaMask on Monad testnet (add network if prompted)
5. Activity → open explorer link → confirm contract write

## Onchain component

- Contract: `contracts/AccessLinkVerified.sol`
- Deploy manifest: `deploy/monad-contract.json`
- Browser wallet writes work without a private server key (MetaMask → `submitRecord` + `verifyRecord`)

## Practical impact pitch (one line)

“This saved me from another inaccessible booking — I filter the features that matter and pin the verification on Monad.”
