import MoralisType from "moralis";
import { store } from "../store";
import erc20ABI from '../abi/erc20.json'
import erc721ABI from '../abi/erc721.json'
import { Token } from "../store/prices";
import { NFT } from "../store/nfts";
import { etherToWei } from "./ethereum";
import { MULTI_SEND_CONTRACT_ADDRESSES } from "./multiSendContractAddress";


export const checkIfNeedApprove = async (web3: MoralisType.Web3 | null, account: string | null, chainId: string | null, token: Token | NFT, amount?: string) => {
    if (web3 && chainId) {
        const MULTI_SEND_CONTRACT_ADDRESS = MULTI_SEND_CONTRACT_ADDRESSES[chainId];

        const { setApproveToken, addToNeedsApproveMap, totals } = store.batch;
        if (token.type === "erc20") {
            const erc20 = token as Token
            const erc20Contract = new web3.eth.Contract(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                erc20ABI as any,
                erc20.token_address
            );
            const allowance = await erc20Contract.methods
                .allowance(account, MULTI_SEND_CONTRACT_ADDRESS)
                .call();

            const total = (totals[erc20.symbol]?.total || 0) + (Number(amount) || 0);
            if (+allowance < +etherToWei(web3, total, erc20.decimals)) {
                addToNeedsApproveMap(erc20.token_address, erc20);
            } else {
                setApproveToken(erc20.token_address);
            }
        }
        if (token.type === "erc721") {
            const erc721 = token as NFT
            const erc721Contract = new web3.eth.Contract(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                erc721ABI as any,
                erc721.token_address
            );
            const isApprovedForAll = await erc721Contract.methods
                .isApprovedForAll(account, MULTI_SEND_CONTRACT_ADDRESS)
                .call();

            if (!isApprovedForAll) {
                addToNeedsApproveMap(erc721.token_address, erc721);
            } else {
                setApproveToken(erc721.token_address);
            }
        }
    }
};

export const approveAsset = (web3: MoralisType.Web3 | null, account: string | null, token: Token | NFT, spender: string ) => {
    const { setApproveToken } = store.batch;
    const { approveCommand } = store.commands
    if(web3) {
        if (token.type === "erc20") {
            const erc20Contract = new web3.eth.Contract(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                erc20ABI as any,
                token.token_address
            );
            // need to change to the object
            erc20Contract.methods
                .approve(
                    spender,
                    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
                )
                .send({ from: account })
                .on("receipt", (receipt: any) => {
                    if (receipt.status) {
                        setApproveToken(token.token_address);
                    }
                })
                .on("error", () => {
                    approveCommand.setFailed();
                });
        }
        if (token.type === "erc721") {
            const erc721Contract = new web3.eth.Contract(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                erc721ABI as any,
                token.token_address
            );
            // need to change to the object
            erc721Contract.methods
                .setApprovalForAll(
                    spender,
                    true
                )
                .send({ from: account })
                .on("receipt", (receipt: any) => {
                    if (receipt.status) {
                        setApproveToken(token.token_address);
                    }
                })
                .on("error", () => {
                    approveCommand.setFailed();
                });
        }
    }
}