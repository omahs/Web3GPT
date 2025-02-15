import chains from "@/lib/chains.json";
import { ChainData } from "@/lib/types";
import { Chain } from "viem";
import { distance } from "fastest-levenshtein";

export const API_URLS: Record<Chain["name"], string> = {
    'Mantle Testnet': 'https://explorer.testnet.mantle.xyz/api',
    'Ethereum': 'https://api.etherscan.io/api',
    'Goerli': 'https://api-goerli.etherscan.io/api',
    'Sepolia': 'https://api-sepolia.etherscan.io/api',
    'Arbitrum One': 'https://api.arbiscan.io/api',
    'Arbitrum Goerli': 'https://api-goerli.arbiscan.io/api',
    'Polygon Mainnet': 'https://api.polygonscan.com/api',
    'Mumbai': 'https://api-testnet.polygonscan.com/api',
    'Optimism': 'https://api-optimistic.etherscan.io/api',
    'Optimism Goerli Testnet': 'https://api-goerli.optimistic.etherscan.io/api',
}

export const API_KEYS: Record<Chain["name"], string | undefined> = {
    'Mantle Testnet': '',
    'Ethereum': process.env.ETHEREUM_EXPLORER_API_KEY,
    'Goerli': process.env.ETHEREUM_EXPLORER_API_KEY,
    'Sepolia': process.env.ETHEREUM_EXPLORER_API_KEY,
    'Arbitrum One': process.env.ARBITRUM_EXPLORER_API_KEY,
    'Arbitrum Goerli': process.env.ARBITRUM_EXPLORER_API_KEY,
    'Polygon Mainnet': process.env.POLYGON_EXPLORER_API_KEY,
    'Mumbai': process.env.POLYGON_EXPLORER_API_KEY,
    'Optimism': process.env.OPTIMISM_EXPLORER_API_KEY,
    'Optimism Goerli Testnet': process.env.OPTIMISM_EXPLORER_API_KEY,
}

export const createViemChain = (chain: string): Chain => {
    // get the chain object from the chains.json file. Direct match || partial match
    if (!chain) {
        chain = 'Mantle Testnet';
    }
    let chainMatch = chains.find((item) => item.name.toLowerCase() === chain.toLowerCase())

    if (!chainMatch) {
        let minDistance = Infinity;
        let bestMatch;

        chains.forEach((chainItem) => {
            const formattedChain = chainItem.name.toLowerCase().replace(/[-_]/g, "");
            const formattedInput = chain.toLowerCase().replace(/[-_]/g, "");
            const dist = distance(formattedInput, formattedChain);

            if (dist < minDistance) {
                minDistance = dist;
                bestMatch = chainItem;
            }
        });

        chainMatch = bestMatch || chains.find((item) => item.name === 'Mantle Testnet')! // fallback to Mantle Testnet
    }

    const viemChain: Chain | undefined = {
        id: chainMatch.chainId,
        name: chainMatch.name,
        network: chainMatch.name.toLowerCase(),
        nativeCurrency: {
            name: chainMatch.nativeCurrency.name,
            symbol: chainMatch.nativeCurrency.symbol,
            decimals: chainMatch.nativeCurrency.decimals,
        },
        rpcUrls: {
            public: { http: chainMatch.rpc },
            default: { http: chainMatch.rpc },
        },
        blockExplorers: chainMatch.explorers && {
            etherscan: {
                name: chainMatch.explorers[0].name,
                url: chainMatch.explorers[0].url,
            },
            default: {
                name: chainMatch.explorers[0].name,
                url: chainMatch.explorers[0].url,
            },
        },
    };

    return viemChain;
};

export const getRpcUrl = (viemChain: Chain): string | undefined => {
    const rpcUrl: string = viemChain?.rpcUrls.default.http[0]?.replace(
        "${INFURA_API_KEY}",
        process.env.INFURA_API_KEY || ""
    );
    return rpcUrl;
}

export const getExplorerUrl = (viemChain: Chain): string | undefined => {
    return viemChain?.blockExplorers?.default.url;
}